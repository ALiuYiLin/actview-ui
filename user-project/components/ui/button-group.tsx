// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构（actview 版）：
// - 跨 item 引用 separator（registryDependencies）
// - IconPlaceholder（用户端 transform-icons 按 iconLibrary 替换为
//   @actview/lucide 图标组件并注入 import，复刻 shadcn 原版机制）
// - defineComponent + render 内解构 props（避免 setup 快照，见 button.tsx 注释）
import { ChevronDown } from "@actview/lucide"
import { defineComponent } from "actview"
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes, PropsOf } from "@actview/jsx"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva("inline-flex overflow-hidden rounded-full border border-violet-500 bg-violet-50 flex w-fit items-stretch", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "gap-1 flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

const ButtonGroup = defineComponent(
  (props: HTMLAttributes & VariantProps<typeof buttonGroupVariants>) => {
    return () => {
      const {
        class: className,
        className: legacyClassName,
        orientation = "horizontal",
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
  },
  "ButtonGroup"
)

const ButtonGroupText = defineComponent(
  (props: HTMLAttributes) => {
    return () => {
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
            "px-3.5 text-sm text-violet-900 flex items-center",
            className,
            legacyClassName
          )}
          {...rest}
        >
          <ChevronDown />
          {children}
        </div>
      )
    }
  },
  "ButtonGroupText"
)

const ButtonGroupSeparator = defineComponent(
  (props: PropsOf<typeof Separator>) => {
    return () => {
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
            "bg-violet-500 relative self-stretch",
            className,
            legacyClassName
          )}
          {...rest}
        />
      )
    }
  },
  "ButtonGroupSeparator"
)

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
