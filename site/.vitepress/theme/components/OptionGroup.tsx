// 受控分组（label + 单选行），纯受控无内部状态。
// 支持两种渲染模式（同一行内可混用）：
//   - options：文本按钮（风格/圆角/菜单/指针/缩放/方向/明暗/跟随）
//   - items：色块按钮（色板/基色/图表色，square 方形变体）
// 注意：actview 客户端渲染不支持组件返回数组（SSR 正常、mount 为空），
// 必须返回单个根节点 —— 按钮行渲染并入本组件。
export function OptionGroup(props: {
  label: string
  value: string
  options?: { value: string; label: string }[]
  items?: { name: string; label: string; swatch: string }[]
  square?: boolean
  titlePrefix?: string
  onChange: (value: string) => void
}) {
  return (
    <div class="actview-ui-switcher-group">
      <div class="actview-ui-switcher-label">{props.label}</div>
      <div class="actview-ui-switcher-row">
        {(props.options ?? []).map((opt) => (
          <button
            type="button"
            class={props.value === opt.value ? "active" : ""}
            onClick={() => props.onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        {(props.items ?? []).map((item) => (
          <button
            type="button"
            class={
              props.value === item.name
                ? props.square
                  ? "actview-ui-switcher-swatch actview-ui-switcher-swatch-square active"
                  : "actview-ui-switcher-swatch active"
                : props.square
                  ? "actview-ui-switcher-swatch actview-ui-switcher-swatch-square"
                  : "actview-ui-switcher-swatch"
            }
            style={{ background: item.swatch }}
            title={`${props.titlePrefix ?? ""}${item.label}`}
            onClick={() => props.onChange(item.name)}
          />
        ))}
      </div>
    </div>
  )
}
