// @actview/base-ui Toggle：复刻 Base UI toggle（1.6.0）。
//   <button type="button" tabindex="0" aria-pressed="{pressed}">
//   state {pressed, disabled} → data-pressed / data-disabled（默认映射）
// 行为：click 切换（受控 pressed/非受控 defaultPressed）；组内使用时经
//   toggle-group 上下文（value 数组归属，见 toggle-group/index.tsx）。
// 规范：函数组件 + useProps + computed。
import {
  computed,
  provide,
  ref,
  useInjects,
  useProps,
  watchEffect,
} from "@actview/core"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

export const TOGGLE_GROUP_KEY = "actview-toggle-group"

type ToggleGroupCtx = {
  value: { value: any[] }
  disabled: { value: boolean }
  setGroupValue: (itemValue: any, pressed: boolean) => void
}

function Toggle(
  props: ButtonHTMLAttributes & {
    render?: any
    pressed?: boolean
    defaultPressed?: boolean
    disabled?: boolean
    value?: any
    onPressedChange?: (pressed: boolean) => void
  }
) {
  const {
    render,
    pressed,
    defaultPressed,
    disabled,
    value,
    onPressedChange,
    rest,
  } = useProps(props, {
    render: undefined,
    pressed: undefined,
    defaultPressed: (v) => v ?? false,
    disabled: (v) => v ?? false,
    value: undefined,
    onPressedChange: undefined,
  })
  const group = useInjects(TOGGLE_GROUP_KEY) as ToggleGroupCtx | undefined

  const state = ref<boolean>(
    group
      ? group.value.value.includes(value.value)
      : (pressed.value ?? defaultPressed.value)
  )
  watchEffect(() => {
    if (group) {
      // 组内归属：仅值变化时写入（无守卫的写入会触发无界重渲染）
      const next = group.value.value.includes(value.value)
      if (state.value !== next) state.value = next
      return
    }
    if (pressed.value !== undefined && state.value !== pressed.value) {
      state.value = pressed.value
    }
  })

  const setPressed = (v: boolean) => {
    state.value = v
    onPressedChange.value?.(v)
  }

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const { onClick: userOnClick, ...otherExternal } = external
    const isPressed = state.value
    const isDisabled = disabled.value || (group?.disabled.value ?? false)

    return mergeProps(
      { type: "button", tabindex: 0, "aria-pressed": String(isPressed) },
      isDisabled ? { disabled: true } : null,
      getStateAttributesProps({ pressed: isPressed, disabled: isDisabled }),
      {
        onClick(event: any) {
          if (isDisabled) {
            event.preventDefault()
            return
          }
          const next = !isPressed
          if (group) {
            group.setGroupValue(value.value, next)
          }
          setPressed(next)
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

export { Toggle }
