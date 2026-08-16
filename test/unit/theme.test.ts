// L1 单元测试：主题运行时注入函数（路径③：色板/明暗/圆角自由切换）
import { describe, it, expect } from "vitest"
import { buildThemeCssText } from "../../registry/bases/base/lib/theme"
import themes from "../../registry/bases/base/themes.json"

describe("buildThemeCssText（主题注入，路径③）", () => {
  it("生成 :root（light）+ .dark（dark）变量规则", () => {
    const css = buildThemeCssText(themes, { color: "emerald" })
    expect(css).toContain(":root")
    expect(css).toContain("--color-primary: #10b981")
    expect(css).toContain(".dark")
    expect(css).toContain("--color-primary: #34d399")
  })

  it("切换色板：red/violet 生成不同变量值", () => {
    const red = buildThemeCssText(themes, { color: "red" })
    const violet = buildThemeCssText(themes, { color: "violet" })
    expect(red).toContain("#dc2626")
    expect(violet).toContain("#8b5cf6")
    expect(red).not.toBe(violet)
  })

  it("radius 覆盖：none/full 输出 body 类规则，default 沿用 style 层", () => {
    const none = buildThemeCssText(themes, { color: "emerald", radius: "none" })
    expect(none).toContain("body.radius-none")
    expect(none).toContain("--radius: 0px")

    const full = buildThemeCssText(themes, { color: "emerald", radius: "full" })
    expect(full).toContain("body.radius-full")
    expect(full).toContain("--radius: 9999px")

    const dflt = buildThemeCssText(themes, {
      color: "emerald",
      radius: "default",
    })
    expect(dflt).not.toContain("body.radius-")
  })

  it("未知色板抛错", () => {
    expect(() => buildThemeCssText(themes, { color: "nope" })).toThrow(
      /未知色板/
    )
  })
})
