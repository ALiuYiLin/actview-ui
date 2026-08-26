// 主题切换器（ActView 组件版）：fixed 右下角面板，作为主题的 floatingChildrens 挂载。
// 参考 C:\code\vitepress\docs\.vitepress\theme（FloatingBall.tsx）写法：
//   - 组件函数直接返回 JSX（Babel 自动转 defineComponent，不使用 defineComponent 形式）
//   - 响应式状态用 ref/computed（actview 包入口），事件用 onClick/onChange
// 功能（对齐 shadcn v4 官方定制器）：
//   - 视觉风格 8 / 色板 24 / 基色 7 / 图表色 24 / 圆角 5 / 字体 26+标题
//   - 菜单强调 subtle|bold / 菜单色 4 档 / 指针 / 缩放 80-120% / RTL / 明暗
//   - localStorage 持久化 + 重置按钮 + 当前组合摘要
import { computed, ref } from "actview"
import { buildThemeCssText } from "@/registry/bases/base/lib/theme"
import themes from "@/registry/bases/base/themes.json"

const STYLE_NAMES = [
  "luma",
  "lyra",
  "maia",
  "mira",
  "nova",
  "rhea",
  "sera",
  "vega",
] as const

const RADII = ["default", "none", "small", "medium", "large"] as const

const MENU_ACCENTS = ["subtle", "bold"] as const

const MENU_COLORS = [
  "default",
  "inverted",
  "default-translucent",
  "inverted-translucent",
] as const

const SIZES = [80, 90, 100, 110, 120] as const

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
const ALL_PALETTES = Object.entries(themes.themes).map(([name, palette]) => ({
  name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  swatch: palette.light?.primary ?? "#888888",
}))
const NEUTRAL_NAMES = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"]
const NEUTRAL_PALETTES = ALL_PALETTES.filter((p) => NEUTRAL_NAMES.includes(p.name))
const COLOR_PALETTES = ALL_PALETTES.filter((p) => !NEUTRAL_NAMES.includes(p.name))
const BASE_COLORS = Object.keys(themes.baseColors)

// 26 种字体（v4 font-definitions，themes.json.fonts）
type FontDef = { name: string; title: string; type: string; family: string; import: string }
const ALL_FONTS: FontDef[] = themes.fonts ?? []
const FONT_HEADING_VALUES = ["inherit", ...ALL_FONTS.map((f) => f.name)]

interface Prefs {
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

function applyThemeVars(prefs: Prefs): void {
  const doc = document.documentElement
  let styleEl = document.getElementById(
    "actview-ui-palette-vars"
  ) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement("style")
    styleEl.id = "actview-ui-palette-vars"
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = buildThemeCssText(themes, {
    color: prefs.palette,
    baseColor: prefs.baseColor,
    chartColor: prefs.chartColor === "follow" ? undefined : prefs.chartColor,
    menuAccent: prefs.menuAccent === "bold" ? "bold" : "subtle",
    radius: prefs.radius,
  })
  doc.classList.toggle("dark", prefs.dark)
}

function applyStyle(name: string): void {
  document.body.classList.remove(...STYLE_NAMES.map((s) => `style-${s}`))
  document.body.classList.add(`style-${name}`)
}

function applyFonts(prefs: Prefs): void {
  const doc = document.documentElement
  const setFontVar = (varName: string, fontName: string | null) => {
    const font = ALL_FONTS.find((f) => f.name === fontName)
    if (!font) {
      doc.style.removeProperty(varName)
      return
    }
    const importName = font.import.replace(/_/g, " ")
    const url = `https://fonts.googleapis.com/css2?family=${importName.replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`
    if (!document.querySelector(`link[data-actview-ui-font="${font.name}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      link.dataset.actviewUiFont = font.name
      document.head.appendChild(link)
    }
    doc.style.setProperty(varName, font.family)
  }
  setFontVar("--font-sans", prefs.font)
  setFontVar("--font-heading", prefs.fontHeading === "inherit" ? prefs.font : prefs.fontHeading)
}

function applyPointer(pointer: boolean): void {
  let styleEl = document.getElementById(
    "actview-ui-pointer-css"
  ) as HTMLStyleElement | null
  if (pointer) {
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "actview-ui-pointer-css"
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = `@layer base {\n  ${POINTER_CURSOR_SELECTOR} {\n    cursor: pointer;\n  }\n}\n`
  } else {
    styleEl?.remove()
  }
}

function applySize(size: number): void {
  document.documentElement.style.fontSize = `${size}%`
}

function applyRtl(rtl: boolean): void {
  document.documentElement.dir = rtl ? "rtl" : "ltr"
}

function applyMenuColor(menuColor: string): void {
  const isInverted =
    menuColor === "inverted" || menuColor === "inverted-translucent"
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
  if (typeof document === "undefined") return
  applyStyle(prefs.style)
  applyThemeVars(prefs)
  applyFonts(prefs)
  applyPointer(prefs.pointer)
  applySize(prefs.size)
  applyRtl(prefs.rtl)
  applyMenuColor(prefs.menuColor)
}

/** 面板主组件：函数组件直接返回 JSX（Babel 自动转 defineComponent） */
export function ThemeSwitcher() {
  const prefs = ref<Prefs>(loadPrefs())
  const open = ref(true)

  // 挂载即应用持久化主题（floatingChildrens 常驻，不随路由卸载）
  applyAll(prefs.value)

  const summary = computed(() => {
    const p = prefs.value
    return `${p.style} · ${p.palette}${p.baseColor !== "neutral" ? `+${p.baseColor}` : ""} · r=${p.radius} · ${p.dark ? "dark" : "light"}`
  })

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    prefs.value[key] = value
    savePrefs(prefs.value)
    applyAll(prefs.value)
  }

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    // 恢复默认组合后刷新页面（select 等原生控件显示随之复位）
    Object.assign(prefs.value, fallbackPrefs())
    applyAll(prefs.value)
    location.reload()
  }

  const fontLabels: Record<string, string> = {}
  for (const f of ALL_FONTS) fontLabels[f.name] = f.title

  return (
    <div class="actview-ui-switcher">
      <div class="actview-ui-switcher-title">
        <span>主题定制</span>
        <span class="actview-ui-switcher-summary">{summary.value}</span>
        <button type="button" onClick={reset}>
          重置
        </button>
        <button type="button" onClick={() => (open.value = false)}>
          ✕
        </button>
      </div>

      {open.value && (
        <>
          {/* 风格（8） */}
          <div class="actview-ui-switcher-label">风格</div>
          <div class="actview-ui-switcher-row">
            {STYLE_NAMES.map((name) => (
              <button
                type="button"
                class={prefs.value.style === name ? "active" : ""}
                onClick={() => setPref("style", name)}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>

          {/* 色板（24：中性 7 + 彩色 17） */}
          <div class="actview-ui-switcher-label">色板</div>
          <div class="actview-ui-switcher-row">
            {NEUTRAL_PALETTES.map((p) => (
              <button
                type="button"
                class={
                  prefs.value.palette === p.name
                    ? "actview-ui-switcher-swatch active"
                    : "actview-ui-switcher-swatch"
                }
                style={{ background: p.swatch }}
                title={p.label}
                onClick={() => setPref("palette", p.name)}
              />
            ))}
          </div>
          <div class="actview-ui-switcher-row">
            {COLOR_PALETTES.map((p) => (
              <button
                type="button"
                class={
                  prefs.value.palette === p.name
                    ? "actview-ui-switcher-swatch active"
                    : "actview-ui-switcher-swatch"
                }
                style={{ background: p.swatch }}
                title={p.label}
                onClick={() => setPref("palette", p.name)}
              />
            ))}
          </div>

          {/* 基色（7 中性，方形与色板圆点区分） */}
          <div class="actview-ui-switcher-label">基色</div>
          <div class="actview-ui-switcher-row">
            {BASE_COLORS.map((name) => (
              <button
                type="button"
                class={
                  prefs.value.baseColor === name
                    ? "actview-ui-switcher-swatch actview-ui-switcher-swatch-square active"
                    : "actview-ui-switcher-swatch actview-ui-switcher-swatch-square"
                }
                style={{
                  background:
                    themes.baseColors[name]?.light?.primary ??
                    themes.baseColors[name]?.light?.background ??
                    "#888",
                }}
                title={`基色 ${name.charAt(0).toUpperCase() + name.slice(1)}`}
                onClick={() => setPref("baseColor", name)}
              />
            ))}
          </div>

          {/* 图表色（跟随 + 24） */}
          <div class="actview-ui-switcher-label">图表色</div>
          <div class="actview-ui-switcher-row">
            <button
              type="button"
              class={prefs.value.chartColor === "follow" ? "active" : ""}
              onClick={() => setPref("chartColor", "follow")}
            >
              跟随
            </button>
            {ALL_PALETTES.map((p) => (
              <button
                type="button"
                class={
                  prefs.value.chartColor === p.name
                    ? "actview-ui-switcher-swatch active"
                    : "actview-ui-switcher-swatch"
                }
                style={{ background: p.swatch }}
                title={`图表 ${p.label}`}
                onClick={() => setPref("chartColor", p.name)}
              />
            ))}
          </div>

          {/* 圆角（5 档） */}
          <div class="actview-ui-switcher-label">圆角</div>
          <div class="actview-ui-switcher-row">
            {RADII.map((name) => (
              <button
                type="button"
                class={prefs.value.radius === name ? "active" : ""}
                onClick={() => setPref("radius", name)}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>

          {/* 字体（26）+ 标题字体 */}
          <div class="actview-ui-switcher-label">字体</div>
          <select
            class="actview-ui-switcher-select"
            onChange={(e) => setPref("font", (e.target as HTMLSelectElement).value)}
          >
            {ALL_FONTS.map((f) => (
              <option value={f.name} selected={prefs.value.font === f.name}>
                {f.title}
              </option>
            ))}
          </select>
          <div class="actview-ui-switcher-label">标题字体</div>
          <select
            class="actview-ui-switcher-select"
            onChange={(e) =>
              setPref("fontHeading", (e.target as HTMLSelectElement).value)
            }
          >
            <option value="inherit" selected={prefs.value.fontHeading === "inherit"}>
              跟随正文
            </option>
            {ALL_FONTS.map((f) => (
              <option
                value={f.name}
                selected={prefs.value.fontHeading === f.name}
              >
                {f.title}
              </option>
            ))}
          </select>

          {/* 菜单强调 */}
          <div class="actview-ui-switcher-label">菜单强调</div>
          <div class="actview-ui-switcher-row">
            {MENU_ACCENTS.map((name) => (
              <button
                type="button"
                class={prefs.value.menuAccent === name ? "active" : ""}
                onClick={() => setPref("menuAccent", name)}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>

          {/* 菜单色 */}
          <div class="actview-ui-switcher-label">菜单色</div>
          <div class="actview-ui-switcher-row">
            {MENU_COLORS.map((name) => (
              <button
                type="button"
                class={prefs.value.menuColor === name ? "active" : ""}
                onClick={() => setPref("menuColor", name)}
              >
                {name}
              </button>
            ))}
          </div>

          {/* 指针 */}
          <div class="actview-ui-switcher-label">指针</div>
          <div class="actview-ui-switcher-row">
            <button
              type="button"
              class={prefs.value.pointer ? "active" : ""}
              onClick={() => setPref("pointer", true)}
            >
              开
            </button>
            <button
              type="button"
              class={!prefs.value.pointer ? "active" : ""}
              onClick={() => setPref("pointer", false)}
            >
              关
            </button>
          </div>

          {/* 缩放 */}
          <div class="actview-ui-switcher-label">缩放</div>
          <div class="actview-ui-switcher-row">
            {SIZES.map((size) => (
              <button
                type="button"
                class={prefs.value.size === size ? "active" : ""}
                onClick={() => setPref("size", size)}
              >
                {size}%
              </button>
            ))}
          </div>

          {/* 方向 */}
          <div class="actview-ui-switcher-label">方向</div>
          <div class="actview-ui-switcher-row">
            <button
              type="button"
              class={!prefs.value.rtl ? "active" : ""}
              onClick={() => setPref("rtl", false)}
            >
              LTR
            </button>
            <button
              type="button"
              class={prefs.value.rtl ? "active" : ""}
              onClick={() => setPref("rtl", true)}
            >
              RTL
            </button>
          </div>

          {/* 明暗 */}
          <div class="actview-ui-switcher-label">模式</div>
          <div class="actview-ui-switcher-row">
            <button
              type="button"
              class={!prefs.value.dark ? "active" : ""}
              onClick={() => setPref("dark", false)}
            >
              ☀ 亮色
            </button>
            <button
              type="button"
              class={prefs.value.dark ? "active" : ""}
              onClick={() => setPref("dark", true)}
            >
              🌙 暗色
            </button>
          </div>
        </>
      )}
    </div>
  )
}
