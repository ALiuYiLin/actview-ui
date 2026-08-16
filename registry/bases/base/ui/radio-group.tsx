// 复刻 shadcn/ui registry/bases/base/ui/radio-group.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/radio + radio-group（role=radio + aria-checked）
//   - 函数组件 + useProps + computed
import { Radio as RadioPrimitive } from "@actview/base-ui/radio"
import { RadioGroup as RadioGroupPrimitive } from "@actview/base-ui/radio-group"
import { computed, useProps } from "@actview/core"
import type { ButtonHTMLAttributes, HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function RadioGroup(
  props: HTMLAttributes & {
    name?: string
    value?: any
    defaultValue?: any
    onValueChange?: (value: any) => void
  }
) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn("cn-radio-group w-full", className.value, legacyClassName.value)
  )
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

function RadioGroupItem(
  props: ButtonHTMLAttributes & {
    value?: any
    disabled?: boolean
    id?: string
  }
) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
      className.value,
      legacyClassName.value
    )
  )
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={mergedClass.value}
      {...rest.value}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="cn-radio-group-indicator"
      >
        <span className="cn-radio-group-indicator-icon" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
