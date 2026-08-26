// 复刻 shadcn/ui registry/bases/base/ui/button.tsx（源 commit a85299a）的结构，
// 框架层 actview：
//   - 原语层 @actview/base-ui（Base UI → actview 完整移植库，npm 安装 v0.1.0）
//   - 规范写法：函数组件 + useProps（.value 惰性取值，class/className 双写，
//     解构后不进 rest 透传避免 DOM 覆盖）
import { Button as ButtonPrimitive } from "@actview/base-ui"
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default: "cn-button-size-default",
        xs: "cn-button-size-xs",
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
        "icon-xs": "cn-button-size-icon-xs",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-lg": "cn-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button(props: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const {
    variant,
    size,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    variant: (v) => v ?? "default",
    size: (v) => v ?? "default",
    class: undefined,
    className: undefined,
  })

  // computed 惰性合并：setup 只跑一次，class 变更（含 React 迁移的 className
  // 别名）在依赖变化时重算，mergeClassName 永不出现快照过期问题
  const variantClassName = computed(() =>
    cn(
      buttonVariants({
        variant: variant.value,
        size: size.value,
        className: cn(className.value, legacyClassName.value),
      })
    )
  )

  return (
    <ButtonPrimitive
      data-slot="button"
      className={variantClassName.value}
      {...rest.value}
    />
  )
}

export { Button, buttonVariants }
