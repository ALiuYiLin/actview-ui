// @actview/base-ui DirectionProvider：复刻 Base UI direction-provider（1.6.0）。
// 不渲染 DOM：provide 方向上下文（ltr/rtl），供浮层原语读取 dir。
// 规范：函数组件 + useProps；children 经 jsx(Fragment) 输出（ElementType 不含 symbol）。
import { provide, useProps } from "@actview/core"
import { Fragment, jsx } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"

export const DIRECTION_KEY = "actview-direction"

function DirectionProvider(
  props: HTMLAttributes & { direction?: "ltr" | "rtl" | string }
) {
  const { direction, rest } = useProps(props, {
    direction: (v) => v ?? "ltr",
  })
  provide(DIRECTION_KEY, { direction: direction.value })
  return jsx(Fragment, { children: rest.value.children })
}

export { DirectionProvider }
