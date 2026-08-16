// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构，
// 框架层从 React 换成 actview：
//   - 组件是普通函数组件（props 为第一个参数）
//   - className 用 actview 的 class（className 作兼容别名）
//   - 事件/属性透传为原生 DOM 语义（无合成事件）
//   - 类型来自 @actview/jsx（jsxImportSource: "@actview/jsx"）
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0",
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
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button(
  props: ButtonHTMLAttributes & VariantProps<typeof buttonVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant = "default",
    size = "default",
    ...rest
  } = props

  return (
    <button
      data-slot="button"
      class={cn(buttonVariants({ variant, size }), className, legacyClassName)}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
