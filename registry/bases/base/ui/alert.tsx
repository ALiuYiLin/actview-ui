// 复刻 shadcn/ui registry/bases/base/ui/alert.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；variant 默认值由 cva defaultVariants 兜底
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

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

function Alert(
  props: HTMLAttributes & VariantProps<typeof alertVariants>
) {
  const {
    class: className,
    className: legacyClassName,
    variant,
    key,
    ...rest
  } = toRefs(props)

  void key
  const alertClassName = computed(() =>
    cn(
      alertVariants({ variant: variant?.value }),
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="alert" role="alert" className={alertClassName} {...rest} />
}

function AlertTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const titleClassName = computed(() =>
    cn(
      "cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="alert-title" className={titleClassName} {...rest} />
}

function AlertDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const descriptionClassName = computed(() =>
    cn(
      "cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      data-slot="alert-description"
      className={descriptionClassName}
      {...rest}
    />
  )
}

function AlertAction(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const actionClassName = computed(() =>
    cn("cn-alert-action", className?.value, legacyClassName?.value)
  )

  return <div data-slot="alert-action" className={actionClassName} {...rest} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
