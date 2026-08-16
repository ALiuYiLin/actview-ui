// 复刻 shadcn/ui registry/bases/base/ui/separator.tsx 的结构（actview 版）。
// defineComponent + render 内解构 props（避免 setup 快照，见 button.tsx 注释）。
import { defineComponent } from "actview"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/lib/utils"

const Separator = defineComponent(
  (props: HTMLAttributes & { orientation?: "horizontal" | "vertical" }) => {
    return () => {
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
            "bg-violet-500 shrink-0",
            orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
            className,
            legacyClassName
          )}
          {...rest}
        />
      )
    }
  },
  "Separator"
)

export { Separator }
