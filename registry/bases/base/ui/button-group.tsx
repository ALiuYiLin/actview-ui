// 复刻 shadcn/ui registry/bases/base/ui/button-group.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/button-group.tsx），
// 框架层 actview：ButtonGroup/ButtonGroupSeparator 纯 JSX；ButtonGroupText
// 的 useRender 展开为 data-slot 手写；render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"
import { Separator as SeparatorPrimitive } from "@actview/base-ui"

import { cn } from "@/registry/bases/base/lib/utils"
import { Separator } from "@/registry/bases/base/ui/separator"

const buttonGroupVariants = cva(
  "cn-button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "cn-button-group-orientation-horizontal *:data-slot:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0",
        vertical:
          "cn-button-group-orientation-vertical flex-col *:data-slot:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup(
  props: HTMLAttributes & VariantProps<typeof buttonGroupVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    orientation,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      buttonGroupVariants({
        orientation: orientation?.value,
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation?.value}
      className={cls}
      {...rest}
    />
  )
}

function ButtonGroupText(props: HTMLAttributes & { render?: unknown }) {
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
      "cn-button-group-text flex items-center [&_svg]:pointer-events-none",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <div data-slot="button-group-text" className={cls} {...rest} />
  )
}

function ButtonGroupSeparator(props: SeparatorPrimitive.Props) {
  const {
    class: className,
    className: legacyClassName,
    orientation,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-button-group-separator relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation?.value ?? "vertical"}
      className={cls}
      {...rest}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
