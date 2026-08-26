// L1 单元测试：主题运行时注入函数（路径③：色板/基色/明暗/圆角自由切换）
import { describe, it, expect } from "vitest"
import { buildThemeCssText } from "../../registry/bases/base/lib/theme"
import themes from "../../registry/bases/base/themes.json"

describe("buildThemeCssText（主题注入，路径③）", () => {
  it("生成 :root（light）+ .dark（dark）变量规则（v4 oklch 值 + 色板内嵌 radius）", () => {
    const css = buildThemeCssText(themes, { color: "emerald" })
    expect(css).toContain(":root")
    // emerald 彩色（11 键叠加层）：primary 用 oklch
    expect(css).toContain("--color-primary: oklch")
    expect(css).toContain(".dark")
    // 基色 neutral 全键兜底：background 来自 baseColors
    expect(css).toContain("--color-background: oklch(1 0 0)")
    // 色板内嵌 radius（default 档）→ --radius
    expect(css).toContain("--radius: 0.625rem")
    // 圆角刻度
    expect(css).toContain("--radius-4xl: calc(var(--radius) * 2.6)")
  })

  it("合并语义：基色全量 + 色板覆盖（v4 buildTheme），彩色仅覆盖自身键", () => {
    const emerald = buildThemeCssText(themes, { color: "emerald" })
    const neutral = buildThemeCssText(themes, { color: "neutral" })
    // emerald 覆盖 primary；background/card 等继承 neutral
    expect(emerald).toContain("--color-background: oklch(1 0 0)")
    expect(emerald).toContain("--color-card: oklch(1 0 0)")
    expect(neutral).toContain("--color-primary: oklch(0.205 0 0)")
    expect(emerald).not.toBe(neutral)
  })

  it("baseColor 切换：stone/zinc 改变中性底色", () => {
    const stone = buildThemeCssText(themes, {
      color: "emerald",
      baseColor: "stone",
    })
    expect(stone).toContain("--color-background: oklch")
    const neutral = buildThemeCssText(themes, {
      color: "emerald",
      baseColor: "neutral",
    })
    expect(stone).not.toBe(neutral)
  })

  it("切换色板：red/violet 生成不同 primary", () => {
    const red = buildThemeCssText(themes, { color: "red" })
    const violet = buildThemeCssText(themes, { color: "violet" })
    expect(red).not.toBe(violet)
    expect(red).toContain("--color-primary: oklch")
  })

  it("radius 档位：none/small/medium/large 输出 body 类规则，default 沿用色板内嵌值", () => {
    const none = buildThemeCssText(themes, { color: "emerald", radius: "none" })
    expect(none).toContain("body.radius-none")
    expect(none).toContain("--radius: 0")

    const small = buildThemeCssText(themes, { color: "emerald", radius: "small" })
    expect(small).toContain("body.radius-small")
    expect(small).toContain("--radius: 0.45rem")

    const large = buildThemeCssText(themes, { color: "emerald", radius: "large" })
    expect(large).toContain("body.radius-large")
    expect(large).toContain("--radius: 0.875rem")

    const dflt = buildThemeCssText(themes, {
      color: "emerald",
      radius: "default",
    })
    expect(dflt).not.toContain("body.radius-")
  })

  it("chart/sidebar 变量输出（32 键全量）", () => {
    const css = buildThemeCssText(themes, { color: "emerald" })
    expect(css).toContain("--color-chart-1: oklch")
    expect(css).toContain("--color-sidebar-foreground: oklch")
  })

  it("未知色板/基色抛错", () => {
    expect(() => buildThemeCssText(themes, { color: "nope" })).toThrow(
      /未知色板/
    )
    expect(() =>
      buildThemeCssText(themes, { color: "emerald", baseColor: "nope" })
    ).toThrow(/未知基色/)
  })
})
