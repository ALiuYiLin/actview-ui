// 复刻 shadcn/ui registry/bases/base/ui/alert.tsx（源 commit a85299a），框架层 actview：
//   - 规范写法：函数组件 + useProps（.value 惰性取值，class/className 双写，
//     解构后不进 rest 透传避免 DOM 覆盖）
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

const alertVariants = cva("cn-alert group/alert relative w-full", {
  variants: {
    variant: {
      default: "cn-alert-variant-default",
      destructive: "cn-alert-variant-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Alert(props: HTMLAttributes & VariantProps<typeof alertVariants>) {
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
    cn(alertVariants({ variant: variant.value }), className.value, legacyClassName.value)
  )

  return (
    <div
      data-slot="alert"
      role="alert"
      class={variantClassName.value}
      {...rest.value}
    />
  )
}

function AlertTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="alert-title"
      class={cn(
        "cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function AlertDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="alert-description"
      class={cn(
        "cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function AlertAction(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="alert-action"
      class={cn("cn-alert-action", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
