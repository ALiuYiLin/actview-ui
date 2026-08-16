// 复刻 shadcn/ui registry/bases/base/ui/input-group.tsx（源 commit a85299a），框架层 actview：
//   - 组合 button/input/textarea（textarea 为 L0 迁移产物）
//   - 函数组件 + useProps + computed
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"
import { Button } from "@/registry/bases/base/ui/button"
import { Input } from "@/registry/bases/base/ui/input"
import { Textarea } from "@/registry/bases/base/ui/textarea"

function InputGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
      className.value,
      legacyClassName.value
    )
  )
  return (
    <div
      data-slot="input-group"
      role="group"
      className={mergedClass.value}
      {...rest.value}
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
  const {
    class: className,
    className: legacyClassName,
    align,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    align: (v) => v ?? "inline-start",
  })
  const mergedClass = computed(() =>
    cn(inputGroupAddonVariants({ align: align.value }), className.value, legacyClassName.value)
  )
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align.value}
      className={mergedClass.value}
      onClick={(e: any) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...rest.value}
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
  props: Omit<ButtonHTMLAttributes, "size" | "type"> &
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
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    type: (v) => v ?? "button",
    variant: (v) => v ?? "ghost",
    size: (v) => v ?? "xs",
  })
  const mergedClass = computed(() =>
    cn(inputGroupButtonVariants({ size: size.value }), className.value, legacyClassName.value)
  )
  return (
    <Button
      type={type.value}
      data-size={size.value}
      variant={variant.value as any}
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

function InputGroupText(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "cn-input-group-text flex items-center [&_svg]:pointer-events-none",
      className.value,
      legacyClassName.value
    )
  )
  return <span className={mergedClass.value} {...rest.value} />
}

function InputGroupInput(props: InputHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn("cn-input-group-input flex-1", className.value, legacyClassName.value)
  )
  return (
    <Input
      data-slot="input-group-control"
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

function InputGroupTextarea(props: TextareaHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "cn-input-group-textarea flex-1 resize-none",
      className.value,
      legacyClassName.value
    )
  )
  return (
    <Textarea
      data-slot="input-group-control"
      className={mergedClass.value}
      {...rest.value}
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
