// @actview/base-ui Radio / RadioGroup：复刻 Base UI radio + radio-group（1.6.0）。
//   RadioGroup — <div>，provide 组上下文（name/value/disabled/onValueChange）
//   Radio.Root — <button type="button" role="radio" aria-checked tabindex="0">，
//                state {checked, disabled} → data-checked / data-disabled
//   Radio.Indicator — <span>，仅在选中时挂载，state 同 Root
// 规范：函数组件 + useProps + computed；provide/useInjects。
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
import { sameValue } from "../internals/compare"

export const RADIO_GROUP_KEY = "actview-radio-group"
const RADIO_KEY = "actview-radio"

type RadioGroupCtx = {
  name: { value: string | undefined }
  value: { value: any }
  disabled: { value: boolean }
  setValue: (v: any) => void
}

function RadioGroup(
  props: HTMLAttributes & {
    render?: any
    name?: string
    value?: any
    defaultValue?: any
    disabled?: boolean
    onValueChange?: (value: any) => void
  }
) {
  const {
    render,
    name,
    value,
    defaultValue,
    disabled,
    onValueChange,
    rest,
  } = useProps(props, {
    render: undefined,
    name: undefined,
    value: undefined,
    defaultValue: undefined,
    disabled: (v) => v ?? false,
    onValueChange: undefined,
  })

  const groupValue = ref<any>(value.value ?? defaultValue.value)
  watchEffect(() => {
    // useProps 派生值引用不稳定：按值比较（对象 value 时身份比较会死循环）
    const next = value.value
    if (next !== undefined && !sameValue(groupValue.value, next)) {
      groupValue.value = next
    }
  })
  const setValue = (v: any) => {
    groupValue.value = v
    onValueChange.value?.(v)
  }
  provide(RADIO_GROUP_KEY, { name, value: groupValue, disabled, setValue })

  const merged = computed(() =>
    mergeProps(rest.value as Record<string, any>)
  )

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Root(
  props: ButtonHTMLAttributes & {
    render?: any
    value?: any
    disabled?: boolean
    id?: string
  }
) {
  const { render, value, disabled, rest } = useProps(props, {
    render: undefined,
    value: undefined,
    disabled: undefined,
    id: undefined,
  })
  const group = useInjects(RADIO_GROUP_KEY) as RadioGroupCtx | undefined

  const isDisabled = computed(() => disabled.value ?? group?.disabled.value ?? false)
  const isChecked = computed(() =>
    group ? group.value.value === value.value : false
  )
  provide(RADIO_KEY, { checked: isChecked, disabled: isDisabled })

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { onClick: userOnClick, ...otherExternal } = external
    const checked = isChecked.value

    return mergeProps(
      {
        type: "button",
        role: "radio",
        tabindex: 0,
        // React 对 aria-* false 渲染 "false" 属性；actview 会删 false 属性，String 化对齐
        "aria-checked": String(checked),
        name: group?.name.value,
      },
      isDisabled.value ? { disabled: true } : null,
      getStateAttributesProps({
        checked,
        disabled: isDisabled.value,
      }),
      {
        onClick(event: any) {
          if (isDisabled.value) {
            event.preventDefault()
            return
          }
          group?.setValue(value.value)
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
  const ctx = useInjects(RADIO_KEY) as
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

  // 未选中不挂载（同 Checkbox Indicator）
  return ctx?.checked.value ? (
    render.value == null ? (
      <span {...merged.value} />
    ) : (
      mergeRenderProps(render.value, "span", merged.value, rest.value.children)
    )
  ) : null
}

const Radio = { Root, Indicator }

export {
  Radio,
  RadioGroup,
  Root,
  Indicator,
}
