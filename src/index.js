// @actview/ui 编程 API 入口（package.json exports["."]）
//
// 发布后第三方可以编程式调用：
//   import { loadRegistry, resolveRegistryTree, transformIcons } from "@actview/ui"
//
// 对应 shadcn 包的子路径导出（shadcn/registry、shadcn/utils）。
export { runInitCommand } from "./commands/init.js"
export { runAddCommand } from "./commands/add.js"

export {
  loadRegistry,
  resolveRegistryTree,
  REGISTRY_FILE,
  STYLES_ROOT,
  BASE_UTILS_FILE,
} from "./lib/registry.js"

export {
  DEFAULT_CONFIG,
  CONFIG_FILES,
  findUserConfig,
  loadUserConfig,
  writeUserConfig,
  fileExists,
} from "./lib/config.js"

export {
  aliasToLocalDir,
  resolveNestedFilePath,
  resolveFilePath,
  updateImportAliases,
  transformImports,
  restoreRegistryImports,
} from "./lib/transforms.js"
