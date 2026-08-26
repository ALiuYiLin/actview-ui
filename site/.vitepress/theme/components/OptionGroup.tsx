// 分组容器（受控组件的布局壳）：label + 内容行
export function OptionGroup(props: { label: string; children?: any }) {
  return (
    <div class="actview-ui-switcher-group">
      <div class="actview-ui-switcher-label">{props.label}</div>
      <div class="actview-ui-switcher-row">{props.children}</div>
    </div>
  )
}
