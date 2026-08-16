// @actview/base-ui Checkbox：复刻 Base UI checkbox（1.6.0）的 DOM 契约（M1 范围）。
//   Root      — <button type="button" tabindex="0">，state {checked, disabled}
//               → data-checked / data-disabled（默认映射），disabled 时 disabled 属性
//   Indicator — <span>，仅在 checked 时挂载（keepMounted=false），state 同 Root
// 行为：click 切换（受控/非受控），disabled 拦截。
// 规范：函数组件 + useProps + computed；provide/useInjects 供 Indicator 读状态。
import {
  computed,
  provide,
  ref,
  useInjects,
  useProps,
  watchEffect,
} from "@actview/core"
import type { ButtonHTMLAttributes, HTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const CHECKBOX_KEY = "actview-checkbox"

function Root(
  props: ButtonHTMLAttributes & {
    render?: any
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
) {
  const { render, checked, defaultChecked, disabled, onCheckedChange, rest } =
    useProps(props, {
      render: undefined,
      checked: undefined,
      defaultChecked: (v) => v ?? false,
      disabled: (v) => v ?? false,
      onCheckedChange: undefined,
    })

  const state = ref(checked.value ?? defaultChecked.value)
  watchEffect(() => {
    if (checked.value !== undefined && state.value !== checked.value) {
      state.value = checked.value
    }
  })
  const setChecked = (v: boolean) => {
    state.value = v
    onCheckedChange.value?.(v)
  }
  provide(CHECKBOX_KEY, { checked: state, disabled })

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { onClick: userOnClick, ...otherExternal } = external
    const isChecked = state.value
    const isDisabled = disabled.value

    return mergeProps(
      { type: "button", tabindex: 0 },
      isDisabled ? { disabled: true } : null,
      getStateAttributesProps({ checked: isChecked, disabled: isDisabled }),
      {
        onClick(event: any) {
          if (isDisabled) {
            event.preventDefault()
            return
          }
          setChecked(!isChecked)
          userOnClick?.(event)
        },
      },
      otherExternal
    )
  })

  return render.value == null ? (
    <button {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "button", merged.value, rest.value.children)
  )
}

function Indicator(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(CHECKBOX_KEY) as
    | { checked: { value: boolean }; disabled: { value: boolean } }
    | undefined

  const merged = computed(() =>
    mergeProps(
      getStateAttributesProps({
        checked: ctx?.checked.value ?? false,
        disabled: ctx?.disabled.value ?? false,
      }),
      rest.value as Record<string, any>
    )
  )

  // 未选中不挂载（Base UI 默认 keepMounted=false；选中态 golden 验证）
  return ctx?.checked.value ? (
    render.value == null ? (
      <span {...merged.value} />
    ) : (
      mergeRenderProps(render.value, "span", merged.value, rest.value.children)
    )
  ) : null
}

const Checkbox = { Root, Indicator }

export { Checkbox, Indicator, Root }
