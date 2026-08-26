// 主题定制状态（受控组件的数据源）：
//   - prefs：单一响应式状态（ref<Prefs>），所有子组件纯受控（props 下传 + onChange 上抛）
//   - setPref/reset：唯一的写入口（UI 事件 → setPref → prefs 变更 → watch 副作用 + 派生渲染）
//   - 声明式派生（渲染端）：themeCss（CSS 变量文本，渲染为 <style>）、pointerCss、
//     fontLink/fontHeadingLink（Google Fonts link URL）——组件内零 DOM 操作
//   - 响应式副作用（框架渲染端）：body.style-*、html.dark/dir/fontSize、--font-* 变量、
//     menuColor 的 .cn-menu-target —— body class 等无声明式替代，集中在 watch 内管理
import { computed, ref, watch } from "actview"
import { buildThemeCssText } from "@/registry/bases/base/lib/theme"
import themes from "@/registry/bases/base/themes.json"

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

export const RADII = ["default", "none", "small", "medium", "large"] as const

export const MENU_ACCENTS = ["subtle", "bold"] as const

export const MENU_COLORS = [
  "default",
  "inverted",
  "default-translucent",
  "inverted-translucent",
] as const

export const SIZES = [80, 90, 100, 110, 120] as const

const DEFAULT_STYLE = "luma"
const DEFAULT_PALETTE = "neutral"
const DEFAULT_BASE_COLOR = "neutral"
const DEFAULT_RADIUS = "default"
const DEFAULT_FONT = "inter"
const DEFAULT_FONT_HEADING = "inherit"
const DEFAULT_CHART_COLOR = "follow"
const DEFAULT_MENU_ACCENT = "subtle"
const DEFAULT_MENU_COLOR = "default"
const DEFAULT_POINTER = false
const DEFAULT_SIZE = 100
const DEFAULT_RTL = false

// 24 色板（v4 themes 顺序），swatch 取色板 light.primary
export const ALL_PALETTES = Object.entries(themes.themes).map(([name, palette]) => ({
  name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  swatch: palette.light?.primary ?? "#888888",
}))
const NEUTRAL_NAMES = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"]
export const NEUTRAL_PALETTES = ALL_PALETTES.filter((p) =>
  NEUTRAL_NAMES.includes(p.name)
)
export const COLOR_PALETTES = ALL_PALETTES.filter(
  (p) => !NEUTRAL_NAMES.includes(p.name)
)
// keyof 收窄：themes.baseColors 是字面量对象类型，索引需要 keyof
export const BASE_COLORS = Object.keys(themes.baseColors) as (keyof typeof themes.baseColors)[]

/** 基色 swatch items（供 SwatchRow 受控渲染，方形与色板圆点区分） */
export const BASE_COLOR_ITEMS = BASE_COLORS.map((name) => ({
  name: name as string,
  label: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
  swatch:
    themes.baseColors[name]?.light?.primary ??
    themes.baseColors[name]?.light?.background ??
    "#888",
}))

// 26 种字体（v4 font-definitions，themes.json.fonts）
type FontDef = { name: string; title: string; type: string; family: string; import: string }
export const ALL_FONTS: FontDef[] = themes.fonts ?? []
export const FONT_HEADING_VALUES = ["inherit", ...ALL_FONTS.map((f) => f.name)]

export interface Prefs {
  style: string
  palette: string
  baseColor: string
  chartColor: string
  radius: string
  font: string
  fontHeading: string
  menuAccent: string
  menuColor: string
  pointer: boolean
  size: number
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        style: STYLE_NAMES.includes(p.style) ? p.style : DEFAULT_STYLE,
        palette: ALL_PALETTES.some((x) => x.name === p.palette)
          ? p.palette
          : DEFAULT_PALETTE,
        baseColor: BASE_COLORS.includes(p.baseColor)
          ? p.baseColor
          : DEFAULT_BASE_COLOR,
        chartColor:
          p.chartColor === "follow" ||
          ALL_PALETTES.some((x) => x.name === p.chartColor)
            ? p.chartColor
            : DEFAULT_CHART_COLOR,
        radius: RADII.includes(p.radius) ? p.radius : DEFAULT_RADIUS,
        font: ALL_FONTS.some((f) => f.name === p.font) ? p.font : DEFAULT_FONT,
        fontHeading: FONT_HEADING_VALUES.includes(p.fontHeading)
          ? p.fontHeading
          : DEFAULT_FONT_HEADING,
        menuAccent: MENU_ACCENTS.includes(p.menuAccent)
          ? p.menuAccent
          : DEFAULT_MENU_ACCENT,
        menuColor: MENU_COLORS.includes(p.menuColor)
          ? p.menuColor
          : DEFAULT_MENU_COLOR,
        pointer: Boolean(p.pointer),
        size: SIZES.includes(p.size) ? p.size : DEFAULT_SIZE,
        rtl: Boolean(p.rtl),
        dark: Boolean(p.dark),
      }
    }
  } catch {
    /* localStorage 不可用/损坏时回退默认 */
  }
  return fallbackPrefs()
}

function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

const POINTER_CURSOR_SELECTOR =
  'button:not(:disabled), [role="button"]:not(:disabled)'

function fontCssUrl(fontName: string): string | null {
  const font = ALL_FONTS.find((f) => f.name === fontName)
  if (!font) return null
  const importName = font.import.replace(/_/g, " ")
  return `https://fonts.googleapis.com/css2?family=${importName.replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`
}

export function useThemePrefs() {
  const prefs = ref<Prefs>(loadPrefs())

  /** 唯一的写入口：UI 事件 → setPref → prefs 变更 → watch 副作用 + 派生渲染 */
  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    prefs.value[key] = value
    savePrefs(prefs.value)
  }

  /** 恢复默认组合（不清空页面，面板各受控控件随 prefs 复位） */
  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    Object.assign(prefs.value, fallbackPrefs())
    savePrefs(prefs.value)
  }

  // —— 声明式派生（渲染端，组件内零 DOM 操作）——
  /** CSS 变量文本 → 渲染为 <style>{themeCss}</style> */
  const themeCss = computed(() =>
    buildThemeCssText(themes, {
      color: prefs.value.palette,
      baseColor: prefs.value.baseColor,
      chartColor: prefs.value.chartColor === "follow" ? undefined : prefs.value.chartColor,
      menuAccent: prefs.value.menuAccent === "bold" ? "bold" : "subtle",
      radius: prefs.value.radius,
    })
  )

  /** 指针 cursor CSS → 有值渲染 <style>，null 不渲染 */
  const pointerCss = computed(() =>
    prefs.value.pointer
      ? `@layer base {\n  ${POINTER_CURSOR_SELECTOR} {\n    cursor: pointer;\n  }\n}\n`
      : null
  )

  /** Google Fonts link URL → null 不渲染 <link> */
  const fontLink = computed(() => fontCssUrl(prefs.value.font))
  const fontHeadingLink = computed(() =>
    fontCssUrl(
      prefs.value.fontHeading === "inherit" ? prefs.value.font : prefs.value.fontHeading
    )
  )

  /** 当前组合摘要 */
  const summary = computed(() => {
    const p = prefs.value
    return `${p.style} · ${p.palette}${p.baseColor !== "neutral" ? `+${p.baseColor}` : ""} · r=${p.radius} · ${p.dark ? "dark" : "light"}`
  })

  // —— 响应式副作用（框架渲染端；body class / html 属性无声明式替代，集中于此）——
  watch(
    prefs,
    (p) => {
      if (typeof document === "undefined") return
      const doc = document.documentElement
      const body = document.body

      // 视觉风格：body.style-<name>（style.css 的 .style-* 作用域选择器）
      body.classList.remove(...STYLE_NAMES.map((s) => `style-${s}`))
      body.classList.add(`style-${p.style}`)

      // 明暗 / 方向 / 缩放
      doc.classList.toggle("dark", p.dark)
      doc.dir = p.rtl ? "rtl" : "ltr"
      doc.style.fontSize = `${p.size}%`

      // 字体变量（link 由声明式渲染加载，变量在此写入）
      const font = ALL_FONTS.find((f) => f.name === p.font)
      if (font) doc.style.setProperty("--font-sans", font.family)
      else doc.style.removeProperty("--font-sans")
      const heading = ALL_FONTS.find(
        (f) => f.name === (p.fontHeading === "inherit" ? p.font : p.fontHeading)
      )
      if (heading) doc.style.setProperty("--font-heading", heading.family)
      else doc.style.removeProperty("--font-heading")

      // 菜单色：.cn-menu-target 元素加/减 dark（inverted）与 translucent class
      const isInverted =
        p.menuColor === "inverted" || p.menuColor === "inverted-translucent"
      const isTranslucent =
        p.menuColor === "default-translucent" || p.menuColor === "inverted-translucent"
      for (const el of Array.from(
        body.querySelectorAll<HTMLElement>(
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
    },
    { immediate: true, deep: true }
  )

  return {
    prefs,
    setPref,
    reset,
    summary,
    themeCss,
    pointerCss,
    fontLink,
    fontHeadingLink,
  }
}

export type ThemePrefsStore = ReturnType<typeof useThemePrefs>
