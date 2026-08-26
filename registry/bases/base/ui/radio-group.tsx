// 复刻 shadcn/ui registry/bases/base/ui/radio-group.tsx（源 commit a85299a），
// 框架层 actview：原语 RadioGroup（具名）+ Radio（命名空间 Root/Indicator）
import { Radio as RadioPrimitive } from "@actview/base-ui"
import { RadioGroup as RadioGroupPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function RadioGroup(props: RadioGroupPrimitive.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const groupClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-radio-group w-full",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={groupClassName}
      {...rest}
    />
  )
}

function RadioGroupItem(props: RadioPrimitive.Root.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const itemClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={itemClassName}
      {...rest}
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
