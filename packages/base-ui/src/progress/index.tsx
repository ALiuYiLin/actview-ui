// @actview/base-ui Progress：复刻 Base UI progress（1.6.0）的 DOM 契约。
// React golden 实测结构（test/fixtures/golden/l1a.progress.*.html）：
//   Root      — <div role="progressbar" aria-valuemax/min +（有值）aria-valuenow/
//               aria-valuetext（"{v}%"；无值 "indeterminate progress"）
//               data-progressing/data-complete/data-indeterminate> + children
//               + <span role="presentation" style=SR>x</span>（sr 播报）
//   Track     — <div data-<status>>
//   Indicator — <div data-<status> style="height: 1px; inset-inline-start: 0;
//               width: {pct}%;">（无值时无 style）
// 规范：函数组件 + useProps + computed；provide/useInjects。
import { computed, provide, useInjects, useProps } from "@actview/core"
import { jsx } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"

import { SR_ONLY_STYLE } from "../internals/sr-style"
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

  const merged = computed(() => {
    const hasValue = value.value != null
    return mergeProps(
      {
        role: "progressbar",
        "aria-valuemax": String(max.value),
        "aria-valuemin": String(min.value),
        ...(hasValue
          ? {
              "aria-valuenow": String(value.value),
              "aria-valuetext": `${value.value}%`,
            }
          : { "aria-valuetext": "indeterminate progress" }),
      },
      statusProps(status.value),
      rest.value as Record<string, any>
    )
  })

  const srSpan = jsx("span", {
    role: "presentation",
    style: SR_ONLY_STYLE,
    children: "x",
  })

  return render.value == null ? (
    <div {...merged.value}>
      {rest.value.children}
      {srSpan}
    </div>
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Track(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(PROGRESS_KEY) as
    | { value: { value: number | null }; max: { value: number } }
    | undefined

  const merged = computed(() =>
    mergeProps(
      statusProps(statusOf(ctx?.value.value, ctx?.max.value ?? 100)),
      rest.value as Record<string, any>
    )
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
    | {
        value: { value: number | null }
        min: { value: number }
        max: { value: number }
      }
    | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    let indicatorStyle: string | null = null
    if (ctx && ctx.value.value != null) {
      const pct =
        ((ctx.value.value - ctx.min.value) / (ctx.max.value - ctx.min.value)) *
        100
      indicatorStyle = `height: 1px; inset-inline-start: 0; width: ${pct}%;`
    }
    return mergeProps(
      statusProps(statusOf(ctx?.value.value, ctx?.max.value ?? 100)),
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
