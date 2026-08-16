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
  it("写 components.json + utils，style 与 iconLibrary 生效", async () => {
    await runInitCommand({ cwd: dir, style: "base-ember" })
    const cfg = JSON.parse(
      await readFile(path.join(dir, "components.json"), "utf8")
    )
    expect(cfg.style).toBe("base-ember")
    expect(cfg.iconLibrary).toBe("lucide")
    await access(path.join(dir, "lib", "utils.ts"))
  })

  it("已有配置无 --yes 时拒绝覆盖", async () => {
    await runInitCommand({ cwd: dir })
    await expect(runInitCommand({ cwd: dir })).rejects.toThrow(/--yes/)
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
})
