// @actview/base-ui Checkbox：复刻 Base UI checkbox（1.6.0）的 DOM 契约。
// React golden 实测结构（test/fixtures/golden/l1a.checkbox.*.html）：
//   Root      — <span role="checkbox" aria-checked tabindex="0" id data-checked/
//               data-unchecked>（+ disabled → data-disabled）+ 紧随其后的
//               视觉隐藏原生 <input type="checkbox" aria-hidden tabindex="-1">
//               （checked 时带 checked 属性；无 id）
//   Indicator — <span data-checked>，仅在选中时挂载
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

const CHECKBOX_KEY = "actview-checkbox"

function checkedStateProps(checked: boolean) {
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
  provide(CHECKBOX_KEY, { checked: state, disabled })
  const rootId = useBaseUiId()

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { onClick: userOnClick, ...otherExternal } = external
    const isChecked = state.value
    const isDisabled = disabled.value

    return mergeProps(
      {
        role: "checkbox",
        id: rootId,
        tabindex: 0,
        "aria-checked": String(isChecked),
      },
      checkedStateProps(isChecked),
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

  // 隐藏原生 input 的 checked 需以 attribute 呈现（React 直写 attribute；
  // actview 的 checked 走 property 赋值，happy-dom/序列化不反射）——
  // 挂载后命令式同步 + watchEffect 跟随状态
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

function Indicator(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const ctx = useInjects(CHECKBOX_KEY) as
    | { checked: { value: boolean }; disabled: { value: boolean } }
    | undefined

  const merged = computed(() =>
    mergeProps(
      checkedStateProps(ctx?.checked.value ?? false),
      getStateAttributesProps({ disabled: ctx?.disabled.value ?? false }),
      rest.value as Record<string, any>
    )
  )

  // 未选中不挂载（Base UI 默认 keepMounted=false）
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
