// @actview/base-ui Separator：复刻 Base UI separator（1.6.0）的 DOM 契约。
// DOM：<div role="separator" aria-orientation="{orientation}" data-orientation="{orientation}">
//   orientation 默认 "horizontal"；render prop 同 Button。
// 规范：函数组件 + useProps；props 合成用 computed（惰性追踪，解决 setup 快照问题）。
import { computed, useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

function Separator(
  props: HTMLAttributes & {
    orientation?: "horizontal" | "vertical" | string
    render?: any
  }
) {
  const { orientation, render, rest } = useProps(props, {
    orientation: (v) => v ?? "horizontal",
    render: undefined,
  })

  const merged = computed(() =>
    mergeProps(
      { role: "separator", "aria-orientation": orientation.value },
      getStateAttributesProps({ orientation: orientation.value }),
      rest.value as Record<string, any>
    )
  )

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

export { Separator }
