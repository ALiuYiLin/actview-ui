// 复刻 shadcn/ui registry/bases/base/ui/button.tsx（源 commit a85299a）的结构，
// 框架层 actview：
//   - 原语层 @actview/base-ui（Base UI → actview 完整移植库，npm 安装 v0.1.0）
//   - 规范写法：toRefs(props) 解构 → JSX 属性自动解包 Ref（顶层 ref 属性在
//     jsxFactory unwrapProps 自动取 .value），rest 直接 spread 透传；
//     class/className 双写归一化（React 迁移别名），默认值交给 cva defaultVariants
import { Button as ButtonPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default: "cn-button-size-default",
        xs: "cn-button-size-xs",
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
        "icon-xs": "cn-button-size-icon-xs",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-lg": "cn-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button(props: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    size,
    key,
    ...rest
  } = toRefs(props)

  // computed 惰性合并：class 变更（含 React 迁移的 className 别名）在依赖
  // 变化时重算；variant/size 未传时 cva defaultVariants 兜底。
  // key 由 JSX 层单独处理（IntrinsicAttributes 不接受 Ref），解构剔除不透传。
  void key
  const variantClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      buttonVariants({
        variant: variant?.value,
        size: size?.value,
        className: cn(
          typeof cls === "string" ? cls : undefined,
          typeof legacy === "string" ? legacy : undefined
        ),
      })
    )
  })

  return (
    <ButtonPrimitive
      data-slot="button"
      className={variantClassName}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
export type ButtonPrimitiveProps = ButtonPrimitive.Props
export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
