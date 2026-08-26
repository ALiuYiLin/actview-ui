// 复刻 shadcn/ui registry/bases/base/ui/card.tsx（源 commit a85299a）的结构，
// 框架层 actview：
//   - 纯 DOM 组件（无原语依赖）
//   - 规范写法：toRefs(props) 解构 → JSX 属性自动解包 Ref（顶层 ref 属性在
//     jsxFactory unwrapProps 自动取 .value），rest 直接 spread 透传；
//     默认值用 computed(() => props.x ?? 默认)，class/className 双写归一化
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Card(props: HTMLAttributes & { size?: "default" | "sm" }) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const size = computed(() => props.size ?? "default")
  const cardClassName = computed(() =>
    cn("cn-card group/card flex flex-col", className?.value, legacyClassName?.value)
  )

  return (
    <div
      data-slot="card"
      data-size={size}
      className={cardClassName}
      {...rest}
    />
  )
}

function CardHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const headerClassName = computed(() =>
    cn(
      "cn-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="card-header" className={headerClassName} {...rest} />
}

function CardTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const titleClassName = computed(() =>
    cn("cn-card-title cn-font-heading", className?.value, legacyClassName?.value)
  )

  return <div data-slot="card-title" className={titleClassName} {...rest} />
}

function CardDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const descriptionClassName = computed(() =>
    cn("cn-card-description", className?.value, legacyClassName?.value)
  )

  return (
    <div
      data-slot="card-description"
      className={descriptionClassName}
      {...rest}
    />
  )
}

function CardAction(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const actionClassName = computed(() =>
    cn(
      "cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="card-action" className={actionClassName} {...rest} />
}

function CardContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const contentClassName = computed(() =>
    cn("cn-card-content", className?.value, legacyClassName?.value)
  )

  return <div data-slot="card-content" className={contentClassName} {...rest} />
}

function CardFooter(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, ...rest } = toRefs(props)
  const footerClassName = computed(() =>
    cn("cn-card-footer flex items-center", className?.value, legacyClassName?.value)
  )

  return <div data-slot="card-footer" className={footerClassName} {...rest} />
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


