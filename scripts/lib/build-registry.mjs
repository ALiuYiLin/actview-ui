// build-registry 核心（从 scripts/build.mjs 抽取，供 CLI 与测试复用）
//   createStyleMap()      ← 复刻 create-style-map.ts（提取 .cn-* 块内 @apply 值）
//   transformStyleMap()   ← 复刻 transform-style-map.ts（cn-* token → 类字符串）
//   rewriteRegistryImports() ← 复刻 copyUIToStyles（registry 路径 → styles 路径）
//   buildRegistry()       ← 整条构建管线
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)

const CN_TOKEN_RE = /\bcn-[a-z0-9-]+\b/g

// ---------------------------------------------------------------------------
// ① createStyleMap：解析 style CSS，提取每个 .cn-* 规则块内 @apply 指令的值。
//    （对应原版 extractTailwindClasses：收集块内所有 @apply 的参数）
// ---------------------------------------------------------------------------
export function createStyleMap(css) {
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
// ② transformStyleMap：把源码里所有 cn-* token 替换为 styleMap 中对应的类字符串。
// ---------------------------------------------------------------------------
export function transformStyleMap(source, styleMap) {
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
// ③ rewriteRegistryImports：registry 内部路径 → styles 产物路径
// ---------------------------------------------------------------------------
export function rewriteRegistryImports(source, outputStyleName) {
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
export function verifyTokens(fileLabel, output) {
  const leftovers = output.match(CN_TOKEN_RE) ?? []
  if (leftovers.length > 0) {
    throw new Error(
      `[${fileLabel}] 产物中残留未替换占位符: ${leftovers.join(", ")}`
    )
  }
}

// ---------------------------------------------------------------------------
// buildSemanticRegistry：路径②（自由切换预览）产物
//   - 组件：cn-* 占位符**保留**（不展开），import 重写为 styles/semantic 体系
//   - 样式表：全部 style 的作用域规则合并为 styles/semantic/styles.css
//     用户侧 body 挂 style-<name> class 即切换整套视觉（同 shadcn 文档站机制）
// ---------------------------------------------------------------------------
export async function buildSemanticRegistry(options = {}) {
  const root = options.root ?? DEFAULT_ROOT
  const registryRoot = path.join(root, "registry", "bases", "base")
  const registryFile = path.join(registryRoot, "registry.json")
  const stylesDir = path.join(root, "registry", "styles")
  const outputDir = path.join(root, "styles", "semantic")
  const silent = options.silent ?? false

  const registry = JSON.parse(await readFile(registryFile, "utf8"))
  const styleFiles = (await readdir(stylesDir))
    .filter((f) => f.startsWith("style-") && f.endsWith(".css"))
    .sort()

  const written = []

  // 组件：cn-* 保留，只重写 import
  for (const item of registry.items) {
    for (const file of item.files) {
      const sourcePath = path.join(registryRoot, file.path)
      const source = await readFile(sourcePath, "utf8")
      const output = rewriteRegistryImports(source, "semantic")

      const outFile = path.join(outputDir, file.path)
      await mkdir(path.dirname(outFile), { recursive: true })
      await writeFile(outFile, output, "utf8")
      written.push(path.relative(outputDir, outFile).split(path.sep).join("/"))
    }
  }

  // 样式表：三套作用域规则合并（.style-<name> { ... }）
  // @import tw-animate-css：token 的 animate-in/fade-out 等动画工具类依赖
  // （同 shadcn BASE_STYLE css 的 @import "tw-animate-css"）
  let css =
    "/* @actview/ui 作用域样式表：body 挂 style-<name> class 切换整套视觉。\n   需要 tailwind 处理 @apply。*/\n@import \"tw-animate-css\";\n"
  for (const styleFile of styleFiles) {
    css += `\n${await readFile(path.join(stylesDir, styleFile), "utf8")}\n`
  }
  const cssFile = path.join(outputDir, "styles.css")
  await mkdir(outputDir, { recursive: true })
  await writeFile(cssFile, css, "utf8")
  written.push("styles.css")

  // 主题数据：色板 × light/dark 变量组 + radius 预设（路径③，运行时切换）
  const themesSource = path.join(registryRoot, "themes.json")
  const themesFile = path.join(outputDir, "themes.json")
  await writeFile(themesFile, await readFile(themesSource, "utf8"), "utf8")
  written.push("themes.json")

  // 主题运行时注入函数模板（CLI 分发到用户项目 aliases.lib）
  const themeTsSource = path.join(registryRoot, "lib", "theme.ts")
  const themeTsFile = path.join(outputDir, "theme.ts")
  await writeFile(themeTsFile, await readFile(themeTsSource, "utf8"), "utf8")
  written.push("theme.ts")

  if (!silent) {
    console.log(
      `✅ styles/semantic/  (${registry.items.length} items + styles.css + themes.json + theme.ts)`
    )
  }
  return written
}

// ---------------------------------------------------------------------------
// buildRegistry：base × style → styles/base-<style>/**（返回产物文件清单）
// ---------------------------------------------------------------------------
export async function buildRegistry(options = {}) {
  const root = options.root ?? DEFAULT_ROOT
  const registryRoot = path.join(root, "registry", "bases", "base")
  const registryFile = path.join(registryRoot, "registry.json")
  const stylesDir = path.join(root, "registry", "styles")
  const outputDir = path.join(root, "styles")
  const silent = options.silent ?? false

  const registry = JSON.parse(await readFile(registryFile, "utf8"))
  const styleFiles = (await readdir(stylesDir))
    .filter((f) => f.startsWith("style-") && f.endsWith(".css"))
    .sort()

  const written = []

  for (const styleFile of styleFiles) {
    const styleName = styleFile.replace(/^style-/, "").replace(/\.css$/, "")
    const outputStyleName = `base-${styleName}`
    const css = await readFile(path.join(stylesDir, styleFile), "utf8")
    const styleMap = createStyleMap(css)

    for (const item of registry.items) {
      for (const file of item.files) {
        const sourcePath = path.join(registryRoot, file.path)
        const source = await readFile(sourcePath, "utf8")

        const replaced = transformStyleMap(source, styleMap)
        const output = rewriteRegistryImports(replaced, outputStyleName)

        const outFile = path.join(outputDir, outputStyleName, file.path)
        await mkdir(path.dirname(outFile), { recursive: true })
        await writeFile(outFile, output, "utf8")

        verifyTokens(`${outputStyleName}/${file.path}`, output)
        written.push(path.relative(outputDir, outFile).split(path.sep).join("/"))
      }
    }
    if (!silent) {
      console.log(`✅ styles/${outputStyleName}/  (${registry.items.length} items)`)
    }
  }

  // 同一 style 下三份产物两两不同（证明 style 真正生效）
  const samples = {}
  for (const styleFile of styleFiles) {
    const styleName = styleFile.replace(/^style-/, "").replace(/\.css$/, "")
    samples[styleName] = await readFile(
      path.join(outputDir, `base-${styleName}`, "ui", "button-group.tsx"),
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

  if (!silent) {
    console.log(
      `\n✅ 构建完成：${written.length} 个文件，${names.length} 套 style 互不相同，无残留 cn-* 占位符。`
    )
  }

  return written
}
