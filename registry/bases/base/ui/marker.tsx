// 复刻 shadcn/ui registry/bases/base/ui/marker.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/marker.tsx），
// 框架层 actview：Marker 的 useRender 展开为 data-slot/data-variant；
// render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

const markerVariants = cva(
  "cn-marker group/marker relative flex w-full items-center",
  {
    variants: {
      variant: {
        default: "cn-marker-variant-default",
        separator: "cn-marker-variant-separator",
        border: "cn-marker-variant-border",
      },
    },
  }
)

function Marker(
  props: HTMLAttributes & { render?: unknown } & VariantProps<typeof markerVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
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
      markerVariants({
        // 注意：markerVariants 无 defaultVariants，undefined 会丢 variant 类，
        // 需显式兜底（React 版靠默认参数 variant = "default"）
        variant: variant?.value ?? "default",
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <div
      data-slot="marker"
      data-variant={variant?.value ?? "default"}
      className={cls}
      {...rest}
    />
  )
}

function MarkerIcon(props: HTMLAttributes) {
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
      "cn-marker-icon shrink-0",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <span data-slot="marker-icon" aria-hidden="true" className={cls} {...rest} />
}

function MarkerContent(props: HTMLAttributes) {
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
      "cn-marker-content min-w-0 wrap-break-word",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <span data-slot="marker-content" className={cls} {...rest} />
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }
