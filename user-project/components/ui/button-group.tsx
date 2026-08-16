// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构：
// - 一个 item 一个文件，跨 item 引用 separator（registryDependencies）
// - cn-* 语义占位符（6 个新 token）
// - IconPlaceholder（用户端 transform-icons 替换为真实图标）
//
// 与真实版的差异：@base-ui/react 的 mergeProps/useRender 换成原生 div + cn，
// 以便零额外运行时依赖。
import { ChevronDown } from "lucide-react"
import type { ComponentProps, HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva("inline-flex overflow-hidden rounded-xl border border-emerald-500/35 bg-emerald-500/10 flex w-fit items-stretch", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "gap-px flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

function ButtonGroup({
  className,
  orientation,
  ...props
}: HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="button-group-text"
      className={cn("px-3 text-sm font-medium text-emerald-900 flex items-center", className)}
      {...props}
    >
      <ChevronDown />
      {children}
    </div>
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn("bg-emerald-500/35 relative self-stretch", className)}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
