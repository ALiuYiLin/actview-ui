// 复刻 shadcn/ui registry/bases/base/ui/checkbox.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/checkbox（data-checked；Indicator 选中才挂载）
//   - 图标经 IconPlaceholder（CLI transform-icons 替换为 @actview/lucide）
//   - 函数组件 + useProps + computed
import { Checkbox as CheckboxPrimitive } from "@actview/base-ui/checkbox"
import { computed, useProps } from "@actview/core"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"
import { cn } from "@/registry/bases/base/lib/utils"

function Checkbox(
  props: ButtonHTMLAttributes & {
    checked?: boolean
    defaultChecked?: boolean
    disabled?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )

  const mergedClass = computed(() =>
    cn(
      "cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
      className.value,
      legacyClassName.value
    )
  )

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={mergedClass.value}
      {...rest.value}
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
