// 复刻 shadcn/ui registry/bases/base/ui/badge.tsx 的结构（冻结源 test/fixtures/
// react-reference/src/registry/bases/base/ui/badge.tsx），框架层 actview：
//   - 纯静态组件（无 base-ui 原语）：useRender 展开为手写 data-slot/data-variant
//   - render prop（React useRender 专属）暂未移植：解构剔除（docs/BUGS.md E1）
//   - 规范写法：toRefs(props) → computed 合并 cn → JSX 自动解包 Ref
import { computed, toRefs } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

const badgeVariants = cva(
  "cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "cn-badge-variant-default",
        secondary: "cn-badge-variant-secondary",
        destructive: "cn-badge-variant-destructive",
        outline: "cn-badge-variant-outline",
        ghost: "cn-badge-variant-ghost",
        link: "cn-badge-variant-link",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge(
  props: HTMLAttributes & { render?: unknown } & VariantProps<typeof badgeVariants>
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
      badgeVariants({
        variant: variant?.value,
        className: cn(
          typeof c === "string" ? c : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <span
      data-slot="badge"
      data-variant={variant?.value ?? "default"}
      className={cls}
      {...rest}
    />
  )
}

export { Badge, badgeVariants }
