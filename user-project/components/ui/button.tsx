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

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-violet-500 bg-violet-50 font-medium transition-opacity duration-300 group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "bg-violet-500 text-white shadow-lg shadow-violet-500/35",
        outline: "bg-transparent text-violet-500",
        secondary: "bg-violet-100 text-violet-900",
        ghost: "bg-transparent text-violet-900",
        destructive: "bg-rose-500 text-white",
        link: "bg-transparent text-violet-500 underline decoration-wavy",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-[30px] px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10 p-0",
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
