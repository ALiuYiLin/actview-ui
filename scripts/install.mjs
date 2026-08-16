// 最小复刻 shadcn CLI 的「用户端安装」管线（纯 Node，零依赖）：
//
//   resolveFilePath()  ← 复刻 packages/shadcn/src/utils/updaters/update-files.ts
//                        （registry file.path + type → 用户项目里的落盘路径）
//   transformImport()  ← 复刻 packages/shadcn/src/utils/transformers/transform-import.ts
//                        （@/registry/... 按用户 aliases 重写）
//   updateFiles()      ← 同上（写盘 + 内容相同则 skip）
//
// 输入：
//   - user-project/user-config.json       用户 components.json 的 aliases 配置
//   - styles/base-<style>/ui/button.tsx   上一步 build.mjs 的产物（模拟注册表分发的组件）
//
// 输出（模拟组件落到用户本地项目）：
//   user-project/<aliases.ui>/button.tsx
//
// 用法：
//   node scripts/install.mjs --style base-aurora --config user-project/user-config.json --project user-project

import { readFile, writeFile, mkdir, access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true
      args[key] = value
    }
  }
  return args
}

// ---------------------------------------------------------------------------
// ① getConfig 的最小等价物：读用户 JSON 配置（components.json 的 aliases 部分）
// ---------------------------------------------------------------------------
async function getUserConfig(configFile) {
  return JSON.parse(await readFile(path.resolve(ROOT, configFile), "utf8"))
}

// ---------------------------------------------------------------------------
// ② resolveFilePath 的最小等价物（复刻 update-files.ts 的核心分支）
//
// 真实场景中 button.json 的 files[0] 是：
//   { path: "registry/base-nova/ui/button.tsx", type: "registry:ui" }
// 用户端按 type 决定目标目录，再按 path 里的公共段（"ui"）截出文件名。
// ---------------------------------------------------------------------------
function aliasToLocalDir(alias, projectRoot) {
  // "@/components/ui" → <project>/components/ui
  if (alias.startsWith("@/") || alias.startsWith("~/")) {
    return path.join(projectRoot, alias.replace(/^[@~]\//, ""))
  }
  return path.join(projectRoot, alias)
}

function resolveNestedFilePath(filePath, targetAlias) {
  // targetAlias 形如 "@/components/ui"，取其最后一段（"ui"）作为公共段
  const lastTargetSegment = targetAlias.split("/").filter(Boolean).pop()
  const segments = filePath.split("/").filter(Boolean)
  const commonDirIndex = segments.findIndex((s) => s === lastTargetSegment)
  if (commonDirIndex === -1) {
    return segments[segments.length - 1]
  }
  return segments.slice(commonDirIndex + 1).join("/")
}

function resolveFilePath(registryPath, type, config, projectRoot) {
  const targetAlias =
    type === "registry:ui" ? config.aliases.ui ?? `${config.aliases.components}/ui`
    : type === "registry:lib" ? config.aliases.lib
    : type === "registry:hook" ? config.aliases.hooks
    : config.aliases.components

  const targetDir = aliasToLocalDir(targetAlias, projectRoot)
  const relativePath = resolveNestedFilePath(registryPath, targetAlias)
  return { filePath: path.join(targetDir, relativePath), targetAlias }
}

// ---------------------------------------------------------------------------
// ③ transformImport 的最小等价物（复刻 transform-import.ts 的分支顺序）
// ---------------------------------------------------------------------------
function updateImportAliases(moduleSpecifier, config) {
  // registry 分支：@/registry/<style>/ui → aliases.ui
  if (moduleSpecifier.match(/^@\/registry\/[^/]+\/ui/)) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+\/ui/,
      config.aliases.ui ?? `${config.aliases.components}/ui`
    )
  }
  // registry 分支：@/registry/<style>/lib/utils → aliases.utils
  if (
    config.aliases.utils &&
    moduleSpecifier.match(/^@\/registry\/[^/]+\/lib\/utils$/)
  ) {
    return config.aliases.utils
  }
  // registry 分支：@/registry/<style>/lib → aliases.lib
  if (config.aliases.lib && moduleSpecifier.match(/^@\/registry\/[^/]+\/lib/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+\/lib/, config.aliases.lib)
  }
  // registry 分支：@/registry/<style>/hooks → aliases.hooks
  if (config.aliases.hooks && moduleSpecifier.match(/^@\/registry\/[^/]+\/hooks/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+\/hooks/, config.aliases.hooks)
  }
  // registry 分支兜底：@/registry/<style>/... → aliases.components
  if (moduleSpecifier.match(/^@\/registry\/[^/]+/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+/, config.aliases.components)
  }

  // 非 registry 分支（产物已做过 styles 重写时走这里）
  if (moduleSpecifier === "@/lib/utils" && config.aliases.utils) {
    return config.aliases.utils
  }
  if (
    config.aliases.ui &&
    moduleSpecifier.match(/^@\/components\/ui(?=\/|$)/)
  ) {
    return moduleSpecifier.replace(/^@\/components\/ui/, config.aliases.ui)
  }
  if (
    config.aliases.components &&
    moduleSpecifier.match(/^@\/components(?=\/|$)/)
  ) {
    return moduleSpecifier.replace(/^@\/components/, config.aliases.components)
  }
  if (config.aliases.hooks && moduleSpecifier.match(/^@\/hooks(?=\/|$)/)) {
    return moduleSpecifier.replace(/^@\/hooks/, config.aliases.hooks)
  }
  if (config.aliases.lib && moduleSpecifier.match(/^@\/lib(?=\/|$)/)) {
    return moduleSpecifier.replace(/^@\/lib/, config.aliases.lib)
  }
  return moduleSpecifier
}

function transformImports(source, config) {
  const rewrites = []
  const transformed = source.replace(
    /from\s+["']([^"']+)["']/g,
    (match, moduleSpecifier) => {
      const updated = updateImportAliases(moduleSpecifier, config)
      if (updated !== moduleSpecifier) {
        rewrites.push({ from: moduleSpecifier, to: updated })
      }
      return `from "${updated}"`
    }
  )
  return { transformed, rewrites }
}

// ---------------------------------------------------------------------------
// ④ updateFiles 的最小等价物：内容相同则 skip，否则写盘
// ---------------------------------------------------------------------------
async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const style = args.style ?? "base-aurora"
  const configFile = args.config ?? "user-project/user-config.json"
  const projectDir = args.project ?? "user-project"

  const config = await getUserConfig(configFile)
  const projectRoot = path.resolve(ROOT, projectDir)

  // 上一步产物：styles/base-<style>/ui/button.tsx（模拟注册表分发的组件源码）
  const sourceFile = path.join(ROOT, "styles", style, "ui", "button.tsx")
  let content = await readFile(sourceFile, "utf8")

  // 真实分发给用户的 content（button.json）里 import 是 registry 形态
  // （@/registry/<style>/...），styles 产物是文档站重写过（@/lib/utils）的。
  // 这里先还原成 registry 形态，再走 transformImport —— 复刻真实链路。
  content = content.replaceAll(
    "@/lib/utils",
    `@/registry/${style}/lib/utils`
  )

  // 模拟 button.json 的 files[0]：{ path, type }
  const registryFile = {
    path: `registry/${style}/ui/button.tsx`,
    type: "registry:ui",
  }

  const { filePath, targetAlias } = resolveFilePath(
    registryFile.path,
    registryFile.type,
    config,
    projectRoot
  )
  const { transformed, rewrites } = transformImports(content, config)

  let action = "create"
  if (await fileExists(filePath)) {
    const existing = await readFile(filePath, "utf8")
    action = existing === transformed ? "skip" : "overwrite"
  }

  if (action !== "skip") {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, transformed, "utf8")
  }

  // 模拟 shadcn init 已为用户安装 utils（registry:lib 的 utils item）：
  // 把 base 的最小 cn 落到用户项目 aliases.utils 路径，
  // 让组件里的 "@/utilities/cn" 有真实的解析目标。
  const utilsSource = await readFile(
    path.join(ROOT, "registry", "bases", "base", "lib", "utils.ts"),
    "utf8"
  )
  const utilsTarget = `${aliasToLocalDir(config.aliases.utils, projectRoot)}.ts`
  let utilsAction = "create"
  if (await fileExists(utilsTarget)) {
    const existing = await readFile(utilsTarget, "utf8")
    utilsAction = existing === utilsSource ? "skip" : "overwrite"
  }
  if (utilsAction !== "skip") {
    await mkdir(path.dirname(utilsTarget), { recursive: true })
    await writeFile(utilsTarget, utilsSource, "utf8")
  }

  // ── 安装报告 ────────────────────────────────────────────────────────────
  console.log("┌─ 注册表 → 用户本地 安装报告 ────────────────────┐")
  console.log(`│ style : ${style}`)
  console.log(`│ item  : ${registryFile.path}`)
  console.log(`│ type  : ${registryFile.type}  →  目标目录 aliases.ui = "${targetAlias}"`)
  console.log(`│ 落盘  : ${path.relative(ROOT, filePath).split(path.sep).join("/")}`)
  console.log(`│ action: ${action}`)
  console.log(`│ utils : ${path.relative(ROOT, utilsTarget).split(path.sep).join("/")}  [${utilsAction}]（模拟 init 安装）`)
  console.log("│ import 重写:")
  for (const { from, to } of rewrites) {
    console.log(`│   "${from}" → "${to}"`)
  }
  if (rewrites.length === 0) {
    console.log("│   (无变化)")
  }
  console.log("└──────────────────────────────────────────────────┘")
}

main().catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
