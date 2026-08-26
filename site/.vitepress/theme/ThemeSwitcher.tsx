// 主题切换器（容器组件）：作为主题 floatingChildrens 常驻挂载。
// 全部子组件为受控组件（props 下传 + onChange 上抛），本容器只负责：
//   - useThemePrefs 状态（唯一数据源）
//   - Teleport 到 <body>（面板 + 声明式样式注入：themeCss/pointerCss/字体 link）
//   - 面板骨架组装（标题/摘要/重置/收起 + 各受控分组）
// 组件内零直接 DOM 操作（body class 等副作用集中在 useThemePrefs 的 watch）。
import { Teleport, ref } from "actview"
import {
  ALL_PALETTES,
  BASE_COLOR_ITEMS,
  COLOR_PALETTES,
  MENU_ACCENTS,
  MENU_COLORS,
  NEUTRAL_PALETTES,
  RADII,
  SIZES,
  STYLE_NAMES,
  useThemePrefs,
  type ThemePrefsStore,
} from "./components/useThemePrefs"
import { OptionGroup } from "./components/OptionGroup"
import { SegmentedButtons } from "./components/SegmentedButtons"
import { SwatchRow } from "./components/SwatchRow"
import { FontSelects } from "./components/FontSelects"

export function ThemeSwitcher() {
  const store = useThemePrefs() as ThemePrefsStore
  const open = ref(true)

  const options = (names: readonly string[]): { value: string; label: string }[] =>
    names.map((n) => ({
      value: n,
      label: n.charAt(0).toUpperCase() + n.slice(1),
    }))

  return (
    <Teleport to="body">
      {/* 声明式样式注入（受控：prefs 派生 → style/link 内容） */}
      <style>{store.themeCss.value}</style>
      {store.pointerCss.value && <style>{store.pointerCss.value}</style>}
      {store.fontLink.value && (
        <link rel="stylesheet" href={store.fontLink.value} />
      )}
      {store.fontHeadingLink.value &&
        store.fontHeadingLink.value !== store.fontLink.value && (
          <link rel="stylesheet" href={store.fontHeadingLink.value} />
        )}

      {/* 面板 */}
      <div class="actview-ui-switcher">
        <div class="actview-ui-switcher-title">
          <span>主题定制</span>
          <span class="actview-ui-switcher-summary">{store.summary.value}</span>
          <button type="button" onClick={() => store.reset()}>
            重置
          </button>
          <button type="button" onClick={() => (open.value = false)}>
            ✕
          </button>
        </div>

        {open.value && (
          <div class="actview-ui-switcher-body">
            {/* 风格（8） */}
            <OptionGroup label="风格">
              <SegmentedButtons
                value={store.prefs.value.style}
                options={options(STYLE_NAMES)}
                onChange={(v) => store.setPref("style", v)}
              />
            </OptionGroup>

            {/* 色板（24：中性 7 + 彩色 17） */}
            <OptionGroup label="色板">
              <SwatchRow
                value={store.prefs.value.palette}
                items={NEUTRAL_PALETTES}
                onChange={(v) => store.setPref("palette", v)}
              />
              <SwatchRow
                value={store.prefs.value.palette}
                items={COLOR_PALETTES}
                onChange={(v) => store.setPref("palette", v)}
              />
            </OptionGroup>

            {/* 基色（7 中性，方形与色板圆点区分） */}
            <OptionGroup label="基色">
              <SwatchRow
                value={store.prefs.value.baseColor}
                items={BASE_COLOR_ITEMS}
                onChange={(v) => store.setPref("baseColor", v)}
                square
                titlePrefix="基色 "
              />
            </OptionGroup>

            {/* 图表色（跟随 + 24） */}
            <OptionGroup label="图表色">
              <SegmentedButtons
                value={store.prefs.value.chartColor}
                options={[{ value: "follow", label: "跟随" }]}
                onChange={(v) => store.setPref("chartColor", v)}
              />
              <SwatchRow
                value={store.prefs.value.chartColor}
                items={ALL_PALETTES}
                onChange={(v) => store.setPref("chartColor", v)}
                titlePrefix="图表 "
              />
            </OptionGroup>

            {/* 圆角（5 档） */}
            <OptionGroup label="圆角">
              <SegmentedButtons
                value={store.prefs.value.radius}
                options={options(RADII)}
                onChange={(v) => store.setPref("radius", v)}
              />
            </OptionGroup>

            {/* 字体（26）+ 标题字体（受控 select） */}
            <FontSelects
              font={store.prefs.value.font}
              fontHeading={store.prefs.value.fontHeading}
              onChange={(key, value) => store.setPref(key, value)}
            />

            {/* 菜单强调 + 菜单色 */}
            <OptionGroup label="菜单强调">
              <SegmentedButtons
                value={store.prefs.value.menuAccent}
                options={options(MENU_ACCENTS)}
                onChange={(v) => store.setPref("menuAccent", v)}
              />
            </OptionGroup>
            <OptionGroup label="菜单色">
              <SegmentedButtons
                value={store.prefs.value.menuColor}
                options={MENU_COLORS.map((n) => ({ value: n, label: n }))}
                onChange={(v) => store.setPref("menuColor", v)}
              />
            </OptionGroup>

            {/* 指针 / 缩放 / 方向 / 明暗 */}
            <OptionGroup label="指针">
              <SegmentedButtons
                value={store.prefs.value.pointer ? "on" : "off"}
                options={[
                  { value: "on", label: "开" },
                  { value: "off", label: "关" },
                ]}
                onChange={(v) => store.setPref("pointer", v === "on")}
              />
            </OptionGroup>
            <OptionGroup label="缩放">
              <SegmentedButtons
                value={String(store.prefs.value.size)}
                options={SIZES.map((s) => ({ value: String(s), label: `${s}%` }))}
                onChange={(v) => store.setPref("size", Number(v))}
              />
            </OptionGroup>
            <OptionGroup label="方向">
              <SegmentedButtons
                value={store.prefs.value.rtl ? "rtl" : "ltr"}
                options={[
                  { value: "ltr", label: "LTR" },
                  { value: "rtl", label: "RTL" },
                ]}
                onChange={(v) => store.setPref("rtl", v === "rtl")}
              />
            </OptionGroup>
            <OptionGroup label="模式">
              <SegmentedButtons
                value={store.prefs.value.dark ? "dark" : "light"}
                options={[
                  { value: "light", label: "☀ 亮色" },
                  { value: "dark", label: "🌙 暗色" },
                ]}
                onChange={(v) => store.setPref("dark", v === "dark")}
              />
            </OptionGroup>
          </div>
        )}
      </div>
    </Teleport>
  )
}
