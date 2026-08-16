// L3 集成测试：buildRegistry / buildSemanticRegistry 两条构建管线
import { describe, it, expect } from "vitest"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildRegistry,
  buildSemanticRegistry,
} from "../../scripts/lib/build-registry.mjs"

const STYLES_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "styles"
)

describe("buildRegistry（路径①：展开产物）", () => {
  it("产物 18 文件（3 style × 6 items）、无 cn-* 残留、展开产物三套一致", async () => {
    const written = await buildRegistry({ silent: true })
    expect(written).toHaveLength(18)

    for (const file of written) {
      const content = await readFile(path.join(STYLES_ROOT, file), "utf8")
      expect(content).not.toMatch(/\bcn-[a-z0-9-]+\b/)
    }

    // token 全量同步后（docs/MIGRATION.md §3.8：3 套 style 共用 luma token 体），
    // 路径①展开产物三套一致是预期行为——style 差异由 style 层默认变量
    // （--radius）与 themes.json 主题层承担，不再写进组件类。
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
    expect(aurora).toBe(ember)
    expect(ember).toBe(mist)

    // style 层差异真实存在：三套壳的 --radius 默认值互异
    const registryStylesRoot = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "registry",
      "styles"
    )
    const readStyle = (name) =>
      readFile(path.join(registryStylesRoot, `${name}.css`), "utf8")
    const radiusValues = []
    for (const name of ["style-aurora", "style-ember", "style-mist"]) {
      const css = await readStyle(name)
      const m = css.match(/--radius:\s*([^;]+);/)
      radiusValues.push(m?.[1])
    }
    expect(new Set(radiusValues).size).toBe(3)
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

describe("buildSemanticRegistry（路径②：自由切换）", () => {
  it("组件保留 cn-* 语义类，样式表含三套作用域规则", async () => {
    const written = await buildSemanticRegistry({ silent: true })
    expect(written).toContain("styles.css")
    expect(written).toContain("ui/button.tsx")

    // 语义类保留（不展开）
    const btn = await readFile(
      path.join(STYLES_ROOT, "semantic", "ui", "button.tsx"),
      "utf8"
    )
    expect(btn).toMatch(/"cn-button/)
    expect(btn).toContain('"cn-button-variant-default"')
    expect(btn).toContain("@/lib/utils")

    // 互引走 semantic 体系
    const group = await readFile(
      path.join(STYLES_ROOT, "semantic", "ui", "button-group.tsx"),
      "utf8"
    )
    expect(group).toContain("@/styles/semantic/ui/separator")
    expect(group).toContain("@/styles/semantic/components/icon-placeholder")
    expect(group).toContain("<IconPlaceholder")

    // 作用域样式表：三套 .style-<name> + .cn-* 规则
    const css = await readFile(
      path.join(STYLES_ROOT, "semantic", "styles.css"),
      "utf8"
    )
    for (const name of ["aurora", "ember", "mist"]) {
      expect(css).toContain(`.style-${name}`)
    }
    expect(css).toContain(".cn-button")
  })
})
