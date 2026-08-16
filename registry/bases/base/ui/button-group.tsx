// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构（actview 版）：
// - 跨 item 引用 separator（registryDependencies）
// - IconPlaceholder（用户端 transform-icons 按 iconLibrary 替换为
//   @actview/lucide 图标组件并注入 import，复刻 shadcn 原版机制）
// - 规范写法：函数组件 + useProps（Babel 自动转 defineComponent，见 button.tsx 注释）
import { useProps } from "@actview/core"
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
  const { orientation, class: className, className: legacyClassName, rest } =
    useProps(props, {
      orientation: (v) => v ?? "horizontal",
      class: undefined,
      className: undefined,
    })

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation.value}
      class={cn(
        buttonGroupVariants({ orientation: orientation.value }),
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function ButtonGroupText(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      class: undefined,
      className: undefined,
    }
  )

  return (
    <div
      data-slot="button-group-text"
      class={cn(
        "cn-button-group-text flex items-center",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    >
      <IconPlaceholder
        lucide="ChevronDown"
        tabler="IconChevronDown"
        hugeicons="ArrowDown01Icon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
      />
      {rest.value.children}
    </div>
  )
}

function ButtonGroupSeparator(props: PropsOf<typeof Separator>) {
  const {
    orientation,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    orientation: (v) => v ?? "vertical",
    class: undefined,
    className: undefined,
  })

  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation.value}
      class={cn(
        "cn-button-group-separator relative self-stretch",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
