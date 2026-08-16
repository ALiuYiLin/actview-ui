// 复刻 shadcn/ui registry/bases/base/ui/switch.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/switch（data-checked/data-unchecked 双态映射）
//   - 函数组件 + useProps + computed
import { Switch as SwitchPrimitive } from "@actview/base-ui/switch"
import { computed, useProps } from "@actview/core"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Switch(
  props: ButtonHTMLAttributes & {
    size?: "sm" | "default"
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
) {
  const {
    class: className,
    className: legacyClassName,
    size,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    size: (v) => v ?? "default",
  })

  const mergedClass = computed(() =>
    cn(
      "cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
      className.value,
      legacyClassName.value
    )
  )

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size.value}
      className={mergedClass.value}
      {...rest.value}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="cn-switch-thumb pointer-events-none block ring-0 transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
