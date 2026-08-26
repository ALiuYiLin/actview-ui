// 复刻 shadcn/ui registry/bases/base/ui/input-group.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；组合 Button/Input/Textarea；
// addon 点击聚焦（事件透传，无解包问题）
import {
  type HTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "@actview/jsx"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"
import { Button, type ButtonProps } from "@/registry/bases/base/ui/button"
import { Input } from "@/registry/bases/base/ui/input"
import { Textarea } from "@/registry/bases/base/ui/textarea"

function InputGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const groupClassName = computed(() =>
    cn(
      "group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      data-slot="input-group"
      role="group"
      className={groupClassName}
      {...rest}
    />
  )
}

const inputGroupAddonVariants = cva(
  "cn-input-group-addon flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        "inline-start": "cn-input-group-addon-align-inline-start order-first",
        "inline-end": "cn-input-group-addon-align-inline-end order-last",
        "block-start":
          "cn-input-group-addon-align-block-start order-first w-full justify-start",
        "block-end":
          "cn-input-group-addon-align-block-end order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon(
  props: HTMLAttributes & VariantProps<typeof inputGroupAddonVariants>
) {
  const { class: className, className: legacyClassName, align, key, ...rest } =
    toRefs(props)
  void key
  const addonClassName = computed(() =>
    cn(
      inputGroupAddonVariants({ align: align?.value }),
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align?.value ?? "inline-start"}
      className={addonClassName}
      onClick={(e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        ;(e.currentTarget as HTMLElement)
          .parentElement?.querySelector("input")
          ?.focus()
      }}
      {...rest}
    />
  )
}

const inputGroupButtonVariants = cva(
  "cn-input-group-button flex items-center shadow-none",
  {
    variants: {
      size: {
        xs: "cn-input-group-button-size-xs",
        sm: "cn-input-group-button-size-sm",
        "icon-xs": "cn-input-group-button-size-icon-xs",
        "icon-sm": "cn-input-group-button-size-icon-sm",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton(
  props: Omit<ButtonProps, "size" | "type"> &
    VariantProps<typeof inputGroupButtonVariants> & {
      type?: "button" | "submit" | "reset"
    }
) {
  const {
    class: className,
    className: legacyClassName,
    type,
    variant,
    size,
    key,
    ...rest
  } = toRefs(props)
  void key
  const buttonClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      inputGroupButtonVariants({ size: size?.value }),
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <Button
      type={type?.value ?? "button"}
      data-size={size?.value ?? "xs"}
      variant={variant?.value ?? "ghost"}
      className={buttonClassName}
      {...rest}
    />
  )
}

function InputGroupText(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const textClassName = computed(() =>
    cn(
      "cn-input-group-text flex items-center [&_svg]:pointer-events-none",
      className?.value,
      legacyClassName?.value
    )
  )

  return <span className={textClassName} {...rest} />
}

function InputGroupInput(props: InputHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const inputClassName = computed(() =>
    cn("cn-input-group-input flex-1", className?.value, legacyClassName?.value)
  )

  return (
    <Input
      data-slot="input-group-control"
      className={inputClassName}
      {...(rest as Record<string, unknown>)}
    />
  )
}

function InputGroupTextarea(props: TextareaHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const textareaClassName = computed(() =>
    cn(
      "cn-input-group-textarea flex-1 resize-none",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <Textarea
      data-slot="input-group-control"
      className={textareaClassName}
      {...rest}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
