// actview-ui init —— 复刻 shadcn CLI 的 init 命令（最小版）：
//   1. 在项目根写 components.json（默认 aliases + style + iconLibrary）
//   2. 把包内最小 cn（utils）落到 aliases.utils 路径
//
// 用法：actview-ui init [--cwd <dir>] [--style <style>] [--yes]
import path from "node:path"
import { readFile, writeFile, mkdir } from "node:fs/promises"
import {
  DEFAULT_CONFIG,
  findUserConfig,
  writeUserConfig,
} from "../lib/config.js"
import { BASE_UTILS_FILE } from "../lib/registry.js"
import { aliasToLocalDir } from "../lib/transforms.js"

export async function runInitCommand(args) {
  const cwd = path.resolve(args.cwd ?? process.cwd())
  const style = args.style ?? DEFAULT_CONFIG.style

  // 已有配置：无 --yes 时拒绝覆盖（真实 init 会询问，这里直接报错提示）
  const existing = await findUserConfig(cwd)
  if (existing && !args.yes) {
    throw new Error(
      `已存在配置 ${existing.name}。如需重新初始化请加 --yes（会覆盖为 components.json）。`
    )
  }

  const config = { ...DEFAULT_CONFIG, style }
  const configPath = await writeUserConfig(cwd, config)

  // utils：包内 registry/bases/base/lib/utils.ts → 用户项目 aliases.utils
  const utilsSource = await readFile(BASE_UTILS_FILE, "utf8")
  const utilsTarget = `${aliasToLocalDir(config.aliases.utils, cwd)}.ts`
  await mkdir(path.dirname(utilsTarget), { recursive: true })
  await writeFile(utilsTarget, utilsSource, "utf8")

  console.log("┌─ actview-ui init ───────────────────────────────┐")
  console.log(`│ config: ${path.relative(cwd, configPath) || "components.json"}`)
  console.log(`│ style : ${config.style}`)
  console.log(`│ aliases:`)
  for (const [key, value] of Object.entries(config.aliases)) {
    console.log(`│   ${key.padEnd(10)} → ${value}`)
  }
  console.log(
    `│ utils : ${path.relative(cwd, utilsTarget).split(path.sep).join("/")}  [create]`
  )
  console.log("│")
  console.log("│ 下一步: actview-ui add <component>")
  console.log("└─────────────────────────────────────────────────┘")
}
