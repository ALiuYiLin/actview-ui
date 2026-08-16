// 复刻 shadcn/ui registry/bases/base/ui/empty.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Empty(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="empty"
      class={cn(
        "cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function EmptyHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="empty-header"
      class={cn(
        "cn-empty-header flex max-w-sm flex-col items-center",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

const emptyMediaVariants = cva(
  "cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-empty-media-default",
        icon: "cn-empty-media-icon",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia(
  props: HTMLAttributes & VariantProps<typeof emptyMediaVariants>
) {
  const {
    variant,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    variant: (v) => v ?? "default",
    class: undefined,
    className: undefined,
  })

  const variantClassName = computed(() =>
    cn(
      emptyMediaVariants({ variant: variant.value }),
      className.value,
      legacyClassName.value
    )
  )

  return (
    <div
      data-slot="empty-icon"
      data-variant={variant.value}
      class={variantClassName.value}
      {...rest.value}
    />
  )
}

function EmptyTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="empty-title"
      class={cn("cn-empty-title cn-font-heading", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function EmptyDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="empty-description"
      class={cn(
        "cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function EmptyContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="empty-content"
      class={cn(
        "cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
