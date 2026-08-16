// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import { cva, type VariantProps } from "class-variance-authority"

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
