// 复刻 shadcn/ui registry/bases/base/ui/separator.tsx 的结构（actview 版）。
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Separator(
  props: HTMLAttributes & { orientation?: "horizontal" | "vertical" }
) {
  const {
    class: className,
    className: legacyClassName,
    orientation = "horizontal",
    ...rest
  } = props

  return (
    <div
      role="separator"
      data-slot="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      class={cn(
        "cn-separator shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
        legacyClassName
      )}
      {...rest}
    />
  )
}

export { Separator }
