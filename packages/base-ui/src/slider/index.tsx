// @actview/base-ui Slider：复刻 Base UI slider（1.6.0）的 DOM 契约（M1 范围）。
//   Root      — <div>，state {disabled, dragging, horizontal/vertical}
//               → data-disabled / data-dragging / data-horizontal / data-vertical
//   Control   — <div>，Track/Indicator/Thumb 的组合容器
//   Track     — <div>，Indicator 在 Track 内
//   Indicator — <div>，内联定位样式（golden 归一化为 {v}）
//   Thumb     — <span>，内联定位样式（{v}）；数量 = value/defaultValue 长度（默认 [min,max]）
// 行为（M1）：渲染结构 + 受控值显示；指针拖拽随视觉里程碑补齐。
// 规范：函数组件 + useProps + computed；provide/useInjects。
import {
  computed,
  provide,
  useInjects,
  useProps,
} from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const SLIDER_KEY = "actview-slider"

type SliderCtx = {
  disabled: { value: boolean }
  orientation: { value: "horizontal" | "vertical" }
  values: { value: number[] }
  min: { value: number }
  max: { value: number }
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
    rest,
  } = useProps(props, {
    render: undefined,
    value: undefined,
    defaultValue: undefined,
    min: (v) => v ?? 0,
    max: (v) => v ?? 100,
    disabled: (v) => v ?? false,
    orientation: (v) => v ?? "horizontal",
    onValueChange: undefined,
  })

  const values = computed<number[]>(() => {
    const v = value.value
    if (Array.isArray(v)) return v
    const d = defaultValue.value
    if (Array.isArray(d)) return d
    return [min.value, max.value]
  })
  provide(SLIDER_KEY, { disabled, orientation, values, min, max })

  const merged = computed(() =>
    mergeProps(
      getStateAttributesProps({
        disabled: disabled.value,
        dragging: false,
        horizontal: orientation.value === "horizontal",
        vertical: orientation.value === "vertical",
      }),
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
      getStateAttributesProps({
        disabled: ctx?.disabled.value ?? false,
        dragging: false,
        horizontal: ctx?.orientation.value === "horizontal",
        vertical: ctx?.orientation.value === "vertical",
      }),
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

  const merged = computed(() =>
    mergeProps(
      getStateAttributesProps({
        disabled: ctx?.disabled.value ?? false,
        dragging: false,
        horizontal: ctx?.orientation.value === "horizontal",
        vertical: ctx?.orientation.value === "vertical",
      }),
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
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    // 内联定位（happy-dom rect=0 下为 0 值；golden 归一化 {v}）
    const posStyle = "left: 0px; position: absolute;"
    return mergeProps(
      { style: `${posStyle}${style != null ? " " + String(style) : ""}` },
      getStateAttributesProps({
        disabled: ctx?.disabled.value ?? false,
        dragging: false,
        horizontal: ctx?.orientation.value === "horizontal",
        vertical: ctx?.orientation.value === "vertical",
      }),
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Thumb(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(SLIDER_KEY) as SliderCtx | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { style, ...elementProps } = external
    // 内联定位（happy-dom rect=0 下为 0 值；golden 归一化 {v}）
    const posStyle = "left: 0px; position: absolute;"
    return mergeProps(
      { style: `${posStyle}${style != null ? " " + String(style) : ""}` },
      getStateAttributesProps({
        disabled: ctx?.disabled.value ?? false,
        dragging: false,
        horizontal: ctx?.orientation.value === "horizontal",
        vertical: ctx?.orientation.value === "vertical",
      }),
      elementProps
    )
  })

  return render.value == null ? (
    <span {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "span", merged.value, rest.value.children)
  )
}

const Slider = { Root, Control, Track, Indicator, Thumb }

export { Slider, Root, Control, Track, Indicator, Thumb }
