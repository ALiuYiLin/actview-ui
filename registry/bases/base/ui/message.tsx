// 复刻 shadcn/ui registry/bases/base/ui/message.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function MessageGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="message-group"
      class={cn("cn-message-group flex min-w-0 flex-col", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function Message(
  props: HTMLAttributes & { align?: "start" | "end" }
) {
  const { align, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      align: (v) => v ?? "start",
      class: undefined,
      className: undefined,
    }
  )

  return (
    <div
      data-slot="message"
      data-align={align.value}
      class={cn(
        "cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function MessageAvatar(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="message-avatar"
      class={cn(
        "cn-message-avatar flex w-fit shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function MessageContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="message-content"
      class={cn(
        "cn-message-content flex w-full min-w-0 flex-col wrap-break-word",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function MessageHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="message-header"
      class={cn(
        "cn-message-header flex max-w-full min-w-0 items-center",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function MessageFooter(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="message-footer"
      class={cn(
        "cn-message-footer flex max-w-full min-w-0 items-center group-data-[align=end]/message:justify-end",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
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
