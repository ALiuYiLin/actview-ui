// 注册表加载与依赖树解析（复刻 packages/shadcn/src/registry/loader.ts + resolver.ts 的最小版）
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

// 包内资源定位（CLI 自身的 registry 与 styles 产物随包分发）。
// 注意：避免 new URL(..., import.meta.url) —— vite/vitest 会把它当静态资产
// 转换并破坏 file: scheme；用 fileURLToPath + path 拼接。
const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)
export const REGISTRY_FILE = path.join(
  PACKAGE_ROOT,
  "registry",
  "bases",
  "base",
  "registry.json"
)
export const STYLES_DIR = path.join(PACKAGE_ROOT, "styles")
export const BASE_UTILS_FILE = path.join(
  PACKAGE_ROOT,
  "registry",
  "bases",
  "base",
  "lib",
  "utils.ts"
)
// 主题数据（色板 × light/dark + radius）与运行时注入函数模板
export const THEMES_FILE = path.join(
  PACKAGE_ROOT,
  "registry",
  "bases",
  "base",
  "themes.json"
)
export const THEME_TS_FILE = path.join(
  PACKAGE_ROOT,
  "registry",
  "bases",
  "base",
  "lib",
  "theme.ts"
)

export async function loadRegistry() {
  return JSON.parse(await readFile(REGISTRY_FILE, "utf8"))
}

// 复刻 resolver.ts：BFS registryDependencies，visited 去重，
// 输出依赖在前、被依赖在后的拓扑序。带环检测。
export function resolveRegistryTree(registry, itemName) {
  const byName = new Map(registry.items.map((item) => [item.name, item]))
  const target = byName.get(itemName)
  if (!target) {
    throw new Error(
      `registry 中不存在组件 "${itemName}"。可用：${registry.items
        .map((i) => i.name)
        .join(", ")}`
    )
  }

  const visited = new Set()
  const ordered = []

  function visit(name, chain) {
    if (visited.has(name)) {
      return
    }
    if (chain.includes(name)) {
      throw new Error(`检测到循环依赖：${[...chain, name].join(" → ")}`)
    }
    const item = byName.get(name)
    if (!item) {
      throw new Error(
        `依赖 "${name}" 不在 registry 中（被 "${chain.at(-1)}" 引用）`
      )
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
