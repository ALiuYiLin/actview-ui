// @actview/base-ui ToggleGroup：复刻 Base UI toggle-group（1.6.0）。
//   <div>，state {disabled, orientation} → data-disabled / data-horizontal /
//   data-vertical（styles token 的 group-data-* 变体依赖这些属性）
// 组上下文：value 数组（多选）/ 单选；Toggle 读组上下文归属 pressed。
// 规范：函数组件 + useProps + computed；provide/useInjects。
import {
  computed,
  provide,
  ref,
  useProps,
  watchEffect,
} from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"
import { TOGGLE_GROUP_KEY } from "../toggle"
import { sameValue } from "../internals/compare"

function ToggleGroup(
  props: HTMLAttributes & {
    render?: any
    value?: any[]
    defaultValue?: any[]
    disabled?: boolean
    orientation?: "horizontal" | "vertical"
    onValueChange?: (value: any[]) => void
  }
) {
  const {
    render,
    value,
    defaultValue,
    disabled,
    orientation,
    onValueChange,
    rest,
  } = useProps(props, {
    render: undefined,
    value: undefined,
    defaultValue: (v) => v ?? [],
    disabled: (v) => v ?? false,
    orientation: (v) => v ?? "horizontal",
    onValueChange: undefined,
  })

  const groupValue = ref<any[]>(value.value ?? defaultValue.value)
  watchEffect(() => {
    // useProps 派生值引用不稳定：必须按值比较（身份比较会死循环）
    const next = value.value
    if (next !== undefined && !sameValue(groupValue.value, next)) {
      groupValue.value = next
    }
  })

  const setGroupValue = (itemValue: any, pressed: boolean) => {
    const next = pressed
      ? groupValue.value.includes(itemValue)
        ? groupValue.value
        : [...groupValue.value, itemValue]
      : groupValue.value.filter((v) => v !== itemValue)
    groupValue.value = next
    onValueChange.value?.(next)
  }

  provide(TOGGLE_GROUP_KEY, { value: groupValue, disabled, setGroupValue })

  const merged = computed(() =>
    mergeProps(
      getStateAttributesProps({
        disabled: disabled.value,
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

export { ToggleGroup }
