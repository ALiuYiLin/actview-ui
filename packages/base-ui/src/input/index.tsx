// @actview/base-ui Input：复刻 Base UI input（1.6.0）。
// DOM：<input> 透传（Field 关联的 id 接线随 actview field 组件补充）。
// 规范：函数组件 + useProps + computed；最终 return JSX。
import { computed, useProps } from "@actview/core"
import type { InputHTMLAttributes } from "@actview/jsx"

import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

function Input(
  props: InputHTMLAttributes & {
    render?: any
    id?: string
    name?: string
    type?: string
  }
) {
  const { render, rest } = useProps(props, { render: undefined })

  const merged = computed(() => mergeProps(rest.value as Record<string, any>))

  return render.value == null ? (
    <input {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "input", merged.value, rest.value.children)
  )
}

export { Input }
