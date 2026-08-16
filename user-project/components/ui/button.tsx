// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import type { ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utilities/cn"

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

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
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
