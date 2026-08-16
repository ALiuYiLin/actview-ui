// @actview/base-ui Switch：复刻 Base UI switch（1.6.0）的 DOM 契约。
// React golden 实测结构（test/fixtures/golden/l1a.switch.*.html）：
//   Root  — <span role="switch" aria-checked tabindex="0" id data-checked/
//           data-unchecked>（disabled → data-disabled）+ 视觉隐藏原生
//           <input type="checkbox" aria-hidden tabindex="-1" id>（checked 时带 checked）
//   Thumb — <span data-checked/data-unchecked>
// 行为：click 切换（受控/非受控），disabled 拦截。
// 规范：函数组件 + useProps + computed；provide/useInjects。
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

import { getStateAttributesProps } from "../internals/state-attributes"
import { SR_ONLY_STYLE } from "../internals/sr-style"
import { useBaseUiId } from "../internals/use-base-ui-id"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const SWITCH_KEY = "actview-switch"

function switchStateProps(checked: boolean) {
  return checked ? { "data-checked": "" } : { "data-unchecked": "" }
}

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
  provide(SWITCH_KEY, { checked: state, disabled })
  const rootId = useBaseUiId()
  const inputId = useBaseUiId()

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { onClick: userOnClick, ...otherExternal } = external
    const isChecked = state.value
    const isDisabled = disabled.value

    return mergeProps(
      {
        role: "switch",
        id: rootId,
        tabindex: 0,
        "aria-checked": String(isChecked),
      },
      switchStateProps(isChecked),
      getStateAttributesProps({ disabled: isDisabled }),
      isDisabled ? { "aria-disabled": "true" } : null,
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

  // 隐藏原生 input：checked 以 attribute 呈现（同 checkbox 的 property 反射问题）
  let inputEl: HTMLInputElement | null = null
  const syncInput = () => {
    // 先读依赖再早退（watchEffect 依赖追踪在早退后不生效）
    const checked = state.value
    if (!inputEl) return
    if (checked) inputEl.setAttribute("checked", "")
    else inputEl.removeAttribute("checked")
  }
  watchEffect(syncInput)

  const hiddenInput = jsx("input", {
    "aria-hidden": "true",
    id: inputId,
    style: SR_ONLY_STYLE,
    tabindex: -1,
    type: "checkbox",
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

function Thumb(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(SWITCH_KEY) as
    | { checked: { value: boolean }; disabled: { value: boolean } }
    | undefined

  const merged = computed(() =>
    mergeProps(
      switchStateProps(ctx?.checked.value ?? false),
      getStateAttributesProps({ disabled: ctx?.disabled.value ?? false }),
      rest.value as Record<string, any>
    )
  )

  return render.value == null ? (
    <span {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "span", merged.value, rest.value.children)
  )
}

const Switch = { Root, Thumb }

export { Switch, Root, Thumb }
