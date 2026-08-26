// 受控按钮组：value + options + onChange（单选高亮），纯受控无内部状态。
// 用于：风格 8 / 圆角 5 / 菜单强调 / 菜单色 / 指针 / 缩放 / 方向 / 明暗 / 跟随
// 注意：actview JSX 类型不支持 <> Fragment，多个兄弟节点以数组返回。
export function SegmentedButtons(props: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return props.options.map((opt) => (
    <button
      type="button"
      class={props.value === opt.value ? "active" : ""}
      onClick={() => props.onChange(opt.value)}
    >
      {opt.label}
    </button>
  ))
}
