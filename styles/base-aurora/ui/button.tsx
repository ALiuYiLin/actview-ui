// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构，
// 框架层从 React 换成 actview：
//   - 组件是普通函数组件（props 为第一个参数）
//   - className 用 actview 的 class（className 作兼容别名）
//   - 事件/属性透传为原生 DOM 语义（无合成事件）
//   - 类型来自 @actview/jsx（jsxImportSource: "@actview/jsx"）
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 font-semibold transition-all duration-200 group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40",
        outline: "bg-transparent text-emerald-500",
        secondary: "bg-emerald-100 text-emerald-900",
        ghost: "bg-transparent text-emerald-900",
        destructive: "bg-red-500 text-white",
        link: "bg-transparent text-emerald-500 underline",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-9 p-0",
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
