// 最小复刻 shadcn/ui 的 build-registry 管线（纯 Node，零依赖）：
//
//   registry.json         ← 复刻 registry/bases/<base>/registry.ts（item 清单）
//   createStyleMap()      ← 复刻 create-style-map.ts（提取 .cn-* 块内 @apply 值）
//   transformStyleMap()   ← 复刻 transform-style-map.ts（cn-* token → 类字符串）
//   rewriteRegistryImports() ← 复刻 copyUIToStyles（registry 路径 → styles 路径）
//
// 输入：
//   - registry/bases/base/registry.json   组件清单（name/type/files/registryDependencies）
//   - registry/bases/base/**              组件源头（cn-* 占位符 + IconPlaceholder）
//   - registry/styles/style-*.css         每套 style 的 token 定义（@apply 形式）
//
// 输出：
//   styles/base-<style>/**                每个 item 每个文件一份（样式已内联）
//
// 用法：node scripts/build.mjs

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const REGISTRY_ROOT = path.join(ROOT, "registry", "bases", "base")
const REGISTRY_FILE = path.join(REGISTRY_ROOT, "registry.json")
const STYLES_DIR = path.join(ROOT, "registry", "styles")
const OUTPUT_DIR = path.join(ROOT, "styles")

const CN_TOKEN_RE = /\bcn-[a-z0-9-]+\b/g

// ---------------------------------------------------------------------------
// ① createStyleMap 的最小等价物：
//    解析 style CSS，提取每个 .cn-* 规则块内 @apply 指令的值。
//    （对应原版 extractTailwindClasses：收集块内所有 @apply 的参数）
// ---------------------------------------------------------------------------
function createStyleMap(css) {
  const map = {}

  // 去掉注释后，逐块匹配 `.cn-xxx { ... }`
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const ruleRe = /\.(cn-[a-z0-9-]+)\s*\{([^{}]*)\}/g

  for (const match of withoutComments.matchAll(ruleRe)) {
    const className = match[1]
    const block = match[2]

    // 优先提取 @apply（tailwind 形式）
    const applied = []
    const applyRe = /@apply\s+([^;]+);?/g
    for (const applyMatch of block.matchAll(applyRe)) {
      applied.push(applyMatch[1].trim().replace(/\s+/g, " "))
    }

    if (applied.length > 0) {
      map[className] = applied.join(" ")
      continue
    }

    // 向后兼容：无 @apply 时回退到普通 CSS 声明文本
    const declarations = block
      .split(";")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/\s+/g, " "))
    map[className] = `${declarations.join("; ")};`
  }

  return map
}

// ---------------------------------------------------------------------------
// ② transformStyleMap 的最小等价物：
//    把源码里所有 cn-* token 替换为 styleMap 中对应的 @apply 类字符串。
//    （正则贪婪匹配保证 cn-button-variant-default 不会先被 cn-button 截断）
// ---------------------------------------------------------------------------
function transformStyleMap(source, styleMap) {
  return source.replace(CN_TOKEN_RE, (token) => {
    const replacement = styleMap[token]
    if (replacement === undefined) {
      throw new Error(
        `Style 未定义占位符 "${token}"（base 引用了它，但 style CSS 中没有 .${token} 规则）`
      )
    }
    return replacement
  })
}

// ---------------------------------------------------------------------------
// ③ copyUIToStyles 的最小等价物：
//    registry 内部路径 → styles 产物路径（产物目录名带 base- 前缀）：
//      @/registry/bases/base/ui/xxx       → @/styles/base-<style>/ui/xxx（ui 互引）
//      @/app/(create)/components/icon-placeholder
//                                         → @/styles/base-<style>/components/icon-placeholder
//      @/registry/bases/base/lib/utils    → @/lib/utils
//      其余 @/registry/bases/base/        → @/
// ---------------------------------------------------------------------------
function rewriteRegistryImports(source, outputStyleName) {
  return source
    .replaceAll(
      "@/registry/bases/base/ui/",
      `@/styles/${outputStyleName}/ui/`
    )
    .replaceAll(
      "@/app/(create)/components/icon-placeholder",
      `@/styles/${outputStyleName}/components/icon-placeholder`
    )
    .replaceAll("@/registry/bases/base/lib/utils", "@/lib/utils")
    .replaceAll("@/registry/bases/base/", "@/")
}

// ---------------------------------------------------------------------------
// 验证：产物字符串必须与 style 定义"对应上"（无残留占位符）
// ---------------------------------------------------------------------------
function verifyTokens(fileLabel, output) {
  const leftovers = output.match(CN_TOKEN_RE) ?? []
  if (leftovers.length > 0) {
    throw new Error(
      `[${fileLabel}] 产物中残留未替换占位符: ${leftovers.join(", ")}`
    )
  }
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY_FILE, "utf8"))
  const styleFiles = (await readdir(STYLES_DIR))
    .filter((f) => f.startsWith("style-") && f.endsWith(".css"))
    .sort()

  let totalFiles = 0

  for (const styleFile of styleFiles) {
    const styleName = styleFile.replace(/^style-/, "").replace(/\.css$/, "")
    const outputStyleName = `base-${styleName}`
    const css = await readFile(path.join(STYLES_DIR, styleFile), "utf8")
    const styleMap = createStyleMap(css)

    for (const item of registry.items) {
      for (const file of item.files) {
        const sourcePath = path.join(REGISTRY_ROOT, file.path)
        const source = await readFile(sourcePath, "utf8")

        const replaced = transformStyleMap(source, styleMap)
        const output = rewriteRegistryImports(replaced, outputStyleName)

        const outFile = path.join(OUTPUT_DIR, outputStyleName, file.path)
        await mkdir(path.dirname(outFile), { recursive: true })
        await writeFile(outFile, output, "utf8")

        verifyTokens(
          `${outputStyleName}/${file.path}`,
          output
        )
        totalFiles++
      }
    }
    console.log(`✅ styles/${outputStyleName}/  (${registry.items.length} items)`)
  }

  // 同一 style 下三份产物两两不同（证明 style 真正生效）
  const samples = {}
  for (const styleFile of styleFiles) {
    const styleName = styleFile.replace(/^style-/, "").replace(/\.css$/, "")
    samples[styleName] = await readFile(
      path.join(OUTPUT_DIR, `base-${styleName}`, "ui", "button-group.tsx"),
      "utf8"
    )
  }
  const names = Object.keys(samples)
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (samples[names[i]] === samples[names[j]]) {
        throw new Error(`产物 base-${names[i]} 与 base-${names[j]} 完全相同！`)
      }
    }
  }

  console.log(`\n✅ 构建完成：${totalFiles} 个文件，3 套 style 互不相同，无残留 cn-* 占位符。`)
}

main().catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
