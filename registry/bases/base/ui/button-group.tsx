// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构：
// - 一个 item 一个文件，跨 item 引用 separator（registryDependencies）
// - cn-* 语义占位符（6 个新 token）
// - IconPlaceholder（用户端 transform-icons 替换为真实图标）
//
// 与真实版的差异：@base-ui/react 的 mergeProps/useRender 换成原生 div + cn，
// 以便零额外运行时依赖。
import type { ComponentProps, HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"
import { cn } from "@/registry/bases/base/lib/utils"
import { Separator } from "@/registry/bases/base/ui/separator"

const buttonGroupVariants = cva("cn-button-group flex w-fit items-stretch", {
  variants: {
    orientation: {
      horizontal: "cn-button-group-orientation-horizontal",
      vertical: "cn-button-group-orientation-vertical flex-col",
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
      className={cn("cn-button-group-text flex items-center", className)}
      {...props}
    >
      <IconPlaceholder
        lucide="ChevronDown"
        tabler="IconChevronDown"
        hugeicons="ArrowDown01Icon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
      />
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
      className={cn("cn-button-group-separator relative self-stretch", className)}
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
