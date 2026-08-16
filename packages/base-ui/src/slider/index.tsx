// @actview/base-ui Slider：复刻 Base UI slider（1.6.0）的 DOM 契约。
// React golden 实测结构（test/fixtures/golden/l1a.slider.*.html）：
//   Root      — <div role="group" data-orientation id>
//   Control   — <div data-base-ui-slider-control data-orientation>
//   Track     — <div data-orientation style="position: relative;">
//   Indicator — <div data-base-ui-slider-indicator data-orientation
//                style="--relative-size: 0%; --start-position: 0%; height: 1px;
//                inset-inline-start: var(--start-position); position: relative;
//                visibility: hidden; width: 1px;">
//   Thumb     — <div data-index data-orientation id
//                style="--position: 0%; inset-inline-start: var(--position);
//                position: absolute; top: 1px; visibility: hidden;">
//                + 视觉隐藏原生 <input type="range" min max step value
//                aria-orientation aria-valuenow aria-valuetext>
// 行为（M1）：结构 + 受控值；指针拖拽随视觉里程碑补齐。
// 规范：函数组件 + useProps + computed；provide/useInjects。
import {
  computed,
  provide,
  useInjects,
  useProps,
} from "@actview/core"
import { jsx } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"

import { SR_ONLY_STYLE } from "../internals/sr-style"
import { useBaseUiId } from "../internals/use-base-ui-id"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const SLIDER_KEY = "actview-slider"

type SliderCtx = {
  disabled: { value: boolean }
  orientation: { value: "horizontal" | "vertical" }
  values: { value: number[] }
  min: { value: number }
  max: { value: number }
  // Thumb 挂载顺序领号（Base UI composite index；golden：data-index 按序）
  thumbSeq: { n: number }
}

function Root(
  props: HTMLAttributes & {
    render?: any
    value?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    disabled?: boolean
    orientation?: "horizontal" | "vertical"
    thumbAlignment?: string
    onValueChange?: (value: number[]) => void
  }
) {
  const {
    render,
    value,
    defaultValue,
    min,
    max,
    disabled,
    orientation,
    thumbAlignment,
    rest,
  } = useProps(props, {
    render: undefined,
    value: undefined,
    defaultValue: undefined,
    min: (v) => v ?? 0,
    max: (v) => v ?? 100,
    disabled: (v) => v ?? false,
    orientation: (v) => v ?? "horizontal",
    thumbAlignment: undefined,
    onValueChange: undefined,
  })

  const values = computed<number[]>(() => {
    const v = value.value
    if (Array.isArray(v)) return v
    const d = defaultValue.value
    if (Array.isArray(d)) return d
    return [min.value, max.value]
  })
  provide(SLIDER_KEY, {
    disabled,
    orientation,
    values,
    min,
    max,
    thumbSeq: { n: 0 },
  })
  const rootId = useBaseUiId()

  const merged = computed(() =>
    mergeProps(
      {
        role: "group",
        id: rootId,
        "data-orientation": orientation.value,
      },
      rest.value as Record<string, any>
    )
  )

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Control(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined

  const merged = computed(() =>
    mergeProps(
      {
        "data-base-ui-slider-control": "",
        "data-orientation": ctx?.orientation.value ?? "horizontal",
      },
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
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    return mergeProps(
      {
        "data-orientation": ctx?.orientation.value ?? "horizontal",
        style:
          style != null
            ? `position: relative; ${String(style)}`
            : "position: relative;",
      },
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Indicator(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    const positionStyle =
      "--relative-size: 0%; --start-position: 0%; height: 1px; inset-inline-start: var(--start-position); position: relative; visibility: hidden; width: 1px;"
    return mergeProps(
      {
        "data-base-ui-slider-indicator": "",
        "data-orientation": ctx?.orientation.value ?? "horizontal",
        style:
          style != null ? `${positionStyle} ${String(style)}` : positionStyle,
      },
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Thumb(
  props: HTMLAttributes & { render?: any; index?: number }
) {
  const { render, index, rest } = useProps(props, {
    render: undefined,
    index: (v) => v ?? 0,
  })
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined
  // Thumb 挂载顺序领号（setup 仅首挂执行一次，顺序稳定）
  const thumbIndex = ctx?.thumbSeq ? ctx.thumbSeq.n++ : index.value
  const thumbId = useBaseUiId()
  const inputId = useBaseUiId()

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    const positionStyle =
      "--position: 0%; inset-inline-start: var(--position); position: absolute; top: 1px; visibility: hidden;"
    return mergeProps(
      {
        "data-index": String(thumbIndex),
        "data-orientation": ctx?.orientation.value ?? "horizontal",
        id: thumbId,
        style:
          style != null ? `${positionStyle} ${String(style)}` : positionStyle,
      },
      elementProps
    )
  })

  const value = computed(() => ctx?.values.value[thumbIndex])

  const inputProps = computed(() => {
    const count = ctx?.values.value.length ?? 1
    const i = thumbIndex
    const v = ctx?.values.value[i] ?? 0
    let vt = String(v)
    if (count > 1) {
      vt =
        i === 0 ? `${v} start range` : i === count - 1 ? `${v} end range` : `${v} middle range`
    }
    return {
      "aria-orientation": ctx?.orientation.value ?? "horizontal",
      "aria-valuenow": String(v),
      "aria-valuetext": vt,
      id: inputId,
      max: String(ctx?.max.value ?? 100),
      min: String(ctx?.min.value ?? 0),
      step: "1",
      style: SR_ONLY_STYLE,
      type: "range",
      // value 以 attribute 呈现（actview 的 value 走 property 不反射），
      // 挂载后由 ref 命令式写入
      ref: (el: HTMLInputElement | null) => {
        if (el) el.setAttribute("value", String(v))
      },
    }
  })

  return render.value == null ? (
    <div {...merged.value}>{jsx("input", inputProps.value as any)}</div>
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

const Slider = { Root, Control, Track, Indicator, Thumb }

export { Slider, Root, Control, Track, Indicator, Thumb }
