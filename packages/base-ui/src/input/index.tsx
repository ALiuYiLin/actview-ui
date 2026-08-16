// @actview/base-ui Input：复刻 Base UI input（1.6.0）。
// DOM：<input> 透传 + 自动 labelable id（Field.Control 语义，golden 验证）。
// 规范：函数组件 + useProps + computed；最终 return JSX。
import { computed, useProps } from "@actview/core"
import type { InputHTMLAttributes } from "@actview/jsx"

import { useBaseUiId } from "../internals/use-base-ui-id"
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
  const { render, id, rest } = useProps(props, { render: undefined, id: undefined })
  const autoId = useBaseUiId()

  const merged = computed(() =>
    mergeProps({ id: id.value ?? autoId }, rest.value as Record<string, any>)
  )

  return render.value == null ? (
    <input {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "input", merged.value, rest.value.children)
  )
}

export { Input }
