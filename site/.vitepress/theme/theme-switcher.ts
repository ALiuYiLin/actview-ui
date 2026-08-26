// 主题切换器（纯 DOM 实现，fixed 右下角面板）：
//   - 视觉风格：8 套官方样式（v4 registry/styles，body.style-<name> 作用域）
//   - 色板：24 色（v4 themes，buildThemeCssText 注入 --color-* 变量）
//   - 基色：7 个中性基色（v4 baseColors，与色板合并）
//   - 图表色：24 色（chart-1~5 覆盖，默认跟随色板）
//   - 圆角：5 档（default/none/small/medium/large）
//   - 字体：26 种（--font-sans）+ 标题字体（inherit + 26，--font-heading）
//   - 菜单强调：subtle / bold；菜单色：default/inverted/translucent 系
//   - 指针：cursor pointer；缩放：80-120%；RTL 方向
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

export const MENU_ACCENTS = ["subtle", "bold"] as const
export type MenuAccent = (typeof MENU_ACCENTS)[number]

export const MENU_COLORS = [
  "default",
  "inverted",
  "default-translucent",
  "inverted-translucent",
] as const
export type MenuColor = (typeof MENU_COLORS)[number]

export const SIZES = [80, 90, 100, 110, 120] as const
export type SizeValue = (typeof SIZES)[number]

const DEFAULT_STYLE: StyleName = "luma"
const DEFAULT_PALETTE = "neutral"
const DEFAULT_BASE_COLOR = "neutral"
const DEFAULT_RADIUS: RadiusName = "default"
const DEFAULT_FONT = "inter"
const DEFAULT_FONT_HEADING = "inherit"
const DEFAULT_CHART_COLOR = "follow"
const DEFAULT_MENU_ACCENT: MenuAccent = "subtle"
const DEFAULT_MENU_COLOR: MenuColor = "default"
const DEFAULT_POINTER = false
const DEFAULT_SIZE: SizeValue = 100
const DEFAULT_RTL = false

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

// 26 种字体（v4 font-definitions，themes.json.fonts）
type FontDef = { name: string; title: string; type: string; family: string; import: string }
const ALL_FONTS: FontDef[] = (themes as { fonts?: FontDef[] }).fonts ?? []
export const FONTS = ALL_FONTS.filter((f) => f.type !== "mono")
export const MONO_FONTS = ALL_FONTS.filter((f) => f.type === "mono")
export const FONT_HEADING_VALUES = ["inherit", ...ALL_FONTS.map((f) => f.name)] as const

interface Prefs {
  style: StyleName
  palette: PaletteName
  baseColor: string
  chartColor: string
  radius: RadiusName
  font: string
  fontHeading: string
  menuAccent: MenuAccent
  menuColor: MenuColor
  pointer: boolean
  size: SizeValue
  rtl: boolean
  dark: boolean
}

const STORAGE_KEY = "actview-ui-theme-prefs"

function fallbackPrefs(): Prefs {
  return {
    style: DEFAULT_STYLE,
    palette: DEFAULT_PALETTE,
    baseColor: DEFAULT_BASE_COLOR,
    chartColor: DEFAULT_CHART_COLOR,
    radius: DEFAULT_RADIUS,
    font: DEFAULT_FONT,
    fontHeading: DEFAULT_FONT_HEADING,
    menuAccent: DEFAULT_MENU_ACCENT,
    menuColor: DEFAULT_MENU_COLOR,
    pointer: DEFAULT_POINTER,
    size: DEFAULT_SIZE,
    rtl: DEFAULT_RTL,
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
        chartColor:
          parsed.chartColor === "follow" ||
          ALL_PALETTES.some((p) => p.name === parsed.chartColor)
            ? parsed.chartColor
            : DEFAULT_CHART_COLOR,
        radius: RADII.includes(parsed.radius) ? parsed.radius : DEFAULT_RADIUS,
        font: ALL_FONTS.some((f) => f.name === parsed.font)
          ? parsed.font
          : DEFAULT_FONT,
        fontHeading: FONT_HEADING_VALUES.includes(parsed.fontHeading)
          ? parsed.fontHeading
          : DEFAULT_FONT_HEADING,
        menuAccent: MENU_ACCENTS.includes(parsed.menuAccent)
          ? parsed.menuAccent
          : DEFAULT_MENU_ACCENT,
        menuColor: MENU_COLORS.includes(parsed.menuColor)
          ? parsed.menuColor
          : DEFAULT_MENU_COLOR,
        pointer: Boolean(parsed.pointer),
        size: SIZES.includes(parsed.size) ? parsed.size : DEFAULT_SIZE,
        rtl: Boolean(parsed.rtl),
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
let pointerStyleEl: HTMLStyleElement | null = null
let fontLinkEl: HTMLLinkElement | null = null
let fontHeadingLinkEl: HTMLLinkElement | null = null

const POINTER_CURSOR_SELECTOR =
  'button:not(:disabled), [role="button"]:not(:disabled)'

function applyThemeVars(prefs: Prefs): void {
  if (!paletteStyleEl) {
    paletteStyleEl = document.createElement("style")
    paletteStyleEl.setAttribute("data-actview-ui-palette", "1")
    document.head.appendChild(paletteStyleEl)
  }
  paletteStyleEl.textContent = buildThemeCssText(themes, {
    color: prefs.palette,
    baseColor: prefs.baseColor,
    chartColor: prefs.chartColor === "follow" ? undefined : prefs.chartColor,
    menuAccent: prefs.menuAccent,
    radius: prefs.radius,
  })
  document.documentElement.classList.toggle("dark", prefs.dark)
}

function applyStyle(name: StyleName): void {
  document.body.classList.remove(...STYLE_NAMES.map((s) => `style-${s}`))
  document.body.classList.add(`style-${name}`)
}

/** 加载 Google Fonts 并设置 --font-sans / --font-heading（v4 语义） */
function applyFonts(prefs: Prefs): void {
  const doc = document.documentElement
  const setFontVar = (
    linkRef: { current: HTMLLinkElement | null },
    varName: string,
    fontName: string | null
  ) => {
    if (!fontName) {
      doc.style.removeProperty(varName)
      return
    }
    const font = ALL_FONTS.find((f) => f.name === fontName)
    if (!font) {
      doc.style.removeProperty(varName)
      return
    }
    // 动态加载字体（Google Fonts CSS2；失败时回退系统字体）
    const importName = font.import.replace(/_/g, " ")
    const url = `https://fonts.googleapis.com/css2?family=${importName.replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`
    if (!linkRef.current || linkRef.current.href !== url) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      document.head.appendChild(link)
      linkRef.current = link
    }
    doc.style.setProperty(varName, font.family)
  }

  setFontVar({ current: fontLinkEl }, "--font-sans", prefs.font)
  const heading =
    prefs.fontHeading === "inherit" ? prefs.font : prefs.fontHeading
  setFontVar({ current: fontHeadingLinkEl }, "--font-heading", heading)
  // mono 字体族不变
}

function applyPointer(pointer: boolean): void {
  if (pointer) {
    if (!pointerStyleEl) {
      pointerStyleEl = document.createElement("style")
      pointerStyleEl.setAttribute("data-actview-ui-pointer", "1")
      document.head.appendChild(pointerStyleEl)
    }
    pointerStyleEl.textContent = `@layer base {\n  ${POINTER_CURSOR_SELECTOR} {\n    cursor: pointer;\n  }\n}\n`
  } else {
    pointerStyleEl?.remove()
    pointerStyleEl = null
  }
}

function applySize(size: SizeValue): void {
  document.documentElement.style.fontSize = `${size}%`
}

function applyRtl(rtl: boolean): void {
  document.documentElement.dir = rtl ? "rtl" : "ltr"
}

/** 菜单色：.cn-menu-target 元素加/减 dark（inverted）与 translucent class（v4 语义） */
function applyMenuColor(menuColor: MenuColor): void {
  const isInverted = menuColor === "inverted" || menuColor === "inverted-translucent"
  const isTranslucent =
    menuColor === "default-translucent" || menuColor === "inverted-translucent"
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(
      ".cn-menu-target, [data-menu-translucent]"
    )
  )) {
    el.classList.toggle("dark", isInverted)
    if (isTranslucent) {
      el.classList.add("cn-menu-translucent")
      el.removeAttribute("data-menu-translucent")
    } else if (el.classList.contains("cn-menu-translucent")) {
      el.classList.remove("cn-menu-translucent")
      el.setAttribute("data-menu-translucent", "")
    }
  }
}

function applyAll(prefs: Prefs): void {
  applyStyle(prefs.style)
  applyThemeVars(prefs)
  applyFonts(prefs)
  applyPointer(prefs.pointer)
  applySize(prefs.size)
  applyRtl(prefs.rtl)
  applyMenuColor(prefs.menuColor)
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

function buildSelect(
  values: readonly string[],
  labels: Record<string, string>,
  current: string,
  onChange: (value: string) => void
): HTMLSelectElement {
  const select = document.createElement("select")
  select.className = "actview-ui-switcher-select"
  for (const value of values) {
    const option = document.createElement("option")
    option.value = value
    option.textContent = labels[value] ?? value
    option.selected = value === current
    select.appendChild(option)
  }
  select.addEventListener("change", () => onChange(select.value))
  return select
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
    setActive(chartRow, prefs.chartColor)
    setActive(radiusRow, prefs.radius)
    setActive(accentRow, prefs.menuAccent)
    setActive(menuRow, prefs.menuColor)
    setActive(pointerRow, prefs.pointer ? "on" : "off")
    setActive(sizeRow, String(prefs.size))
    setActive(rtlRow, prefs.rtl ? "rtl" : "ltr")
    setActive(themeRow, prefs.dark ? "dark" : "light")
    fontSelect.value = prefs.font
    headingSelect.value = prefs.fontHeading
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

  // 图表色（24，默认跟随色板）
  panel.appendChild(buildLabel("图表色"))
  const chartRow = buildRow()
  chartRow.appendChild(
    buildButton("follow", "跟随", () => {
      prefs.chartColor = "follow"
      applyThemeVars(prefs)
      savePrefs(prefs)
      setActive(chartRow, "follow")
      summary.textContent = describePrefs(prefs)
    })
  )
  for (const p of ALL_PALETTES) {
    chartRow.appendChild(
      buildSwatch(p.name, `图表 ${p.label}`, p.swatch, () => {
        prefs.chartColor = p.name
        applyThemeVars(prefs)
        savePrefs(prefs)
        setActive(chartRow, p.name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(chartRow)

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

  // 字体（26）+ 标题字体
  panel.appendChild(buildLabel("字体"))
  const fontLabels: Record<string, string> = {}
  for (const f of ALL_FONTS) fontLabels[f.name] = f.title
  const fontSelect = buildSelect(
    ALL_FONTS.map((f) => f.name),
    fontLabels,
    prefs.font,
    (value) => {
      prefs.font = value
      applyFonts(prefs)
      savePrefs(prefs)
      summary.textContent = describePrefs(prefs)
    }
  )
  panel.appendChild(fontSelect)
  panel.appendChild(buildLabel("标题字体"))
  const headingLabels: Record<string, string> = { inherit: "跟随正文" }
  for (const f of ALL_FONTS) headingLabels[f.name] = f.title
  const headingSelect = buildSelect(
    FONT_HEADING_VALUES,
    headingLabels,
    prefs.fontHeading,
    (value) => {
      prefs.fontHeading = value
      applyFonts(prefs)
      savePrefs(prefs)
      summary.textContent = describePrefs(prefs)
    }
  )
  panel.appendChild(headingSelect)

  // 菜单强调
  panel.appendChild(buildLabel("菜单强调"))
  const accentRow = buildRow()
  for (const name of MENU_ACCENTS) {
    accentRow.appendChild(
      buildButton(name, name.charAt(0).toUpperCase() + name.slice(1), () => {
        prefs.menuAccent = name
        applyThemeVars(prefs)
        savePrefs(prefs)
        setActive(accentRow, name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(accentRow)

  // 菜单色
  panel.appendChild(buildLabel("菜单色"))
  const menuRow = buildRow()
  for (const name of MENU_COLORS) {
    menuRow.appendChild(
      buildButton(name, name, () => {
        prefs.menuColor = name
        applyMenuColor(name)
        savePrefs(prefs)
        setActive(menuRow, name)
        summary.textContent = describePrefs(prefs)
      })
    )
  }
  panel.appendChild(menuRow)

  // 指针 / 缩放 / RTL / 明暗
  panel.appendChild(buildLabel("指针"))
  const pointerRow = buildRow()
  pointerRow.appendChild(
    buildButton("on", "开", () => {
      prefs.pointer = true
      applyPointer(true)
      savePrefs(prefs)
      setActive(pointerRow, "on")
    })
  )
  pointerRow.appendChild(
    buildButton("off", "关", () => {
      prefs.pointer = false
      applyPointer(false)
      savePrefs(prefs)
      setActive(pointerRow, "off")
    })
  )
  panel.appendChild(pointerRow)

  panel.appendChild(buildLabel("缩放"))
  const sizeRow = buildRow()
  for (const size of SIZES) {
    sizeRow.appendChild(
      buildButton(String(size), `${size}%`, () => {
        prefs.size = size
        applySize(size)
        savePrefs(prefs)
        setActive(sizeRow, String(size))
      })
    )
  }
  panel.appendChild(sizeRow)

  panel.appendChild(buildLabel("方向"))
  const rtlRow = buildRow()
  rtlRow.appendChild(
    buildButton("ltr", "LTR", () => {
      prefs.rtl = false
      applyRtl(false)
      savePrefs(prefs)
      setActive(rtlRow, "ltr")
    })
  )
  rtlRow.appendChild(
    buildButton("rtl", "RTL", () => {
      prefs.rtl = true
      applyRtl(true)
      savePrefs(prefs)
      setActive(rtlRow, "rtl")
    })
  )
  panel.appendChild(rtlRow)

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
  setActive(chartRow, prefs.chartColor)
  setActive(radiusRow, prefs.radius)
  setActive(accentRow, prefs.menuAccent)
  setActive(menuRow, prefs.menuColor)
  setActive(pointerRow, prefs.pointer ? "on" : "off")
  setActive(sizeRow, String(prefs.size))
  setActive(rtlRow, prefs.rtl ? "rtl" : "ltr")
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
