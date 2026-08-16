// 复刻 Base UI internals/getStateAttributesProps：
// state 真值 → `data-<key 小写>`（true 渲染为空串属性，其余 toString）。
export function getStateAttributesProps(
  state: Record<string, any>
): Record<string, any> {
  const props: Record<string, any> = {}
  for (const key of Object.keys(state)) {
    const value = state[key]
    if (value === true) {
      props[`data-${key.toLowerCase()}`] = ""
    } else if (value) {
      props[`data-${key.toLowerCase()}`] = String(value)
    }
  }
  return props
}
