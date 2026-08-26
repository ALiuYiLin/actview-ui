// 受控色块行：value + items + onChange（单选高亮），纯受控无内部状态。
// 用于：色板 24（圆形）、基色 7（方形）、图表色 24（圆形）
export function SwatchRow(props: {
  value: string
  items: { name: string; label: string; swatch: string }[]
  onChange: (name: string) => void
  square?: boolean
  titlePrefix?: string
}) {
  return props.items.map((item) => (
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
  ))
}
