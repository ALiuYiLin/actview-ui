// actview-ui CLI 入口 —— 复刻 shadcn CLI（commander）的最小版：
//   手写参数解析 + 子命令分发（init / add / help）
//
// 用法：
//   actview-ui init [--cwd <dir>] [--style <style>] [--yes]
//   actview-ui add <component...> [--cwd <dir>] [--style <style>]
//   actview-ui --help
//   actview-ui --version
import { runInitCommand } from "./commands/init.js"
import { runAddCommand } from "./commands/add.js"

const VERSION = "0.1.0"

const USAGE = `
actview-ui ${VERSION} — shadcn build-registry 最小复刻 CLI

用法:
  actview-ui init [组件项目路径参数]        初始化用户项目（写 components.json + utils）
  actview-ui add <component...> [参数]     安装组件（依赖树解析 + import 重写 + 图标替换）

init 参数:
  --cwd <dir>        项目目录（默认当前目录）
  --style <style>    注册表风格：base-aurora / base-ember / base-mist（默认 base-aurora）
  --yes              已有配置时强制覆盖重写

add 参数:
  --cwd <dir>        项目目录（默认当前目录）
  --style <style>    覆盖配置里的 style
  --semantic         路径②：cn-* 保留 + 作用域样式表（body class 自由切换 style）
  --yes              已存在的文件直接覆盖（不 skip）

可用组件: button / separator / button-group
`

function parseArgs(argv) {
  const args = { items: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") {
      args.help = true
    } else if (arg === "--version" || arg === "-v") {
      args.version = true
    } else if (arg === "--yes" || arg === "-y") {
      args.yes = true
    } else if (arg === "--semantic") {
      args.semantic = true
    } else if (arg === "--cwd" || arg === "-c") {
      args.cwd = argv[++i]
    } else if (arg === "--style" || arg === "-s") {
      args.style = argv[++i]
    } else if (arg.startsWith("-")) {
      throw new Error(`未知参数 "${arg}"。运行 actview-ui --help 查看用法。`)
    } else {
      args.items.push(arg)
    }
  }
  return args
}

export async function run(argv) {
  const [command, ...rest] = argv

  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE)
    return
  }
  if (command === "--version" || command === "-v") {
    console.log(VERSION)
    return
  }
  if (command === "help") {
    console.log(USAGE)
    return
  }

  const args = parseArgs(rest)

  switch (command) {
    case "init":
      await runInitCommand(args)
      return
    case "add":
      if (!args.items.length) {
        throw new Error("add 需要至少一个组件名。运行 actview-ui --help 查看用法。")
      }
      await runAddCommand(args)
      return
    default:
      throw new Error(`未知命令 "${command}"。运行 actview-ui --help 查看用法。`)
  }
}
