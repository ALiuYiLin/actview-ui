// 主题切换器（纯 DOM 实现，fixed 右下角面板）：
//   - 视觉风格：8 套官方样式（v4 registry/styles，body.style-<name> 作用域）
//   - 色板：emerald / red / violet（buildThemeCssText 注入 --color-* 变量）
//   - 明暗：html.dark（默认主题的暗色支持）
//   - localStorage 持久化
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

const PALETTES = [
  { name: "emerald", label: "Emerald", swatch: "#10b981" },
  { name: "red", label: "Red", swatch: "#ef4444" },
  { name: "violet", label: "Violet", swatch: "#8b5cf6" },
] as const
type PaletteName = (typeof PALETTES)[number]["name"]

interface Prefs {
  style: StyleName
  palette: PaletteName
  dark: boolean
}

const STORAGE_KEY = "actview-ui-theme-prefs"

function loadPrefs(): Prefs {
  const fallback: Prefs = { style: "luma", palette: "emerald", dark: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        style: STYLE_NAMES.includes(parsed.style) ? parsed.style : "luma",
        palette: PALETTES.some((p) => p.name === parsed.palette)
          ? parsed.palette
          : "emerald",
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

function applyPalette(palette: PaletteName, dark: boolean): void {
  if (!paletteStyleEl) {
    paletteStyleEl = document.createElement("style")
    paletteStyleEl.setAttribute("data-actview-ui-palette", "1")
    document.head.appendChild(paletteStyleEl)
  }
  paletteStyleEl.textContent = buildThemeCssText(themes, {
    color: palette,
    theme: dark ? "dark" : "light",
  })
  document.documentElement.classList.toggle("dark", dark)
}

function applyStyle(name: StyleName): void {
  document.body.classList.remove(...STYLE_NAMES.map((s) => `style-${s}`))
  document.body.classList.add(`style-${name}`)
}

function applyAll(prefs: Prefs): void {
  applyStyle(prefs.style)
  applyPalette(prefs.palette, prefs.dark)
}

function setActive(container: HTMLElement, value: string): void {
  for (const btn of Array.from(
    container.querySelectorAll<HTMLElement>("[data-value]")
  )) {
    btn.classList.toggle("active", btn.dataset.value === value)
  }
}

function buildPanel(prefs: Prefs): HTMLElement {
  const panel = document.createElement("div")
  panel.className = "actview-ui-switcher"

  // 标题 + 收起
  const title = document.createElement("div")
  title.className = "actview-ui-switcher-title"
  title.innerHTML = "<span>主题定制</span>"
  const closeBtn = document.createElement("button")
  closeBtn.textContent = "✕"
  closeBtn.addEventListener("click", () => {
    panel.remove()
  })
  title.appendChild(closeBtn)
  panel.appendChild(title)

  // 风格
  const styleLabel = document.createElement("div")
  styleLabel.className = "actview-ui-switcher-label"
  styleLabel.textContent = "风格"
  panel.appendChild(styleLabel)
  const styleRow = document.createElement("div")
  styleRow.className = "actview-ui-switcher-row"
  for (const name of STYLE_NAMES) {
    const btn = document.createElement("button")
    btn.dataset.value = name
    btn.textContent = name.charAt(0).toUpperCase() + name.slice(1)
    btn.addEventListener("click", () => {
      prefs.style = name
      applyStyle(name)
      savePrefs(prefs)
      setActive(styleRow, name)
    })
    styleRow.appendChild(btn)
  }
  panel.appendChild(styleRow)

  // 色板
  const paletteLabel = document.createElement("div")
  paletteLabel.className = "actview-ui-switcher-label"
  paletteLabel.textContent = "色板"
  panel.appendChild(paletteLabel)
  const paletteRow = document.createElement("div")
  paletteRow.className = "actview-ui-switcher-row"
  for (const palette of PALETTES) {
    const btn = document.createElement("button")
    btn.className = "actview-ui-switcher-swatch"
    btn.dataset.value = palette.name
    btn.title = palette.label
    btn.style.background = palette.swatch
    btn.addEventListener("click", () => {
      prefs.palette = palette.name
      applyPalette(palette.name, prefs.dark)
      savePrefs(prefs)
      setActive(paletteRow, palette.name)
    })
    paletteRow.appendChild(btn)
  }
  panel.appendChild(paletteRow)

  // 明暗
  const themeLabel = document.createElement("div")
  themeLabel.className = "actview-ui-switcher-label"
  themeLabel.textContent = "模式"
  panel.appendChild(themeLabel)
  const themeRow = document.createElement("div")
  themeRow.className = "actview-ui-switcher-row"
  const lightBtn = document.createElement("button")
  lightBtn.dataset.value = "light"
  lightBtn.textContent = "☀ 亮色"
  lightBtn.addEventListener("click", () => {
    prefs.dark = false
    applyPalette(prefs.palette, false)
    savePrefs(prefs)
    setActive(themeRow, "light")
  })
  themeRow.appendChild(lightBtn)
  const darkBtn = document.createElement("button")
  darkBtn.dataset.value = "dark"
  darkBtn.textContent = "🌙 暗色"
  darkBtn.addEventListener("click", () => {
    prefs.dark = true
    applyPalette(prefs.palette, true)
    savePrefs(prefs)
    setActive(themeRow, "dark")
  })
  themeRow.appendChild(darkBtn)
  panel.appendChild(themeRow)

  // 初始高亮
  setActive(styleRow, prefs.style)
  setActive(paletteRow, prefs.palette)
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
