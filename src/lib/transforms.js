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
// 还原 registry 形态：styles 产物（文档站形态）→ 分发给用户的 content 形态
//
// actview 图标方案说明：React 生态下 CLI 用 transform-icons 把 IconPlaceholder
// 替换成图标库组件（lucide 等）并注入 import。actview 没有 React 生态图标库，
// 图标由 registry 分发的 icon-placeholder 组件提供（SVG 字符串 + ref 注入
// innerHTML），因此 CLI 不再做图标替换，只把其 import 还原成 registry 形态，
// 走普通依赖安装（button-group 的 registryDependencies 已含 icon-placeholder）。
// ---------------------------------------------------------------------------
export function restoreRegistryImports(source, style) {
  return source
    .replaceAll(`@/styles/${style}/ui/`, `@/registry/${style}/ui/`)
    .replaceAll(
      "@/app/(create)/components/icon-placeholder",
      `@/registry/${style}/components/icon-placeholder`
    )
    .replaceAll("@/lib/utils", `@/registry/${style}/lib/utils`)
}
