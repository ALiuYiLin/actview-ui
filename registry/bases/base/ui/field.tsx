// 复刻 shadcn/ui registry/bases/base/ui/field.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；FieldError 的 React useMemo →
// computed（props.errors 响应式追踪）；FieldSeparator 内嵌 Separator
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/registry/bases/base/lib/utils"
import { Label } from "@/registry/bases/base/ui/label"
import { Separator } from "@/registry/bases/base/ui/separator"

function FieldSet(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const setClassName = computed(() =>
    cn("cn-field-set flex flex-col", className?.value, legacyClassName?.value)
  )

  return <fieldset data-slot="field-set" className={setClassName} {...rest} />
}

function FieldLegend(
  props: HTMLAttributes & { variant?: "legend" | "label" }
) {
  const { class: className, className: legacyClassName, variant, key, ...rest } =
    toRefs(props)
  void key
  const legendClassName = computed(() =>
    cn("cn-field-legend", className?.value, legacyClassName?.value)
  )

  return (
    <legend
      data-slot="field-legend"
      data-variant={variant?.value ?? "legend"}
      className={legendClassName}
      {...rest}
    />
  )
}

function FieldGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const groupClassName = computed(() =>
    cn(
      "cn-field-group group/field-group @container/field-group flex w-full flex-col",
      className?.value,
      legacyClassName?.value
    )
  )

  return <div data-slot="field-group" className={groupClassName} {...rest} />
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
  const { class: className, className: legacyClassName, orientation, key, ...rest } =
    toRefs(props)
  void key
  const fieldClassName = computed(() =>
    cn(
      fieldVariants({ orientation: orientation?.value }),
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation?.value ?? "vertical"}
      className={fieldClassName}
      {...rest}
    />
  )
}

function FieldContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const contentClassName = computed(() =>
    cn(
      "cn-field-content group/field-content flex flex-1 flex-col leading-snug",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div data-slot="field-content" className={contentClassName} {...rest} />
  )
}

function FieldLabel(props: Parameters<typeof Label>[0]) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const labelClassName = computed(() =>
    cn(
      "cn-field-label group/field-label peer/field-label flex w-fit",
      "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <Label data-slot="field-label" className={labelClassName} {...rest} />
  )
}

function FieldTitle(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const titleClassName = computed(() =>
    cn("cn-field-title flex w-fit items-center", className?.value, legacyClassName?.value)
  )

  return <div data-slot="field-label" className={titleClassName} {...rest} />
}

function FieldDescription(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const descriptionClassName = computed(() =>
    cn(
      "cn-field-description leading-normal font-normal group-has-data-horizontal/field:text-balance",
      "last:mt-0 nth-last-2:-mt-1",
      "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <p data-slot="field-description" className={descriptionClassName} {...rest} />
  )
}

function FieldSeparator(
  props: HTMLAttributes & { children?: unknown }
) {
  const { class: className, className: legacyClassName, children, key, ...rest } =
    toRefs(props)
  void key
  const hasChildren = computed(() => Boolean(children?.value))
  const separatorClassName = computed(() =>
    cn("cn-field-separator relative", className?.value, legacyClassName?.value)
  )

  return (
    <div
      data-slot="field-separator"
      data-content={hasChildren}
      className={separatorClassName}
      {...rest}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {hasChildren.value && (
        <span
          className="cn-field-separator-content relative mx-auto block w-fit bg-background"
          data-slot="field-separator-content"
        >
          {children?.value}
        </span>
      )}
    </div>
  )
}

function FieldError(
  props: HTMLAttributes & {
    children?: unknown
    errors?: Array<{ message?: string } | undefined>
  }
) {
  const { class: className, className: legacyClassName, children, errors, key, ...rest } =
    toRefs(props)
  void key

  const content = computed(() => {
    const kids = children?.value
    if (kids) {
      return kids
    }

    const errs = errors?.value
    if (!errs?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errs.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map((error, index) =>
          error?.message ? <li key={index}>{error.message}</li> : null
        )}
      </ul>
    )
  })

  if (!content.value) {
    return null
  }

  const errorClassName = computed(() =>
    cn("cn-field-error font-normal", className?.value, legacyClassName?.value)
  )

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={errorClassName}
      {...rest}
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
