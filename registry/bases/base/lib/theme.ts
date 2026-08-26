// 主题运行时注入（复刻 shadcn v4 create 页 design-system-provider 的
// buildRegistryTheme/buildThemeCssText 机制，合并语义对齐 v4 buildTheme(baseColor, theme)）：
//   - baseColors：7 个中性基色（全键 32：background..ring + chart-1~5 + radius + sidebar 全家）
//   - themes：24 个色板（中性 7 个 18 键子集、彩色 17 个 11 键叠加层）
//   - 合并：基色全量 + 色板覆盖（v4 merge-theme 同款 spread）
//   - 输出 :root（light）+ .dark（dark）+ 圆角刻度（--radius-* 由 --radius 推导）
//   - radii：5 档（default/none/small/medium/large）→ body.radius-<name> 覆盖 --radius
// 变量名与组件 style css 的引用一致：--color-* / --radius。
// 数据源：registry/bases/base/themes.json（scripts/sync-v4-themes.mjs 从 v4 提取）。
export type ThemeVars = Record<string, string>

export type Palette = {
  light?: ThemeVars
  dark?: ThemeVars
}

export type Themes = {
  baseColors: Record<string, Palette>
  themes: Record<string, Palette>
  radii?: Record<string, string | null>
}

export type ThemeOptions = {
  color?: string
  baseColor?: string
  radius?: string
}

const RADIUS_SCALE: [string, string][] = [
  ["--radius-sm", "0.6"],
  ["--radius-md", "0.8"],
  ["--radius-lg", "1"],
  ["--radius-xl", "1.4"],
  ["--radius-2xl", "1.8"],
  ["--radius-3xl", "2.2"],
  ["--radius-4xl", "2.6"],
]

function buildCssRule(selector: string, vars?: ThemeVars | null): string {
  if (!vars) {
    return ""
  }
  const declarations = Object.entries(vars)
    .filter(([key, value]) => value != null && value !== "" && key !== "radius")
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n")
  return declarations ? `${selector} {\n${declarations}\n}\n` : ""
}

function buildRadiusScaleRule(): string {
  const declarations = RADIUS_SCALE.map(
    ([key, factor]) => `  ${key}: calc(var(--radius) * ${factor});`
  ).join("\n")
  return `:root {\n${declarations}\n}\n`
}

export function buildThemeCssText(
  themes: Themes,
  options: ThemeOptions = {}
): string {
  const color = options.color ?? Object.keys(themes.themes)[0] ?? "neutral"
  const baseColor =
    options.baseColor ?? Object.keys(themes.baseColors)[0] ?? "neutral"
  const base = themes.baseColors[baseColor]
  const palette = themes.themes[color]
  if (!palette) {
    throw new Error(
      `未知色板 "${color}"。可用：${Object.keys(themes.themes).join(", ")}`
    )
  }
  if (!base) {
    throw new Error(
      `未知基色 "${baseColor}"。可用：${Object.keys(themes.baseColors).join(", ")}`
    )
  }

  // 合并：基色全量 + 色板覆盖（v4 buildTheme 语义）
  const light = { ...(base.light ?? {}), ...(palette.light ?? {}) }
  const dark = { ...(base.dark ?? {}), ...(palette.dark ?? {}) }
  const radius = palette.light?.radius ?? base.light?.radius ?? undefined

  let css = "/* @actview/ui 主题变量（自动生成，勿手改）*/\n"
  css += buildCssRule(":root", light)
  css += buildCssRule(".dark", dark)
  // 圆角：色板内嵌 radius（v4 语义，default 档）→ --radius
  if (radius) {
    css += `:root {\n  --radius: ${radius};\n}\n`
  }
  css += buildRadiusScaleRule()

  // radii 档位覆盖（default 表示沿用色板内嵌值，不输出）
  const radiusValue = themes.radii?.[options.radius ?? "default"] ?? null
  if (radiusValue) {
    css += `body.radius-${options.radius} {\n  --radius: ${radiusValue};\n}\n`
  }

  return css
}

// 运行时切换：生成 css 并注入到 <style id="actview-ui-theme">
export function applyTheme(
  themes: Themes,
  options: ThemeOptions,
  styleElementId = "actview-ui-theme"
): void {
  let el = document.getElementById(styleElementId) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = styleElementId
    document.head.appendChild(el)
  }
  el.textContent = buildThemeCssText(themes, options)
}
