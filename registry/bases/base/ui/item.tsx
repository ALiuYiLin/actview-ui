// 复刻 shadcn/ui registry/bases/base/ui/item.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/item.tsx），
// 框架层 actview：Item 的 useRender 展开为 data-slot/data-variant/data-size；
// render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"
import { Separator as SeparatorPrimitive } from "@actview/base-ui"

import { cn } from "@/registry/bases/base/lib/utils"
import { Separator } from "@/registry/bases/base/ui/separator"

function ItemGroup(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-group group/item-group flex w-full flex-col",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div role="list" data-slot="item-group" className={cls} {...rest} />
}

function ItemSeparator(props: SeparatorPrimitive.Props) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-separator",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cls}
      {...rest}
    />
  )
}

const itemVariants = cva(
  "cn-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "cn-item-variant-default",
        outline: "cn-item-variant-outline",
        muted: "cn-item-variant-muted",
      },
      size: {
        default: "cn-item-size-default",
        sm: "cn-item-size-sm",
        xs: "cn-item-size-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item(
  props: HTMLAttributes & { render?: unknown } & VariantProps<typeof itemVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    render,
    key,
    ...rest
  } = toRefs(props)

  void key
  void render

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      itemVariants({
        variant: variant?.value,
        size: size?.value,
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      data-slot="item"
      data-variant={variant?.value ?? "default"}
      data-size={size?.value ?? "default"}
      className={cls}
      {...rest}
    />
  )
}

const itemMediaVariants = cva(
  "cn-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "cn-item-media-variant-default",
        icon: "cn-item-media-variant-icon",
        image: "cn-item-media-variant-image",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia(
  props: HTMLAttributes & VariantProps<typeof itemMediaVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      itemMediaVariants({
        variant: variant?.value,
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      data-slot="item-media"
      data-variant={variant?.value ?? "default"}
      className={cls}
      {...rest}
    />
  )
}

function ItemContent(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="item-content" className={cls} {...rest} />
}

function ItemTitle(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-title line-clamp-1 flex w-fit items-center",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="item-title" className={cls} {...rest} />
}

function ItemDescription(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <p data-slot="item-description" className={cls} {...rest} />
}

function ItemActions(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-actions flex items-center",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="item-actions" className={cls} {...rest} />
}

function ItemHeader(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-header flex basis-full items-center justify-between",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="item-header" className={cls} {...rest} />
}

function ItemFooter(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-item-footer flex basis-full items-center justify-between",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="item-footer" className={cls} {...rest} />
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
