// 复刻 shadcn/ui registry/bases/base/ui/toggle.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/toggle（aria-pressed + data-pressed）
//   - 函数组件 + useProps + computed
import { Toggle as TogglePrimitive } from "@actview/base-ui/toggle"
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

const toggleVariants = cva(
  "cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-toggle-variant-default",
        outline: "cn-toggle-variant-outline",
      },
      size: {
        default: "cn-toggle-size-default",
        sm: "cn-toggle-size-sm",
        lg: "cn-toggle-size-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle(
  props: ButtonHTMLAttributes & VariantProps<typeof toggleVariants> & {
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?: (pressed: boolean) => void
  }
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    variant: (v) => v ?? "default",
    size: (v) => v ?? "default",
  })

  const mergedClass = computed(() =>
    cn(
      toggleVariants({
        variant: variant.value,
        size: size.value,
        className: cn(className.value, legacyClassName.value),
      })
    )
  )

  return (
    <TogglePrimitive
      data-slot="toggle"
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

export { Toggle, toggleVariants }
