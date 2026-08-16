// 复刻 shadcn/ui registry/bases/base/ui/card.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Card(
  props: HTMLAttributes & { size?: "default" | "sm" }
) {
  const { size, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      size: (v) => v ?? "default",
      class: undefined,
      className: undefined,
    }
  )

  return (
    <div
      data-slot="card"
      data-size={size.value}
      class={cn("cn-card group/card flex flex-col", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function CardHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-header"
      class={cn(
        "cn-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function CardTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-title"
      class={cn("cn-card-title cn-font-heading", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function CardDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-description"
      class={cn("cn-card-description", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function CardAction(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-action"
      class={cn(
        "cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function CardContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-content"
      class={cn("cn-card-content", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function CardFooter(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="card-footer"
      class={cn("cn-card-footer flex items-center", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
