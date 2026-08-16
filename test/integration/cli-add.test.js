// L3 集成测试：CLI init + add 全链路（临时目录，不依赖 user-project）
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm, readFile, access } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { runInitCommand } from "../../src/commands/init.js"
import { runAddCommand } from "../../src/commands/add.js"

let dir

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "actview-ui-test-"))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("CLI init", () => {
  it("写 components.json + utils + 主题文件（themes.json/theme.ts）", async () => {
    await runInitCommand({ cwd: dir, style: "base-ember" })
    const cfg = JSON.parse(
      await readFile(path.join(dir, "components.json"), "utf8")
    )
    expect(cfg.style).toBe("base-ember")
    expect(cfg.iconLibrary).toBe("lucide")
    // 主题参数（路径③）写入配置
    expect(cfg.baseColor).toBe("emerald")
    expect(cfg.theme).toBe("light")
    expect(cfg.radius).toBe("default")
    await access(path.join(dir, "lib", "utils.ts"))
    // 主题数据 + 运行时注入函数落盘
    await access(path.join(dir, "styles", "themes.json"))
    await access(path.join(dir, "lib", "theme.ts"))
  })

  it("已有配置无 --yes 时拒绝覆盖", async () => {
    await runInitCommand({ cwd: dir })
    await expect(runInitCommand({ cwd: dir })).rejects.toThrow(/--yes/)
  })

  it("目标目录不存在时自动创建", async () => {
    const nested = path.join(dir, "deep", "nested")
    await runInitCommand({ cwd: nested, style: "base-mist" })
    await access(path.join(nested, "components.json"))
    await access(path.join(nested, "lib", "utils.ts"))
  })
})

describe("CLI add", () => {
  it("button-group：依赖树 + import 重写 + 图标替换 + 落盘", async () => {
    await runInitCommand({ cwd: dir, style: "base-aurora" })
    await runAddCommand({
      cwd: dir,
      items: ["button-group"],
      style: "base-aurora",
    })

    const group = await readFile(
      path.join(dir, "components", "ui", "button-group.tsx"),
      "utf8"
    )
    expect(group).toContain('import { ChevronDown } from "@actview/lucide"')
    expect(group).toContain('from "@/components/ui/separator"')
    expect(group).toContain('from "@/lib/utils"')
    // 占位符的 import 与 JSX 均被替换（注释里的说明文字不算）
    expect(group).not.toMatch(/import\s*\{[^}]*IconPlaceholder[^}]*\}/)
    expect(group).not.toContain("<IconPlaceholder")

    // separator 依赖被先行安装
    const sep = await readFile(
      path.join(dir, "components", "ui", "separator.tsx"),
      "utf8"
    )
    expect(sep).toContain('data-slot="separator"')

    // icon-placeholder 不再随组件落盘（transform-icons 已替换）
    await expect(
      access(path.join(dir, "components", "icon-placeholder.tsx"))
    ).rejects.toThrow()
  })

  it("重复 add 内容相同 → 产物不变", async () => {
    await runInitCommand({ cwd: dir })
    await runAddCommand({ cwd: dir, items: ["button"] })
    const first = await readFile(
      path.join(dir, "components", "ui", "button.tsx"),
      "utf8"
    )
    await runAddCommand({ cwd: dir, items: ["button"] })
    const second = await readFile(
      path.join(dir, "components", "ui", "button.tsx"),
      "utf8"
    )
    expect(second).toBe(first)
  })

  it("无配置时 add 报错提示 init", async () => {
    await expect(
      runAddCommand({ cwd: dir, items: ["button"] })
    ).rejects.toThrow(/actview-ui init/)
  })

  it("add --semantic：cn-* 保留 + 作用域样式表 + 占位组件落盘", async () => {
    await runInitCommand({ cwd: dir, style: "base-aurora" })
    await runAddCommand({ cwd: dir, items: ["button-group"], semantic: true })

    const group = await readFile(
      path.join(dir, "components", "ui", "button-group.tsx"),
      "utf8"
    )
    // 语义类保留、图标不替换
    expect(group).toContain("cn-button-group")
    expect(group).toContain("<IconPlaceholder")
    expect(group).toContain('from "@/components/ui/separator"')
    expect(group).toContain('from "@/components/icon-placeholder"')
    expect(group).not.toMatch(/import\s*\{[^}]*\}\s*from\s*"@actview\/lucide"/)

    // semanticDependencies：icon-placeholder 组件落盘
    await access(path.join(dir, "components", "icon-placeholder.tsx"))

    // 作用域样式表落盘
    const css = await readFile(
      path.join(dir, "styles", "actview-ui.css"),
      "utf8"
    )
    expect(css).toContain(".style-aurora")
    expect(css).toContain(".style-ember")
    expect(css).toContain(".style-mist")
  })
})
