// 主题运行时注入（复刻 shadcn create 页 design-system-provider 的
// buildRegistryTheme/buildThemeCssText 机制）：
//   buildThemeCssText(themes, { color, theme, radius }) → css 字符串
//   注入 <style> 元素即可切换色板 / 明暗 / 圆角。
//
// 变量名与组件 style css 的引用一致：--color-* / --radius / --radius-md。
export type ThemeVars = Record<string, string>

export type Themes = {
  colors: Record<string, { light: ThemeVars; dark: ThemeVars }>
  radius?: Record<string, string | null>
}

export type ThemeOptions = {
  color?: string
  theme?: "light" | "dark"
  radius?: string
}

function buildCssRule(selector: string, vars?: ThemeVars | null) {
  if (!vars) {
    return ""
  }
  const declarations = Object.entries(vars)
    .filter(([, value]) => value != null && value !== "")
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n")
  return declarations ? `${selector} {\n${declarations}\n}\n` : ""
}

export function buildThemeCssText(
  themes: Themes,
  options: ThemeOptions = {}
): string {
  const color = options.color ?? Object.keys(themes.colors)[0] ?? "emerald"
  const palette = themes.colors[color]
  if (!palette) {
    throw new Error(
      `未知色板 "${color}"。可用：${Object.keys(themes.colors).join(", ")}`
    )
  }

  let css = "/* @actview/ui 主题变量（自动生成，勿手改）*/\n"
  // :root 同时写 light 值（默认亮色）
  css += buildCssRule(":root", { ...palette.dark, ...palette.light })
  css += buildCssRule(".dark", palette.dark)

  // radius 覆盖（default 表示沿用 style 层默认值，不输出）
  const radiusValue = themes.radius?.[options.radius ?? "default"] ?? null
  if (radiusValue) {
    css += `body.radius-${options.radius} {\n  --radius: ${radiusValue};\n  --radius-md: ${radiusValue};\n}\n`
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
