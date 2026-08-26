// 复刻 shadcn/ui registry/bases/base/ui/attachment.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/attachment.tsx），
// 框架层 actview：AttachmentTrigger 的 useRender 展开为 data-slot +
// type 默认值；render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"
import { Button, type ButtonProps } from "@/registry/bases/base/ui/button"

const attachmentVariants = cva(
  "cn-attachment group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap border bg-card text-card-foreground transition-colors has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default: "cn-attachment-size-default",
        sm: "cn-attachment-size-sm",
        xs: "cn-attachment-size-xs",
      },
      orientation: {
        horizontal: "cn-attachment-orientation-horizontal items-center",
        vertical: "cn-attachment-orientation-vertical flex-col",
      },
    },
  }
)

function Attachment(
  props: HTMLAttributes &
    VariantProps<typeof attachmentVariants> & {
      state?: "idle" | "uploading" | "processing" | "error" | "done"
      /** React 版未消费 variant（透传到 DOM），此处保持同构 */
      variant?: string
    }
) {
  const {
    class: className,
    className: legacyClassName,
    state,
    size,
    orientation,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      attachmentVariants({
        // 注意：attachmentVariants 无 defaultVariants，undefined 会丢变体类，
        // 需显式兜底（React 版靠默认参数 size/orientation）
        size: size?.value ?? "default",
        orientation: orientation?.value ?? "horizontal",
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      data-slot="attachment"
      data-state={state?.value ?? "done"}
      data-size={size?.value ?? "default"}
      data-orientation={orientation?.value ?? "horizontal"}
      className={cls}
      {...rest}
    />
  )
}

const attachmentMediaVariants = cva(
  "cn-attachment-media relative flex aspect-square shrink-0 items-center justify-center overflow-hidden group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        icon: "cn-attachment-media-variant-icon",
        image:
          "cn-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

function AttachmentMedia(
  props: HTMLAttributes & VariantProps<typeof attachmentMediaVariants>
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
      attachmentMediaVariants({
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
      data-slot="attachment-media"
      data-variant={variant?.value ?? "icon"}
      className={cls}
      {...rest}
    />
  )
}

function AttachmentContent(props: HTMLAttributes) {
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
      "cn-attachment-content max-w-full min-w-0 flex-1",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="attachment-content" className={cls} {...rest} />
}

function AttachmentTitle(props: HTMLAttributes) {
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
      "cn-attachment-title block max-w-full min-w-0 truncate group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <span data-slot="attachment-title" className={cls} {...rest} />
}

function AttachmentDescription(props: HTMLAttributes) {
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
      "cn-attachment-description block min-w-0 truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
      "max-w-full",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <span data-slot="attachment-description" className={cls} {...rest} />
}

function AttachmentActions(props: HTMLAttributes) {
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
      "cn-attachment-actions flex shrink-0 items-center",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="attachment-actions" className={cls} {...rest} />
}

function AttachmentAction(props: ButtonProps) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-attachment-action",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <Button
      data-slot="attachment-action"
      variant={variant?.value ?? "ghost"}
      size={size?.value ?? "icon-xs"}
      className={cls}
      {...rest}
    />
  )
}

function AttachmentTrigger(
  props: HTMLAttributes & {
    render?: unknown
    type?: "button" | "submit" | "reset"
  }
) {
  const {
    class: className,
    className: legacyClassName,
    type,
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
      "cn-attachment-trigger absolute inset-0 z-10 outline-none",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <button
      data-slot="attachment-trigger"
      type={type?.value ?? "button"}
      className={cls}
      {...rest}
    />
  )
}

function AttachmentGroup(props: HTMLAttributes) {
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
      "cn-attachment-group flex min-w-0 scroll-fade-x snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="attachment-group" className={cls} {...rest} />
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
}
