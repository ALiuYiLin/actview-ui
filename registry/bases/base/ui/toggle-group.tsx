// 复刻 shadcn/ui registry/bases/base/ui/toggle-group.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/toggle + toggle-group（组上下文经 provide/useInjects）
//   - ToggleGroupContext（React.createContext）→ provide/useInjects
//   - style "--gap" CSS 变量：actview style 对象不支持 --x，改字符串 cssText
import { Toggle as TogglePrimitive } from "@actview/base-ui/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@actview/base-ui/toggle-group"
import { computed, provide, useInjects, useProps } from "@actview/core"
import { type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"
import { toggleVariants } from "@/registry/bases/base/ui/toggle"

const TOGGLE_GROUP_CTX = "actview-toggle-group-variants"

type ToggleGroupVariantCtx = VariantProps<typeof toggleVariants> & {
  spacing?: number
  orientation?: "horizontal" | "vertical"
}

function ToggleGroup(
  props: HTMLAttributes &
    VariantProps<typeof toggleVariants> & {
      spacing?: number
      orientation?: "horizontal" | "vertical"
      value?: any[]
      defaultValue?: any[]
      onValueChange?: (value: any[]) => void
    }
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    spacing,
    orientation,
    children,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    variant: undefined,
    size: undefined,
    spacing: (v) => v ?? 2,
    orientation: (v) => v ?? "horizontal",
    children: undefined,
  })

  provide(TOGGLE_GROUP_CTX, {
    variant: variant.value,
    size: size.value,
    spacing: spacing.value,
    orientation: orientation.value,
  } as Partial<ToggleGroupVariantCtx>)

  const mergedClass = computed(() =>
    cn(
      "cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
      className.value,
      legacyClassName.value
    )
  )

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant.value}
      data-size={size.value}
      data-spacing={spacing.value}
      data-orientation={orientation.value}
      style={`--gap: ${spacing.value};`}
      className={mergedClass.value}
      {...rest.value}
    >
      {children.value}
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem(
  props: ButtonHTMLAttributes & VariantProps<typeof toggleVariants> & {
    value?: any
  }
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    children,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    variant: (v) => v ?? "default",
    size: (v) => v ?? "default",
    children: undefined,
  })
  const context = useInjects(TOGGLE_GROUP_CTX) as
    | Partial<ToggleGroupVariantCtx>
    | undefined

  const mergedClass = computed(() => {
    const ctxVariant = context?.variant || variant.value
    const ctxSize = context?.size || size.value
    return cn(
      "cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
      toggleVariants({ variant: ctxVariant, size: ctxSize }),
      className.value,
      legacyClassName.value
    )
  })

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context?.variant || variant.value}
      data-size={context?.size || size.value}
      data-spacing={context?.spacing}
      className={mergedClass.value}
      {...rest.value}
    >
      {children.value}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
