// 主题切换器（纯 DOM 实现，fixed 右下角面板）：
//   - 视觉风格：8 套官方样式（v4 registry/styles，body.style-<name> 作用域）
//   - 色板：24 色（v4 themes，buildThemeCssText 注入 --color-* 变量）
//   - 基色：7 个中性基色（v4 baseColors，与色板合并）
//   - 圆角：5 档（default/none/small/medium/large）
//   - 明暗：html.dark
//   - localStorage 持久化
// 默认组合对齐 shadcn 官方：neutral 色板（黑 primary）+ neutral 基色
import { buildThemeCssText } from "@/registry/bases/base/lib/theme"
import themes from "@/styles/semantic/themes.json"

export const STYLE_NAMES = [
  "luma",
  "lyra",
  "maia",
  "mira",
  "nova",
  "rhea",
  "sera",
  "vega",
] as const
export type StyleName = (typeof STYLE_NAMES)[number]

export const RADII = ["default", "none", "small", "medium", "large"] as const
export type RadiusName = (typeof RADII)[number]

const DEFAULT_STYLE: StyleName = "luma"
const DEFAULT_PALETTE = "neutral"
const DEFAULT_BASE_COLOR = "neutral"
const DEFAULT_RADIUS: RadiusName = "default"

// 24 色板（v4 themes 顺序），swatch 取色板 light.primary
const ALL_PALETTES = Object.entries(themes.themes).map(([name, palette]) => ({
  name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  swatch: palette.light?.primary ?? "#888888",
}))
const NEUTRAL_NAMES = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"]
export const PALETTES = ALL_PALETTES.filter((p) => !NEUTRAL_NAMES.includes(p.name))
export const NEUTRAL_PALETTES = ALL_PALETTES.filter((p) =>
  NEUTRAL_NAMES.includes(p.name)
)
type PaletteName = (typeof ALL_PALETTES)[number]["name"]

const BASE_COLORS = Object.keys(themes.baseColors)

interface Prefs {
  style: StyleName
  palette: PaletteName
  baseColor: string
  radius: RadiusName
  dark: boolean
}

const STORAGE_KEY = "actview-ui-theme-prefs"

function fallbackPrefs(): Prefs {
  return {
    style: DEFAULT_STYLE,
    palette: DEFAULT_PALETTE,
    baseColor: DEFAULT_BASE_COLOR,
    radius: DEFAULT_RADIUS,
    dark: false,
  }
}

function loadPrefs(): Prefs {
  const fallback = fallbackPrefs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        style: STYLE_NAMES.includes(parsed.style) ? parsed.style : DEFAULT_STYLE,
        palette: ALL_PALETTES.some((p) => p.name === parsed.palette)
          ? parsed.palette
          : DEFAULT_PALETTE,
        baseColor: BASE_COLORS.includes(parsed.baseColor)
          ? parsed.baseColor
          : DEFAULT_BASE_COLOR,
        radius: RADII.includes(parsed.radius) ? parsed.radius : DEFAULT_RADIUS,
        dark: Boolean(parsed.dark),
      }
    }
  } catch {
    /* ignore */
  }
  return fallback
}

function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

let paletteStyleEl: HTMLStyleElement | null = null

function applyThemeVars(prefs: Prefs): void {
  if (!paletteStyleEl) {
    paletteStyleEl = document.createElement("style")
    paletteStyleEl.setAttribute("data-actview-ui-palette", "1")
    document.head.appendChild(paletteStyleEl)
  }
  paletteStyleEl.textContent = buildThemeCssText(themes, {
    color: prefs.palette,
    baseColor: prefs.baseColor,
    radius: prefs.radius,
  })
  document.documentElement.classList.toggle("dark", prefs.dark)
}

function applyStyle(name: StyleName): void {
  document.body.classList.remove(...STYLE_NAMES.map((s) => `style-${s}`))
  document.body.classList.add(`style-${name}`)
}

function applyAll(prefs: Prefs): void {
  applyStyle(prefs.style)
  applyThemeVars(prefs)
}

function setActive(container: HTMLElement, value: string): void {
  for (const btn of Array.from(
    container.querySelectorAll<HTMLElement>("[data-value]")
  )) {
    btn.classList.toggle("active", btn.dataset.value === value)
  }
}

function buildLabel(text: string): HTMLElement {
  const label = document.createElement("div")
  label.className = "actview-ui-switcher-label"
  label.textContent = text
  return label
}

function buildRow(): HTMLElement {
  const row = document.createElement("div")
  row.className = "actview-ui-switcher-row"
  return row
}

function buildButton(
  value: string,
  text: string,
  onClick: () => void
): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.dataset.value = value
  btn.textContent = text
  btn.addEventListener("click", onClick)
  return btn
}

function buildSwatch(
  value: string,
  title: string,
  color: string,
  onClick: () => void,
  className = "actview-ui-switcher-swatch"
): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.className = className
  btn.dataset.value = value
  btn.title = title
  btn.style.background = color
  btn.addEventListener("click", onClick)
  return btn
}

function describePrefs(p: Prefs): string {
  return `${p.style} · ${p.palette}${p.baseColor !== "neutral" ? `+${p.baseColor}` : ""} · r=${p.radius} · ${p.dark ? "dark" : "light"}`
}

function buildPanel(prefs: Prefs): HTMLElement {
  const panel = document.createElement("div")
  panel.className = "actview-ui-switcher"

  // 标题：当前组合 + 重置 + 收起
  const title = document.createElement("div")
  title.className = "actview-ui-switcher-title"
  const titleText = document.createElement("span")
  titleText.textContent = "主题定制"
  title.appendChild(titleText)
  const summary = document.createElement("span")
  summary.className = "actview-ui-switcher-summary"
  summary.textContent = describePrefs(prefs)
  title.appendChild(summary)
  const resetBtn = document.createElement("button")
  resetBtn.textContent = "重置"
  resetBtn.addEventListener("click", () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    Object.assign(prefs, fallbackPrefs())
    applyAll(prefs)
    setActive(styleRow, prefs.style)
    setActive(paletteRow, prefs.palette)
    setActive(paletteRow2, prefs.palette)
    setActive(baseRow, prefs.baseColor)
    setActive(radiusRow, prefs.radius)
    setActive(themeRow, prefs.dark ? "dark" : "light")
    summary.textContent = describePrefs(prefs)
  })
  title.appendChild(resetBtn)
  const closeBtn = document.createElement("button")
  closeBtn.textContent = "✕"
  closeBtn.addEventListener("click", () => {
    panel.remove()
  })
  title.appendChild(closeBtn)
  panel.appendChild(title)

  // 风格（8）
  panel.appendChild(buildLabel("风格"))
  const styleRow = buildRow()
  for (const name of STYLE_NAMES) {
    styleRow.appendChild(
      buildButton(name, name.charAt(0).toUpperCase() + name.slice(1), () => {
        prefs.style = name
        applyStyle(name)
        savePrefs(prefs)
        setActive(styleRow, name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(styleRow)

  // 色板（24：中性 7 + 彩色 17）
  panel.appendChild(buildLabel("色板"))
  const paletteRow = buildRow()
  for (const p of NEUTRAL_PALETTES) {
    paletteRow.appendChild(
      buildSwatch(p.name, p.label, p.swatch, () => {
        prefs.palette = p.name
        applyThemeVars(prefs)
        savePrefs(prefs)
        setActive(paletteRow, p.name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(paletteRow)
  const paletteRow2 = buildRow()
  for (const p of PALETTES) {
    paletteRow2.appendChild(
      buildSwatch(p.name, p.label, p.swatch, () => {
        prefs.palette = p.name
        applyThemeVars(prefs)
        savePrefs(prefs)
        setActive(paletteRow2, p.name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(paletteRow2)

  // 基色（7 中性，方形色块与色板圆点区分）
  panel.appendChild(buildLabel("基色"))
  const baseRow = buildRow()
  for (const name of BASE_COLORS) {
    const color =
      themes.baseColors[name]?.light?.primary ?? themes.baseColors[name]?.light?.background ?? "#888"
    baseRow.appendChild(
      buildSwatch(
        name,
        `基色 ${name.charAt(0).toUpperCase() + name.slice(1)}`,
        color,
        () => {
          prefs.baseColor = name
          applyThemeVars(prefs)
          savePrefs(prefs)
          setActive(baseRow, name)
          summary.textContent = describePrefs(prefs)
        },
        "actview-ui-switcher-swatch actview-ui-switcher-swatch-square"
      )
    )
  }
  panel.appendChild(baseRow)

  // 圆角（5 档）
  panel.appendChild(buildLabel("圆角"))
  const radiusRow = buildRow()
  for (const name of RADII) {
    radiusRow.appendChild(
      buildButton(name, name.charAt(0).toUpperCase() + name.slice(1), () => {
        prefs.radius = name
        applyThemeVars(prefs)
        savePrefs(prefs)
        setActive(radiusRow, name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(radiusRow)

  // 明暗
  panel.appendChild(buildLabel("模式"))
  const themeRow = buildRow()
  themeRow.appendChild(
    buildButton("light", "☀ 亮色", () => {
      prefs.dark = false
      applyThemeVars(prefs)
      savePrefs(prefs)
      setActive(themeRow, "light")
      summary.textContent = describePrefs(prefs)
    })
  )
  themeRow.appendChild(
    buildButton("dark", "🌙 暗色", () => {
      prefs.dark = true
      applyThemeVars(prefs)
      savePrefs(prefs)
      setActive(themeRow, "dark")
      summary.textContent = describePrefs(prefs)
    })
  )
  panel.appendChild(themeRow)

  // 初始高亮
  setActive(styleRow, prefs.style)
  setActive(paletteRow, prefs.palette)
  setActive(paletteRow2, prefs.palette)
  setActive(baseRow, prefs.baseColor)
  setActive(radiusRow, prefs.radius)
  setActive(themeRow, prefs.dark ? "dark" : "light")

  return panel
}

/** 站点入口：应用持久化主题 + 挂载切换面板 */
export function initThemeSwitcher(): void {
  if (typeof document === "undefined") return
  const prefs = loadPrefs()
  applyAll(prefs)
  document.body.appendChild(buildPanel(prefs))
}
