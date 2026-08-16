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
  "inline-flex items-center justify-center gap-1.5 rounded-none border-2 border-red-600 bg-red-50 font-bold uppercase tracking-wide group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "bg-red-600 text-white shadow-[3px_3px_0_#7f1d1d]",
        outline: "bg-transparent text-red-600",
        secondary: "bg-red-200 text-red-900",
        ghost: "bg-transparent text-red-900",
        destructive: "bg-gray-900 text-white",
        link: "bg-transparent text-red-600 underline decoration-dashed",
      },
      size: {
        default: "h-8 px-3.5 text-[13px]",
        sm: "h-6 px-2.5 text-[11px]",
        lg: "h-10 px-5 text-[15px]",
        icon: "size-8 p-0",
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
