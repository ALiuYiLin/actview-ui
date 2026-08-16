// L3 集成测试：buildRegistry 整条构建管线（产物清单 + 无残留 + 互异）
import { describe, it, expect } from "vitest"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildRegistry } from "../../scripts/lib/build-registry.mjs"

const STYLES_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "styles"
)

describe("buildRegistry（集成）", () => {
  it("产物 12 文件、无 cn-* 残留、三套 style 互异", async () => {
    const written = await buildRegistry({ silent: true })
    expect(written).toHaveLength(12)

    for (const file of written) {
      const content = await readFile(path.join(STYLES_ROOT, file), "utf8")
      expect(content).not.toMatch(/\bcn-[a-z0-9-]+\b/)
    }

    // 三套 style 的 button 互不相同（style 真正生效）
    const aurora = await readFile(
      path.join(STYLES_ROOT, "base-aurora", "ui", "button.tsx"),
      "utf8"
    )
    const ember = await readFile(
      path.join(STYLES_ROOT, "base-ember", "ui", "button.tsx"),
      "utf8"
    )
    const mist = await readFile(
      path.join(STYLES_ROOT, "base-mist", "ui", "button.tsx"),
      "utf8"
    )
    expect(aurora).not.toBe(ember)
    expect(ember).not.toBe(mist)
    expect(aurora).not.toBe(mist)
  })

  it("产物 import 重写正确（ui 互引 / lib/utils / icon-placeholder）", async () => {
    await buildRegistry({ silent: true })
    const group = await readFile(
      path.join(STYLES_ROOT, "base-aurora", "ui", "button-group.tsx"),
      "utf8"
    )
    expect(group).toContain("@/styles/base-aurora/ui/separator")
    expect(group).toContain("@/styles/base-aurora/components/icon-placeholder")
    expect(group).toContain("@/lib/utils")
  })
})
