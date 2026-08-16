// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #8b5cf6; border-radius: 999px; background: #f5f3ff; font-weight: 500; transition: opacity 0.3s ease; group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "background: #8b5cf6; color: #ffffff; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);",
        outline: "background: transparent; color: #8b5cf6;",
        secondary: "background: #ede9fe; color: #4c1d95;",
        ghost: "background: transparent; color: #4c1d95;",
        destructive: "background: #f43f5e; color: #ffffff;",
        link: "background: transparent; color: #8b5cf6; text-decoration: underline wavy;",
      },
      size: {
        default: "height: 40px; padding: 0 20px; font-size: 14px;",
        sm: "height: 30px; padding: 0 14px; font-size: 12px;",
        lg: "height: 48px; padding: 0 28px; font-size: 16px;",
        icon: "width: 40px; height: 40px; padding: 0;",
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
