// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构（actview 版）：
// - 跨 item 引用 separator（registryDependencies）
// - IconPlaceholder（actview 图标方案：SVG 字符串 + ref 注入 innerHTML，
//   由 registry 的 icon-placeholder 组件分发，CLI 不再做图标库 import 替换）
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes, PropsOf } from "@actview/jsx"

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
        "cn-button-group-text flex items-center",
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
        "cn-button-group-separator relative self-stretch",
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
