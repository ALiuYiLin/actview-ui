// 最小复刻 shadcn/ui 的 build-registry 管线（纯 Node，零依赖）：
//
//   createStyleMap()      ← 复刻 packages/shadcn/src/styles/create-style-map.ts
//                           （postcss 解析 .cn-* 规则 → 提取声明文本）
//   transformStyleMap()   ← 复刻 packages/shadcn/src/styles/transform-style-map.ts
//                           （把 base 源码中的 cn-* 占位符替换为声明文本）
//   copyUIToStyles()      ← 复刻 apps/v4/scripts/build-registry.mts
//                           （重写 import 路径 + 写出 styles/<style>/ui/*）
//
// 与原版的差异（有意最小化）：
//   - 不用 tailwind 的 @apply，style 规则块内是普通 CSS 声明
//   - 不用 ts-morph AST，用正则直接替换字符串字面量中的 cn-* token
//   - 不生成 registry.json / content，只生成 styles/base-<style>/ui/button.tsx
//
// 产物不可运行（className 里是 CSS 声明文本），但每个 cn-* token 都能
// 逐字对应回各自的 style 定义 —— 这正是本次要验证的目标。

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BASE_SOURCE = path.join(
  ROOT,
  "registry",
  "bases",
  "base",
  "ui",
  "button.tsx"
)
const STYLES_DIR = path.join(ROOT, "registry", "styles")
const OUTPUT_DIR = path.join(ROOT, "styles")

const CN_TOKEN_RE = /\bcn-[a-z0-9-]+\b/g

// ---------------------------------------------------------------------------
// ① createStyleMap 的最小等价物：
//    解析 style CSS，提取每个 .cn-* 规则块内的声明文本。
// ---------------------------------------------------------------------------
function createStyleMap(css) {
  const map = {}

  // 去掉注释后，逐块匹配 `.cn-xxx { ... }`
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const ruleRe = /\.(cn-[a-z0-9-]+)\s*\{([^{}]*)\}/g

  for (const match of withoutComments.matchAll(ruleRe)) {
    const className = match[1]
    const declarations = match[2]
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
//    把 base 源码里所有 cn-* token 替换为 styleMap 中对应的声明文本。
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
//    重写 registry 内部路径为产物路径（@/registry/bases/base/ → @/）。
// ---------------------------------------------------------------------------
function rewriteRegistryImports(source) {
  return source.replaceAll("@/registry/bases/base/", "@/")
}

// ---------------------------------------------------------------------------
// 验证：产物字符串必须与 style 定义"对应上"
// ---------------------------------------------------------------------------
function verify(styleName, source, output) {
  const tokens = Array.from(new Set(source.match(CN_TOKEN_RE) ?? []))

  // 1. 产物里不允许残留任何 cn-* 占位符
  const leftovers = output.match(CN_TOKEN_RE) ?? []
  if (leftovers.length > 0) {
    throw new Error(
      `[${styleName}] 产物中残留未替换占位符: ${leftovers.join(", ")}`
    )
  }

  return tokens
}

async function main() {
  const baseSource = await readFile(BASE_SOURCE, "utf8")
  const styleFiles = (await readdir(STYLES_DIR))
    .filter((f) => f.startsWith("style-") && f.endsWith(".css"))
    .sort()

  const outputs = []
  const report = {}

  for (const styleFile of styleFiles) {
    const styleName = styleFile.replace(/^style-/, "").replace(/\.css$/, "")
    const css = await readFile(path.join(STYLES_DIR, styleFile), "utf8")

    const styleMap = createStyleMap(css)
    const replaced = transformStyleMap(baseSource, styleMap)
    const tokens = verify(styleName, baseSource, replaced)
    const output = rewriteRegistryImports(replaced)

    const outFile = path.join(OUTPUT_DIR, `base-${styleName}`, "ui", "button.tsx")
    await mkdir(path.dirname(outFile), { recursive: true })
    await writeFile(outFile, output, "utf8")

    outputs.push(outFile)
    report[styleName] = { styleMap, tokens, outFile }
    console.log(`✅ styles/base-${styleName}/ui/button.tsx  (${tokens.length} 个 token)`)
  }

  // 三套产物两两不同（证明 style 真正生效了）
  const contents = {}
  for (const [name, { outFile }] of Object.entries(report)) {
    contents[name] = await readFile(outFile, "utf8")
  }
  const names = Object.keys(contents)
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (contents[names[i]] === contents[names[j]]) {
        throw new Error(`产物 base-${names[i]} 与 base-${names[j]} 完全相同！`)
      }
    }
  }

  // 打印 token → 声明文本 对照表（每个 token 展示第一处替换结果）
  console.log("\n┌─ token 对照表 ─────────────────────────────┐")
  const allTokens = Array.from(
    new Set(Object.values(report).flatMap((r) => r.tokens))
  )
  for (const token of allTokens) {
    console.log(`│ ${token}`)
    for (const name of Object.keys(report)) {
      const text = report[name].styleMap[token]
      console.log(`│   [${name}] ${text}`)
    }
  }
  console.log("└──────────────────────────────────────────────┘")
  console.log("\n✅ 验证通过：3 份产物互不相同，且无残留 cn-* 占位符。")
}

main().catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
