// 复刻 shadcn/ui registry/bases/base/ui/field.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
//   - useMemo → computed（FieldError 内容推导）
//   - data-content 布尔属性显式 String 化（React 渲染 "true"/"false"）
//   - 跨 item 依赖 label / separator（registryDependencies）
import { computed, useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes, PropsOf } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"
import { Label } from "@/registry/bases/base/ui/label"
import { Separator } from "@/registry/bases/base/ui/separator"

function FieldSet(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <fieldset
      data-slot="field-set"
      class={cn("cn-field-set flex flex-col", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function FieldLegend(
  props: HTMLAttributes & { variant?: "legend" | "label" }
) {
  const { variant, class: className, className: legacyClassName, rest } =
    useProps(props, {
      variant: (v) => v ?? "legend",
      class: undefined,
      className: undefined,
    })

  return (
    <legend
      data-slot="field-legend"
      data-variant={variant.value}
      class={cn("cn-field-legend", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function FieldGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="field-group"
      class={cn(
        "cn-field-group group/field-group @container/field-group flex w-full flex-col",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

const fieldVariants = cva("cn-field group/field flex w-full", {
  variants: {
    orientation: {
      vertical:
        "cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field(
  props: HTMLAttributes & VariantProps<typeof fieldVariants>
) {
  const {
    orientation,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    orientation: (v) => v ?? "vertical",
    class: undefined,
    className: undefined,
  })

  const variantClassName = computed(() =>
    cn(
      fieldVariants({ orientation: orientation.value }),
      className.value,
      legacyClassName.value
    )
  )

  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation.value}
      class={variantClassName.value}
      {...rest.value}
    />
  )
}

function FieldContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="field-content"
      class={cn(
        "cn-field-content group/field-content flex flex-1 flex-col leading-snug",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function FieldLabel(props: PropsOf<typeof Label>) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <Label
      data-slot="field-label"
      class={cn(
        "cn-field-label group/field-label peer/field-label flex w-fit",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function FieldTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="field-label"
      class={cn("cn-field-title flex w-fit items-center", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function FieldDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <p
      data-slot="field-description"
      class={cn(
        "cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function FieldSeparator(props: HTMLAttributes) {
  const { children, class: className, className: legacyClassName, rest } =
    useProps(props, {
      children: undefined,
      class: undefined,
      className: undefined,
    })

  return (
    <div
      data-slot="field-separator"
      data-content={String(!!children.value)}
      class={cn("cn-field-separator relative", className.value, legacyClassName.value)}
      {...rest.value}
    >
      <Separator class="absolute inset-0 top-1/2" />
      {children.value && (
        <span
          class="cn-field-separator-content relative mx-auto block w-fit bg-background"
          data-slot="field-separator-content"
        >
          {children.value}
        </span>
      )}
    </div>
  )
}

function FieldError(
  props: HTMLAttributes & {
    errors?: Array<{ message?: string } | undefined>
  }
) {
  const { children, errors, class: className, className: legacyClassName, rest } =
    useProps(props, {
      children: undefined,
      errors: undefined,
      class: undefined,
      className: undefined,
    })

  const content = computed(() => {
    if (children.value) {
      return children.value
    }

    const errorList = errors.value as
      | Array<{ message?: string } | undefined>
      | undefined
    if (!errorList?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errorList.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul class="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  })

  if (!content.value) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      class={cn("cn-field-error font-normal", className.value, legacyClassName.value)}
      {...rest.value}
    >
      {content.value}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
