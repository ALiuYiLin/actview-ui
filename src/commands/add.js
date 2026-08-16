// actview-ui add —— 复刻 shadcn CLI 的 add 命令（最小版）：
//   1. 读用户项目配置（components.json / user-config.json）
//   2. 解析 registryDependencies 依赖树（依赖在前）
//   3. 取包内 styles/<style>/ 产物（模拟注册表分发的 content）
//   4. transformImports（registry 路径 → 用户 aliases）
//   5. transformIcons（IconPlaceholder → 图标库组件）
//   6. resolveFilePath 落盘（内容相同则 skip）
//
// 用法：actview-ui add <component...> [--cwd <dir>] [--style <style>] [--yes]
import path from "node:path"
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { loadUserConfig, fileExists } from "../lib/config.js"
import { loadRegistry, resolveRegistryTree, STYLES_ROOT } from "../lib/registry.js"
import {
  resolveFilePath,
  transformImports,
  transformIcons,
  restoreRegistryImports,
  aliasToLocalDir,
} from "../lib/transforms.js"
import { BASE_UTILS_FILE } from "../lib/registry.js"

export async function runAddCommand(args) {
  const cwd = path.resolve(args.cwd ?? process.cwd())
  const items = args.items?.length ? args.items : ["button"]

  const { config } = await loadUserConfig(cwd)
  const style = args.style ?? config.style ?? "base-aurora"
  const registry = await loadRegistry()

  console.log("┌─ actview-ui add ────────────────────────────────┐")
  console.log(`│ style: ${style}`)

  for (const itemName of items) {
    // 依赖树：依赖在前（拓扑序）
    const tree = resolveRegistryTree(registry, itemName)
    console.log(
      `│ ${itemName} 依赖树: ${tree.map((i) => i.name).join(" → ")}（依赖在前）`
    )

    for (const item of tree) {
      for (const file of item.files) {
        // 包内 styles 产物（文档站形态）→ 还原为 registry 形态 content
        const stylesFile = new URL(
          `../../styles/${style}/${file.path}`,
          import.meta.url
        )
        let content = await readFile(stylesFile, "utf8")
        content = restoreRegistryImports(content, style)

        const { filePath, targetAlias } = resolveFilePath(
          `registry/${style}/${file.path}`,
          file.type,
          config,
          cwd
        )

        const { transformed: importsDone, rewrites } = transformImports(
          content,
          config
        )
        const { transformed, icons } = transformIcons(importsDone, config)

        const relPath = path.relative(cwd, filePath).split(path.sep).join("/")
        let action = "create"
        if (await fileExists(filePath)) {
          const existing = await readFile(filePath, "utf8")
          action = existing === transformed ? "skip" : "overwrite"
        }
        if (action !== "skip") {
          await mkdir(path.dirname(filePath), { recursive: true })
          await writeFile(filePath, transformed, "utf8")
        }

        console.log(`│`)
        console.log(`│ [${item.name}] ${file.path} → ${relPath}  [${action}]`)
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

    // 保证 utils 存在（模拟 init 已安装；若被删则补装）
    const utilsTarget = `${aliasToLocalDir(config.aliases.utils, cwd)}.ts`
    if (!(await fileExists(utilsTarget))) {
      const utilsSource = await readFile(BASE_UTILS_FILE, "utf8")
      await mkdir(path.dirname(utilsTarget), { recursive: true })
      await writeFile(utilsTarget, utilsSource, "utf8")
      console.log(`│ utils 缺失，已补装: ${path.relative(cwd, utilsTarget).split(path.sep).join("/")}`)
    }
  }

  console.log("└──────────────────────────────────────────────────┘")
}
