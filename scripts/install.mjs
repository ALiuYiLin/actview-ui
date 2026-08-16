// scripts/install.mjs —— 早期演示入口的薄包装。
// 逻辑已上移到 src/commands/add.js（CLI 的 actview-ui add），
// 本文件仅做参数映射后转发，保证旧演示命令可用：
//
//   node scripts/install.mjs --item button-group --style base-aurora
//   ≡ actview-ui add button-group --style base-aurora --cwd <repo>/user-project
import path from "node:path"
import { fileURLToPath } from "node:url"
import { runAddCommand } from "../src/commands/add.js"

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

const args = parseArgs(process.argv)

await runAddCommand({
  items: [args.item ?? "button-group"],
  style: args.style,
  cwd: path.resolve(ROOT, args.project ?? "user-project"),
}).catch((error) => {
  console.error(`\n❌ ${error.message}`)
  process.exit(1)
})
