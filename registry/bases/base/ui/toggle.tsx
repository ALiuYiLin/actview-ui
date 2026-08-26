// 复刻 shadcn/ui registry/bases/base/ui/toggle.tsx（源 commit a85299a），
// 框架层 actview：原语 Toggle（@actview/base-ui 命名空间形态 Toggle.Root）；
// variant/size 默认值 cva defaultVariants 兜底
import { Toggle as TogglePrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

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
  props: TogglePrimitive.Root.Props & VariantProps<typeof toggleVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    key,
    ...rest
  } = toRefs(props)
  void key
  const toggleClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      toggleVariants({ variant: variant?.value, size: size?.value }),
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={toggleClassName}
      {...rest}
    />
  )
}

export { Toggle, toggleVariants }
