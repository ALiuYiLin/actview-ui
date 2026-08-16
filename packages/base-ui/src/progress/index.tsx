// @actview/base-ui Progress：复刻 Base UI progress（1.6.0）的 DOM 契约（M1 范围）。
//   Root      — <div>，state {status} → data-progressing / data-complete /
//               data-indeterminate（status：value==null→indeterminate，
//               value>=max→complete，否则 progressing）
//   Track     — <div role="presentation">
//   Indicator — <div>，内联 width 样式（golden 归一化为 {v}）
//   Label/Value — <div>
// 规范：函数组件 + useProps + computed；provide/useInjects。
import {
  computed,
  provide,
  useInjects,
  useProps,
} from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const PROGRESS_KEY = "actview-progress"

function statusOf(value: number | null | undefined, max: number): string {
  if (value == null) return "indeterminate"
  if (value >= max) return "complete"
  return "progressing"
}

function statusProps(status: string) {
  if (status === "progressing") return { "data-progressing": "" }
  if (status === "complete") return { "data-complete": "" }
  if (status === "indeterminate") return { "data-indeterminate": "" }
  return {}
}

function Root(
  props: HTMLAttributes & {
    render?: any
    value?: number | null
    min?: number
    max?: number
  }
) {
  const { render, value, min, max, rest } = useProps(props, {
    render: undefined,
    value: undefined,
    min: (v) => v ?? 0,
    max: (v) => v ?? 100,
  })

  const status = computed(() => statusOf(value.value, max.value))
  provide(PROGRESS_KEY, { value, min, max })

  const merged = computed(() =>
    mergeProps(
      statusProps(status.value),
      rest.value as Record<string, any>
    )
  )

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Track(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const merged = computed(() =>
    mergeProps({ role: "presentation" }, rest.value as Record<string, any>)
  )
  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Indicator(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(PROGRESS_KEY) as
    | { value: { value: number | null }; min: { value: number }; max: { value: number } }
    | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    let indicatorStyle: string | undefined
    if (ctx && ctx.value.value != null) {
      const pct =
        ((ctx.value.value - ctx.min.value) / (ctx.max.value - ctx.min.value)) *
        100
      indicatorStyle = `width: ${pct}%;`
    }
    return mergeProps(
      indicatorStyle != null
        ? { style: `${indicatorStyle}${style != null ? " " + String(style) : ""}` }
        : style != null
          ? { style }
          : null,
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Label(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const merged = computed(() => mergeProps(rest.value as Record<string, any>))
  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Value(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const merged = computed(() => mergeProps(rest.value as Record<string, any>))
  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

const Progress = { Root, Track, Indicator, Label, Value }

export { Progress, Root, Track, Indicator, Label, Value }
