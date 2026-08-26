// 复刻 shadcn/ui registry/bases/base/ui/empty.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；variant 默认值 cva defaultVariants 兜底
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

function Empty(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const emptyClassName = computed(() =>
    cn(
      "cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="empty" className={emptyClassName} {...rest} />
}

function EmptyHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const headerClassName = computed(() =>
    cn(
      "cn-empty-header flex max-w-sm flex-col items-center",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="empty-header" className={headerClassName} {...rest} />
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
  const { class: className, className: legacyClassName, variant, key, ...rest } =
    toRefs(props)
  void key
  const mediaClassName = computed(() =>
    cn(
      emptyMediaVariants({ variant: variant?.value }),
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      data-slot="empty-icon"
      data-variant={variant?.value ?? "default"}
      className={mediaClassName}
      {...rest}
    />
  )
}

function EmptyTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const titleClassName = computed(() =>
    cn("cn-empty-title cn-font-heading", className?.value, legacyClassName?.value)
  )

  return <div data-slot="empty-title" className={titleClassName} {...rest} />
}

function EmptyDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const descriptionClassName = computed(() =>
    cn(
      "cn-empty-description text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      data-slot="empty-description"
      className={descriptionClassName}
      {...rest}
    />
  )
}

function EmptyContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const contentClassName = computed(() =>
    cn(
      "cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="empty-content" className={contentClassName} {...rest} />
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
