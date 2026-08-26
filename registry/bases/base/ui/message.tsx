// 复刻 shadcn/ui registry/bases/base/ui/message.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；align 默认值用 computed
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function MessageGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const groupClassName = computed(() =>
    cn("cn-message-group flex min-w-0 flex-col", className?.value, legacyClassName?.value)
  )

  return <div data-slot="message-group" className={groupClassName} {...rest} />
}

function Message(props: HTMLAttributes & { align?: "start" | "end" }) {
  const { class: className, className: legacyClassName, align, key, ...rest } =
    toRefs(props)
  void key
  const alignValue = computed(() => align?.value ?? "start")
  const messageClassName = computed(() =>
    cn(
      "cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      data-slot="message"
      data-align={alignValue}
      className={messageClassName}
      {...rest}
    />
  )
}

function MessageAvatar(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const avatarClassName = computed(() =>
    cn(
      "cn-message-avatar flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="message-avatar" className={avatarClassName} {...rest} />
  )
}

function MessageContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const contentClassName = computed(() =>
    cn(
      "cn-message-content flex w-full min-w-0 flex-col wrap-break-word",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="message-content" className={contentClassName} {...rest} />
  )
}

function MessageHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const headerClassName = computed(() =>
    cn(
      "cn-message-header flex max-w-full min-w-0 items-center",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="message-header" className={headerClassName} {...rest} />
  )
}

function MessageFooter(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const footerClassName = computed(() =>
    cn(
      "cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="message-footer" className={footerClassName} {...rest} />
  )
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
}
