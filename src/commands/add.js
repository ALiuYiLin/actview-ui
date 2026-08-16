// actview-ui add —— 复刻 shadcn CLI 的 add 命令（最小版）：
//   1. 读用户项目配置（components.json / user-config.json）
//   2. 解析 registryDependencies 依赖树（依赖在前）
//   3. 取包内 styles/<style>/ 产物（模拟注册表分发的 content）
//   4. transformImports（registry 路径 → 用户 aliases）
//   5. transformIcons（IconPlaceholder → @actview/lucide 图标组件 + import 注入）
//   6. resolveFilePath 落盘（内容相同则 skip）
//
// --semantic：路径②（自由切换预览）——
//   - 组件取包内 styles/semantic/ 产物（cn-* 保留，不展开）
//   - 依赖树并入 item.semanticDependencies（如 icon-placeholder 随组件落盘）
//   - 互引走 transformSemanticImports（styles/semantic → 用户 aliases）
//   - 不跑 transformIcons（占位组件落盘后由它渲染图标）
//   - 同时拷贝 styles/semantic/styles.css（作用域样式表）到用户项目，
//     用户侧 body 挂 style-<name> class 即切换整套视觉
//
// 用法：actview-ui add <component...> [--cwd <dir>] [--style <style>] [--semantic] [--yes]
import path from "node:path"
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { loadUserConfig, fileExists } from "../lib/config.js"
import {
  loadRegistry,
  resolveRegistryTree,
  STYLES_DIR,
  BASE_UTILS_FILE,
} from "../lib/registry.js"
import {
  resolveFilePath,
  transformImports,
  transformIcons,
  transformSemanticImports,
  restoreRegistryImports,
  aliasToLocalDir,
} from "../lib/transforms.js"

export async function runAddCommand(args) {
  const cwd = path.resolve(args.cwd ?? process.cwd())
  const items = args.items?.length ? args.items : ["button"]
  const semantic = !!args.semantic

  const { config } = await loadUserConfig(cwd)
  const style = args.style ?? config.style ?? "base-aurora"
  const registry = await loadRegistry()

  // 已安装依赖检测（复刻 update-dependencies 的"检查"部分，只提示不安装）
  const installed = await getInstalledDependencies(cwd)

  console.log(
    `┌─ actview-ui add${semantic ? " (semantic)" : ""} ───────────────────────────┐`
  )
  console.log(`│ style: ${semantic ? "全部（运行时切换）" : style}`)

  // 框架依赖（registry 顶层）+ 各 item 的 dependencies
  const allDependencies = new Set(registry.dependencies ?? [])

  for (const itemName of items) {
    // 依赖树：依赖在前（拓扑序）
    const tree = resolveRegistryTree(registry, itemName)
    const extraDeps = semantic
      ? (tree.flatMap((i) => i.semanticDependencies ?? []))
      : []
    for (const dep of extraDeps) {
      const depItem = registry.items.find((i) => i.name === dep)
      if (depItem && !tree.includes(depItem)) {
        tree.unshift(depItem) // 语义依赖也放在前面
      }
    }
    console.log(
      `│ ${itemName} 依赖树: ${tree.map((i) => i.name).join(" → ")}（依赖在前）`
    )

    for (const item of tree) {
      for (const dep of item.dependencies ?? []) {
        allDependencies.add(dep)
      }
      for (const file of item.files) {
        let content
        if (semantic) {
          // 语义类产物：cn-* 保留
          content = await readFile(
            path.join(STYLES_DIR, "semantic", file.path),
            "utf8"
          )
        } else {
          // 展开产物：还原为 registry 形态 content
          content = await readFile(
            path.join(STYLES_DIR, style, file.path),
            "utf8"
          )
          content = restoreRegistryImports(content, style)
        }

        const { filePath, targetAlias } = resolveFilePath(
          `registry/${semantic ? "semantic" : style}/${file.path}`,
          file.type,
          config,
          cwd
        )

        let transformed
        let rewrites = []
        if (semantic) {
          // 语义互引 + @/lib/utils → 用户 aliases；不替换图标
          const semanticDone = transformSemanticImports(content, config)
          const result = transformImports(semanticDone, config)
          transformed = result.transformed
          rewrites = result.rewrites
        } else {
          const { transformed: importsDone, rewrites: r } = transformImports(
            content,
            config
          )
          const { transformed: t, icons } = transformIcons(importsDone, config)
          transformed = t
          rewrites = r
        }

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

  // 语义模式：拷贝作用域样式表到用户项目
  if (semantic) {
    const cssSource = path.join(STYLES_DIR, "semantic", "styles.css")
    const cssTarget = path.join(cwd, "styles", "actview-ui.css")
    await mkdir(path.dirname(cssTarget), { recursive: true })
    await writeFile(cssTarget, await readFile(cssSource, "utf8"), "utf8")
    console.log(`│`)
    console.log(
      `│ 样式表: styles/actview-ui.css  [${(await fileExists(cssTarget)) ? "已写入" : "写入失败"}]`
    )
    console.log(`│ 用法  : <body class="style-aurora"> ↔ style-ember / style-mist 自由切换`)
  }

  // npm 依赖报告（聚合全部 item 的 dependencies，去重）
  if (allDependencies.size > 0) {
    console.log(`│`)
    console.log(`│ npm 依赖:`)
    for (const dep of Array.from(allDependencies).sort()) {
      const mark = installed.has(dep) ? "已装 ✓" : "缺失 ✗"
      console.log(`│   ${mark.padEnd(7)} ${dep}`)
    }
    const missing = Array.from(allDependencies)
      .filter((dep) => !installed.has(dep))
      .sort()
    if (missing.length > 0) {
      console.log(`│`)
      console.log(`│ 请安装缺失依赖: npm install ${missing.join(" ")}`)
    }
  }

  console.log("└──────────────────────────────────────────────────┘")
}

// 读取用户项目 package.json，返回 dependencies + devDependencies 键集合
async function getInstalledDependencies(cwd) {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(cwd, "package.json"), "utf8")
    )
    return new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ])
  } catch {
    return new Set()
  }
}
