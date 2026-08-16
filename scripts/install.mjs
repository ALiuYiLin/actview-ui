// 最小复刻 shadcn CLI 的「用户端安装」管线（纯 Node，零依赖）：
//
//   resolveRegistryTree() ← 复刻 registry/resolver.ts（递归解析 registryDependencies，
//                           去重、依赖在前 —— 拓扑序）
//   resolveFilePath()     ← 复刻 updaters/update-files.ts（registry path + type
//                           → 用户项目落盘路径）
//   transformImport()     ← 复刻 transformers/transform-import.ts（registry 路径
//                           → 用户 aliases）
//   transformIcons()      ← 复刻 transformers/transform-icons.ts（IconPlaceholder
//                           → 真实图标库 import + JSX）
//   updateFiles()         ← 同上（写盘 + 内容相同则 skip）
//
// 输入：
//   - registry/bases/base/registry.json   组件清单（含 registryDependencies）
//   - user-project/user-config.json       用户 components.json 的 aliases 配置
//   - styles/base-<style>/**              上一步 build.mjs 的产物（模拟注册表内容）
//
// 输出（模拟组件落到用户本地项目）：
//   user-project/<aliases.ui>/*.tsx
//
// 用法：
//   node scripts/install.mjs --item button-group --style base-aurora
//   node scripts/install.mjs --item button-group --style base-aurora --config user-project/user-config.json --project user-project

import { readFile, writeFile, mkdir, access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const REGISTRY_FILE = path.join(ROOT, "registry", "bases", "base", "registry.json")

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
// ② resolveRegistryTree 的最小等价物（复刻 resolver.ts）：
//    从目标 item 出发 BFS registryDependencies，visited 去重，
//    输出依赖在前、被依赖在后的拓扑序。
// ---------------------------------------------------------------------------
function resolveRegistryTree(registry, itemName) {
  const byName = new Map(registry.items.map((item) => [item.name, item]))
  const target = byName.get(itemName)
  if (!target) {
    throw new Error(
      `registry 中不存在组件 "${itemName}"。可用：${registry.items.map((i) => i.name).join(", ")}`
    )
  }

  const visited = new Set()
  const ordered = [] // 依赖在前（拓扑序）

  function visit(name, chain) {
    if (visited.has(name)) {
      return
    }
    if (chain.includes(name)) {
      throw new Error(`检测到循环依赖：${[...chain, name].join(" → ")}`)
    }
    const item = byName.get(name)
    if (!item) {
      throw new Error(`依赖 "${name}" 不在 registry 中（被 "${chain.at(-1)}" 引用）`)
    }
    for (const dep of item.registryDependencies ?? []) {
      visit(dep, [...chain, name])
    }
    visited.add(name)
    ordered.push(item)
  }

  visit(itemName, [])
  return ordered
}

// ---------------------------------------------------------------------------
// ③ resolveFilePath 的最小等价物（复刻 update-files.ts 的核心分支）
// ---------------------------------------------------------------------------
function aliasToLocalDir(alias, projectRoot) {
  if (alias.startsWith("@/") || alias.startsWith("~/")) {
    return path.join(projectRoot, alias.replace(/^[@~]\//, ""))
  }
  return path.join(projectRoot, alias)
}

function resolveNestedFilePath(filePath, targetAlias) {
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
// ④ transformImport 的最小等价物（复刻 transform-import.ts 的分支顺序）
// ---------------------------------------------------------------------------
function updateImportAliases(moduleSpecifier, config) {
  if (moduleSpecifier.match(/^@\/registry\/[^/]+\/ui/)) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+\/ui/,
      config.aliases.ui ?? `${config.aliases.components}/ui`
    )
  }
  if (
    config.aliases.utils &&
    moduleSpecifier.match(/^@\/registry\/[^/]+\/lib\/utils$/)
  ) {
    return config.aliases.utils
  }
  if (config.aliases.lib && moduleSpecifier.match(/^@\/registry\/[^/]+\/lib/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+\/lib/, config.aliases.lib)
  }
  if (config.aliases.hooks && moduleSpecifier.match(/^@\/registry\/[^/]+\/hooks/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+\/hooks/, config.aliases.hooks)
  }
  if (moduleSpecifier.match(/^@\/registry\/[^/]+/)) {
    return moduleSpecifier.replace(/^@\/registry\/[^/]+/, config.aliases.components)
  }

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
// ⑤ transformIcons 的最小等价物（复刻 transform-icons.ts）：
//    - <IconPlaceholder lucide="X" .../> → <X />
//    - 移除 IconPlaceholder 的 import
//    - 注入 import { X } from "<iconLibrary 包>"
// ---------------------------------------------------------------------------
const ICON_LIBRARY_IMPORTS = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  hugeicons: "@hugeicons/react",
  phosphor: "@phosphor-icons/react",
  remixicon: "@remixicon/react",
}

function transformIcons(source, config) {
  const iconLibrary = config.iconLibrary ?? "lucide"
  const usedIcons = new Set()

  // 替换 JSX：<IconPlaceholder lucide="ChevronDown" ... /> → <ChevronDown />
  const withoutJsx = source.replace(
    /<IconPlaceholder\s+([^/>]*)\s*\/>/g,
    (match, props) => {
      const attrRe = new RegExp(`${iconLibrary}="([^"]+)"`)
      const iconName = props.match(attrRe)?.[1]
      if (!iconName) {
        throw new Error(
          `IconPlaceholder 缺少 ${iconLibrary} 属性：${match}`
        )
      }
      usedIcons.add(iconName)
      return `<${iconName} />`
    }
  )

  // 移除 IconPlaceholder 的 import 行
  const withoutImport = withoutJsx
    .split("\n")
    .filter(
      (line) =>
        !line.includes('import { IconPlaceholder }') &&
        !line.includes("import { IconPlaceholder,")
    )
    .join("\n")

  if (usedIcons.size === 0) {
    return { transformed: source, icons: [] }
  }

  // 图标库 import 插入到第一个 import 行之前（而非文件最顶部的注释之前）
  const iconImport = `import { ${Array.from(usedIcons).sort().join(", ")} } from "${
    ICON_LIBRARY_IMPORTS[iconLibrary]
  }"`
  const lines = withoutImport.split("\n")
  const firstImportIndex = lines.findIndex((line) => line.startsWith("import"))
  const insertAt = firstImportIndex === -1 ? 0 : firstImportIndex
  lines.splice(insertAt, 0, iconImport)
  const transformed = lines.join("\n")

  return { transformed, icons: Array.from(usedIcons) }
}

// ---------------------------------------------------------------------------
// ⑥ updateFiles 的最小等价物：内容相同则 skip，否则写盘
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
  const itemName = args.item ?? "button-group"
  const configFile = args.config ?? "user-project/user-config.json"
  const projectDir = args.project ?? "user-project"

  const config = await getUserConfig(configFile)
  const projectRoot = path.resolve(ROOT, projectDir)
  const registry = JSON.parse(await readFile(REGISTRY_FILE, "utf8"))

  // 解析依赖树：依赖在前（拓扑序）
  const tree = resolveRegistryTree(registry, itemName)

  console.log("┌─ 注册表 → 用户本地 安装报告 ────────────────────┐")
  console.log(`│ style: ${style}`)
  console.log(
    `│ 依赖树: ${tree.map((i) => i.name).join(" → ")}（依赖在前）`
  )

  const allRewrites = []
  const allIcons = []

  for (const item of tree) {
    for (const file of item.files) {
      // 上一步产物（模拟注册表分发的 content）。
      // styles 产物的 import 是文档站形态，真实分发给用户的 content 是
      // registry 形态，这里先还原再走 transformImports。
      const stylesFile = path.join(ROOT, "styles", style, file.path)
      let content = await readFile(stylesFile, "utf8")
      content = content
        .replaceAll(`@/styles/${style}/ui/`, `@/registry/${style}/ui/`)
        .replaceAll("@/lib/utils", `@/registry/${style}/lib/utils`)

      // 模拟 button.json 的 files[]：{ path, type }
      const { filePath, targetAlias } = resolveFilePath(
        `registry/${style}/${file.path}`,
        file.type,
        config,
        projectRoot
      )

      const { transformed: importsDone, rewrites } = transformImports(
        content,
        config
      )
      const { transformed, icons } = transformIcons(importsDone, config)

      const relPath = path.relative(ROOT, filePath).split(path.sep).join("/")
      const existed = await fileExists(filePath)
      let action
      if (existed) {
        const existing = await readFile(filePath, "utf8")
        action = existing === transformed ? "skip" : "overwrite"
      } else {
        action = "create"
      }
      if (action !== "skip") {
        await mkdir(path.dirname(filePath), { recursive: true })
        await writeFile(filePath, transformed, "utf8")
      }

      allRewrites.push(...rewrites)
      allIcons.push(...icons)

      console.log(`│`)
      console.log(`│ [${item.name}] ${file.path}  →  ${relPath}  [${action}]`)
      for (const { from, to } of rewrites) {
        console.log(`│   import: "${from}" → "${to}"`)
      }
      for (const icon of icons) {
        console.log(
          `│   icon  : IconPlaceholder → <${icon} /> (${config.iconLibrary ?? "lucide"})`
        )
      }
    }
  }

  // 模拟 shadcn init 已为用户安装 utils
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

  console.log(`│`)
  console.log(
    `│ utils: ${path.relative(ROOT, utilsTarget).split(path.sep).join("/")}  [${utilsAction}]（模拟 init 安装）`
  )
  console.log("└──────────────────────────────────────────────────┘")
}

main().catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
