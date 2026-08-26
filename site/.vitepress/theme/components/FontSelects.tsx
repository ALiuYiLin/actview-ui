// 受控字体选择：正文 26 种 + 标题字体（inherit + 26），纯受控无内部状态。
// 选中值通过 option selected 声明（初始渲染），onChange 上抛（受控单向流）。
// 注意：actview JSX 类型不支持 <> Fragment，多个兄弟节点以数组返回。
import { ALL_FONTS, type Prefs } from "./useThemePrefs"

export function FontSelects(props: {
  font: string
  fontHeading: string
  onChange: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
}) {
  return [
    <div class="actview-ui-switcher-label">字体</div>,
    <select
      class="actview-ui-switcher-select"
      onChange={(e) =>
        props.onChange("font", (e.target as unknown as HTMLSelectElement).value)
      }
    >
      {ALL_FONTS.map((f) => (
        <option value={f.name} selected={props.font === f.name}>
          {f.title}
        </option>
      ))}
    </select>,
    <div class="actview-ui-switcher-label">标题字体</div>,
    <select
      class="actview-ui-switcher-select"
      onChange={(e) =>
        props.onChange(
          "fontHeading",
          (e.target as unknown as HTMLSelectElement).value
        )
      }
    >
      <option value="inherit" selected={props.fontHeading === "inherit"}>
        跟随正文
      </option>
      {ALL_FONTS.map((f) => (
        <option value={f.name} selected={props.fontHeading === f.name}>
          {f.title}
        </option>
      ))}
    </select>,
  ]
}
