// 复刻 shadcn/ui registry/bases/base/ui/separator.tsx 的结构（actview 版）。
// 规范写法：函数组件 + useProps（Babel 自动转 defineComponent，见 button.tsx 注释）。
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/lib/utils"

function Separator(
  props: HTMLAttributes & { orientation?: "horizontal" | "vertical" }
) {
  const {
    orientation,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    orientation: (v) => v ?? "horizontal",
    class: undefined,
    className: undefined,
  })

  return (
    <div
      role="separator"
      data-slot="separator"
      aria-orientation={orientation.value}
      data-orientation={orientation.value}
      class={cn(
        "bg-violet-500 shrink-0",
        orientation.value === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export { Separator }
