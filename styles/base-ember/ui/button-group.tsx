// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构（actview 版）：
// - 跨 item 引用 separator（registryDependencies）
// - IconPlaceholder（actview 图标方案：SVG 字符串 + ref 注入 innerHTML，
//   由 registry 的 icon-placeholder 组件分发，CLI 不再做图标库 import 替换）
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes, PropsOf } from "@actview/jsx"

import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"
import { cn } from "@/lib/utils"
import { Separator } from "@/styles/base-ember/ui/separator"

const buttonGroupVariants = cva("inline-flex overflow-hidden rounded-none border-2 border-red-600 bg-red-50 flex w-fit items-stretch", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "gap-0.5 flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

function ButtonGroup(
  props: HTMLAttributes & VariantProps<typeof buttonGroupVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    orientation,
    ...rest
  } = props

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      class={cn(
        buttonGroupVariants({ orientation }),
        className,
        legacyClassName
      )}
      {...rest}
    />
  )
}

function ButtonGroupText(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    children,
    ...rest
  } = props

  return (
    <div
      data-slot="button-group-text"
      class={cn(
        "px-2.5 text-[13px] font-bold uppercase tracking-wide text-red-900 flex items-center",
        className,
        legacyClassName
      )}
      {...rest}
    >
      <IconPlaceholder name="chevron-down" />
      {children}
    </div>
  )
}

function ButtonGroupSeparator(props: PropsOf<typeof Separator>) {
  const {
    class: className,
    className: legacyClassName,
    orientation = "vertical",
    ...rest
  } = props

  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      class={cn(
        "bg-red-600 relative self-stretch",
        className,
        legacyClassName
      )}
      {...rest}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
