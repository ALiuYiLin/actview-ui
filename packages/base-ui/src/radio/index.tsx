// @actview/base-ui Radio / RadioGroup：复刻 Base UI radio + radio-group（1.6.0）。
// React golden 实测结构（test/fixtures/golden/l1a.radio-group.*.html）：
//   RadioGroup  — <div role="radiogroup">
//   Radio.Root  — <span role="radio" aria-checked tabindex（选中 0/未选 -1）
//                 id data-checked/data-unchecked data-composite-item-active(选中)>
//                 + 视觉隐藏原生 <input type="radio" value aria-hidden
//                 tabindex="-1" id>（选中时带 checked）
//   Radio.Indicator — <span data-checked>，仅在选中时挂载
// 行为：click 归属组 value（受控/非受控），disabled 拦截。
// 规范：函数组件 + useProps + computed；provide/useInjects；受控同步按值比较。
import {
  computed,
  provide,
  ref,
  useInjects,
  useProps,
  watchEffect,
} from "@actview/core"
import { Fragment, jsx } from "@actview/jsx"
import type { ButtonHTMLAttributes, HTMLAttributes } from "@actview/jsx"

import { sameValue } from "../internals/compare"
import { getStateAttributesProps } from "../internals/state-attributes"
import { SR_ONLY_STYLE } from "../internals/sr-style"
import { useBaseUiId } from "../internals/use-base-ui-id"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

export const RADIO_GROUP_KEY = "actview-radio-group"
const RADIO_KEY = "actview-radio"

type RadioGroupCtx = {
  name: { value: string | undefined }
  value: { value: any }
  disabled: { value: boolean }
  setValue: (v: any) => void
}

function checkedStateProps(checked: boolean) {
  return checked ? { "data-checked": "" } : { "data-unchecked": "" }
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
    mergeProps(
      { role: "radiogroup" },
      rest.value as Record<string, any>
    )
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
  const { render, value, disabled, id, rest } = useProps(props, {
    render: undefined,
    value: undefined,
    disabled: undefined,
    id: undefined,
  })
  const group = useInjects(RADIO_GROUP_KEY) as RadioGroupCtx | undefined
  const rootId = useBaseUiId(id.value)
  const inputId = useBaseUiId()

  const isDisabled = computed(
    () => disabled.value ?? group?.disabled.value ?? false
  )
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
        role: "radio",
        id: rootId,
        // 组合（roving）tabindex：选中项 0，其余 -1
        tabindex: checked ? 0 : -1,
        "aria-checked": String(checked),
        name: group?.name.value,
      },
      checkedStateProps(checked),
      checked ? { "data-composite-item-active": "" } : null,
      getStateAttributesProps({ disabled: isDisabled.value }),
      isDisabled.value ? { "aria-disabled": "true" } : null,
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

  // 隐藏原生 input：checked/value 以 attribute 呈现（actview 走 property 不反射）
  let inputEl: HTMLInputElement | null = null
  const syncInput = () => {
    // 先读依赖再早退（watchEffect 依赖追踪在早退后不生效）
    const checked = isChecked.value
    const val = String(value.value ?? "")
    if (!inputEl) return
    if (checked) inputEl.setAttribute("checked", "")
    else inputEl.removeAttribute("checked")
    inputEl.setAttribute("value", val)
  }
  watchEffect(syncInput)

  const hiddenInput = jsx("input", {
    "aria-hidden": "true",
    id: inputId,
    style: SR_ONLY_STYLE,
    tabindex: -1,
    type: "radio",
    ref: (el: HTMLInputElement | null) => {
      inputEl = el
      syncInput()
    },
  })

  return render.value == null ? (
    jsx(Fragment, {
      children: [jsx("span", merged.value), hiddenInput],
    })
  ) : (
    mergeRenderProps(render.value, "span", merged.value, rest.value.children)
  )
}

function Indicator(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(RADIO_KEY) as
    | { checked: { value: boolean }; disabled: { value: boolean } }
    | undefined

  const merged = computed(() =>
    mergeProps(
      checkedStateProps(ctx?.checked.value ?? false),
      getStateAttributesProps({ disabled: ctx?.disabled.value ?? false }),
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
