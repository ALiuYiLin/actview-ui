// 复刻 shadcn/ui registry/bases/base/ui/toggle-group.tsx（源 commit a85299a），
// 框架层 actview：
//   - 原语 ToggleGroup（命名空间 Root）+ Toggle（命名空间 Root）
//   - React createContext/useContext → actview createContext().Provider/.use()
//     （use 返回 Ref，读 .value 建立追踪）
//   - spacing/orientation 默认值 computed；style 内 CSS 变量用活值
import { Toggle as TogglePrimitive } from "@actview/base-ui"
import { ToggleGroup as ToggleGroupPrimitive } from "@actview/base-ui"
import { computed, createContext, toRefs } from "@actview/core"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"
import { toggleVariants } from "@/registry/bases/base/ui/toggle"

const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

type ToggleGroupProps = ToggleGroupPrimitive.Root.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }

function ToggleGroup(props: ToggleGroupProps) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    spacing,
    orientation,
    children,
    key,
    ...rest
  } = toRefs(props)
  void key

  const spacingValue = computed(() => spacing?.value ?? 2)
  const orientationValue = computed(() => orientation?.value ?? "horizontal")
  const groupClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  const contextValue = computed(() => ({
    variant: variant?.value,
    size: size?.value,
    spacing: spacingValue.value,
    orientation: orientationValue.value,
  }))

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant?.value}
      data-size={size?.value}
      data-spacing={spacingValue}
      data-orientation={orientationValue}
      style={{ "--gap": spacingValue.value } as Record<string, string | number>}
      className={groupClassName}
      {...rest}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children?.value}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem(
  props: TogglePrimitive.Root.Props & VariantProps<typeof toggleVariants>
) {
  const context = ToggleGroupContext.use()

  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    children,
    key,
    ...rest
  } = toRefs(props)
  void key

  const resolvedVariant = computed(() => context.value.variant || variant?.value || "default")
  const resolvedSize = computed(() => context.value.size || size?.value || "default")
  const itemClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
      toggleVariants({
        variant: resolvedVariant.value,
        size: resolvedSize.value,
      }),
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <TogglePrimitive.Root
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.value.spacing}
      className={itemClassName}
      {...rest}
    >
      {children?.value}
    </TogglePrimitive.Root>
  )
}

export { ToggleGroup, ToggleGroupItem }
export type { ToggleGroupProps }
