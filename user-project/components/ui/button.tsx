// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utilities/cn"

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

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
