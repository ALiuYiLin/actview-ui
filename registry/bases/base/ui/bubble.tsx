// 复刻 shadcn/ui registry/bases/base/ui/bubble.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/bubble.tsx），
// 框架层 actview：BubbleContent 的 useRender 展开为 data-slot；
// render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

function BubbleGroup(props: HTMLAttributes) {
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
      "cn-bubble-group flex min-w-0 flex-col",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="bubble-group" className={cls} {...rest} />
}

const bubbleVariants = cva(
  "cn-bubble group/bubble relative flex w-fit min-w-0 flex-col",
  {
    variants: {
      variant: {
        default: "cn-bubble-variant-default",
        secondary: "cn-bubble-variant-secondary",
        muted: "cn-bubble-variant-muted",
        tinted: "cn-bubble-variant-tinted",
        outline: "cn-bubble-variant-outline",
        ghost: "cn-bubble-variant-ghost",
        destructive: "cn-bubble-variant-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Bubble(
  props: HTMLAttributes &
    VariantProps<typeof bubbleVariants> & { align?: "start" | "end" }
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    align,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      bubbleVariants({
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
      data-slot="bubble"
      data-variant={variant?.value ?? "default"}
      data-align={align?.value ?? "start"}
      className={cls}
      {...rest}
    />
  )
}

function BubbleContent(props: HTMLAttributes & { render?: unknown }) {
  const {
    class: className,
    className: legacyClassName,
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
      "cn-bubble-content w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <div data-slot="bubble-content" className={cls} {...rest} />
}

const bubbleReactionsVariants = cva(
  "cn-bubble-reactions absolute z-10 flex w-fit items-center justify-center",
  {
    variants: {
      side: {
        top: "cn-bubble-reactions-side-top",
        bottom: "cn-bubble-reactions-side-bottom",
      },
      align: {
        start: "cn-bubble-reactions-align-start",
        end: "cn-bubble-reactions-align-end",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  }
)

function BubbleReactions(
  props: HTMLAttributes & {
    align?: "start" | "end"
    side?: "top" | "bottom"
  }
) {
  const {
    class: className,
    className: legacyClassName,
    side,
    align,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      bubbleReactionsVariants({
        side: side?.value,
        align: align?.value,
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      data-slot="bubble-reactions"
      data-align={align?.value ?? "end"}
      data-side={side?.value ?? "bottom"}
      className={cls}
      {...rest}
    />
  )
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }
