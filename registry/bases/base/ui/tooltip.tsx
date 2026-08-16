// 复刻 shadcn/ui registry/bases/base/ui/tooltip.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/tooltip（复刻 Base UI DOM 契约，见 packages/base-ui/src/tooltip）
//   - 函数组件 + useProps；class/className 双写
import { Tooltip as TooltipPrimitive } from "@actview/base-ui/tooltip"
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function TooltipProvider(props: HTMLAttributes & { delay?: number }) {
  const { delay, rest } = useProps(props, { delay: (v) => v ?? 0 })
  return (
    <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay.value} {...rest.value} />
  )
}

function Tooltip(
  props: HTMLAttributes & {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    onOpenChange?: (open: boolean) => void
  }
) {
  const { rest } = useProps(props, {})
  return <TooltipPrimitive.Root data-slot="tooltip" {...rest.value} />
}

function TooltipTrigger(
  props: HTMLAttributes & { render?: any; disabled?: boolean; id?: string }
) {
  const { rest } = useProps(props, {})
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...rest.value} />
}

function TooltipContent(
  props: HTMLAttributes & {
    side?: string
    sideOffset?: number
    align?: string
    alignOffset?: number
  }
) {
  const {
    className,
    class: legacyClassName,
    side,
    sideOffset,
    align,
    alignOffset,
    children,
    rest,
  } = useProps(props, {
    className: undefined,
    class: undefined,
    side: (v) => v ?? "top",
    sideOffset: (v) => v ?? 4,
    align: (v) => v ?? "center",
    alignOffset: (v) => v ?? 0,
    children: undefined,
  })

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align.value}
        alignOffset={alignOffset.value}
        side={side.value}
        sideOffset={sideOffset.value}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "cn-tooltip-content cn-tooltip-content-logical z-50 w-fit max-w-xs origin-(--transform-origin) bg-foreground text-background",
            className.value,
            legacyClassName.value
          )}
          {...rest.value}
        >
          {children.value}
          <TooltipPrimitive.Arrow className="cn-tooltip-arrow cn-tooltip-arrow-logical z-50 bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
