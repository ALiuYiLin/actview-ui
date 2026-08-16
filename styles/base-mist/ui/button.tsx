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
