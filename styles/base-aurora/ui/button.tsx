// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; background: rgba(16, 185, 129, 0.08); font-weight: 600; transition: all 0.2s ease; group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "background: #10b981; color: #ffffff; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);",
        outline: "background: transparent; color: #10b981;",
        secondary: "background: #d1fae5; color: #065f46;",
        ghost: "background: transparent; color: #065f46;",
        destructive: "background: #ef4444; color: #ffffff;",
        link: "background: transparent; color: #10b981; text-decoration: underline;",
      },
      size: {
        default: "height: 36px; padding: 0 16px; font-size: 14px;",
        sm: "height: 28px; padding: 0 12px; font-size: 12px;",
        lg: "height: 44px; padding: 0 24px; font-size: 16px;",
        icon: "width: 36px; height: 36px; padding: 0;",
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
