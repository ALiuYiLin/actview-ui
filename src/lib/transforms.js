// 源码转换器（复刻 packages/shadcn/src/utils/transformers/ 的最小版）
//
//   resolveFilePath()  ← updaters/update-files.ts（registry path + type → 落盘路径）
//   transformImports() ← transformers/transform-import.ts（registry 路径 → 用户 aliases）
//   transformIcons()   ← transformers/transform-icons.ts（IconPlaceholder → 图标库组件）
import path from "node:path"

// ---------------------------------------------------------------------------
// resolveFilePath：type 决定目标目录，path 公共段截取文件名
// ---------------------------------------------------------------------------
export function aliasToLocalDir(alias, projectRoot) {
  if (alias.startsWith("@/") || alias.startsWith("~/")) {
    return path.join(projectRoot, alias.replace(/^[@~]\//, ""))
  }
  return path.join(projectRoot, alias)
}

export function resolveNestedFilePath(filePath, targetAlias) {
  const lastTargetSegment = targetAlias.split("/").filter(Boolean).pop()
  const segments = filePath.split("/").filter(Boolean)
  const commonDirIndex = segments.findIndex((s) => s === lastTargetSegment)
  if (commonDirIndex === -1) {
    return segments[segments.length - 1]
  }
  return segments.slice(commonDirIndex + 1).join("/")
}

export function resolveFilePath(registryPath, type, config, projectRoot) {
  const targetAlias =
    type === "registry:ui"
      ? config.aliases.ui ?? `${config.aliases.components}/ui`
      : type === "registry:lib"
        ? config.aliases.lib
        : type === "registry:hook"
          ? config.aliases.hooks
          : config.aliases.components

  const targetDir = aliasToLocalDir(targetAlias, projectRoot)
  const relativePath = resolveNestedFilePath(registryPath, targetAlias)
  return { filePath: path.join(targetDir, relativePath), targetAlias }
}

// ---------------------------------------------------------------------------
// transformImport：分支顺序复刻 transform-import.ts
// ---------------------------------------------------------------------------
export function updateImportAliases(moduleSpecifier, config) {
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
  if (
    config.aliases.components &&
    moduleSpecifier.match(/^@\/registry\/[^/]+\/components/)
  ) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+\/components/,
      config.aliases.components
    )
  }
  if (
    config.aliases.lib &&
    moduleSpecifier.match(/^@\/registry\/[^/]+\/lib/)
  ) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+\/lib/,
      config.aliases.lib
    )
  }
  if (
    config.aliases.hooks &&
    moduleSpecifier.match(/^@\/registry\/[^/]+\/hooks/)
  ) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+\/hooks/,
      config.aliases.hooks
    )
  }
  if (moduleSpecifier.match(/^@\/registry\/[^/]+/)) {
    return moduleSpecifier.replace(
      /^@\/registry\/[^/]+/,
      config.aliases.components
    )
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

export function transformImports(source, config) {
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
// transformIcons：IconPlaceholder → 图标库组件 + import 注入
// （复刻 transformers/transform-icons.ts；actview 生态的图标库为
//   @actview/lucide —— lucide 的 actview 适配版，defineComponent 产物）
// ---------------------------------------------------------------------------
const ICON_LIBRARY_IMPORTS = {
  lucide: "@actview/lucide",
  // actview 生态目前只有 lucide 适配包；其他库名暂未适配
}

export function transformIcons(source, config) {
  const iconLibrary = config.iconLibrary ?? "lucide"
  const iconPackage = ICON_LIBRARY_IMPORTS[iconLibrary]
  if (!iconPackage) {
    throw new Error(
      `不支持的 iconLibrary "${iconLibrary}"。actview 生态当前支持: ${Object.keys(
        ICON_LIBRARY_IMPORTS
      ).join(", ")}`
    )
  }

  const usedIcons = new Set()

  const withoutJsx = source.replace(
    /<IconPlaceholder\s+([^/>]*)\s*\/>/g,
    (match, props) => {
      const attrRe = new RegExp(`${iconLibrary}="([^"]+)"`)
      const iconName = props.match(attrRe)?.[1]
      if (!iconName) {
        throw new Error(`IconPlaceholder 缺少 ${iconLibrary} 属性：${match}`)
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
        !line.includes("import { IconPlaceholder }") &&
        !line.includes("import { IconPlaceholder,")
    )
    .join("\n")

  if (usedIcons.size === 0) {
    return { transformed: source, icons: [] }
  }

  // 图标库 import 插入到第一个 import 行之前（而非文件最顶部的注释之前）
  const iconImport = `import { ${Array.from(usedIcons).sort().join(", ")} } from "${iconPackage}"`
  const lines = withoutImport.split("\n")
  const firstImportIndex = lines.findIndex((line) => line.startsWith("import"))
  const insertAt = firstImportIndex === -1 ? 0 : firstImportIndex
  lines.splice(insertAt, 0, iconImport)

  return { transformed: lines.join("\n"), icons: Array.from(usedIcons) }
}

// ---------------------------------------------------------------------------
// 还原 registry 形态：styles 产物（文档站形态）→ 分发给用户的 content 形态
// ---------------------------------------------------------------------------
export function restoreRegistryImports(source, style) {
  return source
    .replaceAll(`@/styles/${style}/ui/`, `@/registry/${style}/ui/`)
    .replaceAll(
      `@/styles/${style}/components/icon-placeholder`,
      `@/registry/${style}/components/icon-placeholder`
    )
    .replaceAll("@/lib/utils", `@/registry/${style}/lib/utils`)
}
