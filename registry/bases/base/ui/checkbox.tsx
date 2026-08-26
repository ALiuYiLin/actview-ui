// 复刻 shadcn/ui registry/bases/base/ui/checkbox.tsx（源 commit a85299a），
// 框架层 actview：原语 Checkbox（命名空间 Root/Indicator）+ IconPlaceholder
import { Checkbox as CheckboxPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"
import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"

function Checkbox(props: CheckboxPrimitive.Root.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const checkboxClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={checkboxClassName}
      {...rest}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="cn-checkbox-indicator grid place-content-center text-current transition-none"
      >
        <IconPlaceholder
          lucide="CheckIcon"
          tabler="IconCheck"
          hugeicons="Tick02Icon"
          phosphor="CheckIcon"
          remixicon="RiCheckLine"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
