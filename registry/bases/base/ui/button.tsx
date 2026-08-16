// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构，框架层 actview：
//   - actview 组件标准写法：defineComponent + setup 返回 render 函数。
//     简写函数组件经 defineComponentPlugin 转换后，函数体内的 props 解构是
//     setup 一次性快照（children/事件等 props 更新不会进入 render）；
//     因此在 render 内每次从 props 解构（@actview/lucide 同款写法）。
//   - className 用 actview 的 class（className 作兼容别名）
//   - 类型来自 @actview/jsx（jsxImportSource: "@actview/jsx"）
import { defineComponent } from "actview"
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

const Button = defineComponent(
  (props: ButtonHTMLAttributes & VariantProps<typeof buttonVariants>) => {
    return () => {
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
  },
  "Button"
)

export { Button, buttonVariants }
