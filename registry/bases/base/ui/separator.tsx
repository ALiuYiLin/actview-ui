// 复刻 shadcn/ui registry/bases/base/ui/separator.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/separator（复刻 Base UI DOM 契约：role=separator/
//     aria-orientation/data-orientation）
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { Separator as SeparatorPrimitive } from "@actview/base-ui/separator"
import { useProps } from "@actview/core"
import type { PropsOf } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Separator(props: PropsOf<typeof SeparatorPrimitive>) {
  const { orientation, class: className, className: legacyClassName, rest } =
    useProps(props, {
      orientation: (v) => v ?? "horizontal",
      class: undefined,
      className: undefined,
    })

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation.value}
      class={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export { Separator }
