// 用户项目配置（复刻 packages/shadcn/src/utils/get-config.ts 的最小版）
//
// 配置文件名：优先 components.json（真实 shadcn 名称），
// 回退 user-config.json（早期演示用名）。
import { readFile, writeFile, access } from "node:fs/promises"
import path from "node:path"

export const CONFIG_FILES = ["components.json", "user-config.json"]

export const DEFAULT_CONFIG = {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "base-aurora",
  tsx: true,
  iconLibrary: "lucide",
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
}

export async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

// 在 cwd 下查找配置：components.json 优先，user-config.json 回退
export async function findUserConfig(cwd) {
  for (const name of CONFIG_FILES) {
    const filePath = path.resolve(cwd, name)
    if (await fileExists(filePath)) {
      return { filePath, name }
    }
  }
  return null
}

export async function loadUserConfig(cwd) {
  const found = await findUserConfig(cwd)
  if (!found) {
    throw new Error(
      `在 ${cwd} 找不到配置（${CONFIG_FILES.join(" / ")}）。请先运行 \`actview-ui init\`。`
    )
  }
  const config = JSON.parse(await readFile(found.filePath, "utf8"))
  if (!config.aliases) {
    throw new Error(`${found.name} 缺少 aliases 配置。`)
  }
  return { config, ...found }
}

export async function writeUserConfig(cwd, config) {
  const filePath = path.resolve(cwd, "components.json")
  await writeFile(filePath, JSON.stringify(config, null, 2) + "\n", "utf8")
  return filePath
}
