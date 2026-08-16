// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构：
// 组件只写一次"骨架"，样式全部用 cn-* 语义占位符，
// 由构建脚本按 style 定义替换成具体内容。
//
// 注意：本文件不需要真正运行，重点是结构复刻。
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 2px solid #dc2626; border-radius: 0; background: #fef2f2; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; transition: none; group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "background: #dc2626; color: #ffffff; box-shadow: 3px 3px 0 #7f1d1d;",
        outline: "background: transparent; color: #dc2626;",
        secondary: "background: #fecaca; color: #7f1d1d;",
        ghost: "background: transparent; color: #7f1d1d;",
        destructive: "background: #111827; color: #ffffff;",
        link: "background: transparent; color: #dc2626; text-decoration: underline dashed;",
      },
      size: {
        default: "height: 32px; padding: 0 14px; font-size: 13px;",
        sm: "height: 24px; padding: 0 10px; font-size: 11px;",
        lg: "height: 40px; padding: 0 20px; font-size: 15px;",
        icon: "width: 32px; height: 32px; padding: 0;",
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
