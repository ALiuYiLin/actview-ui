// 复刻 shadcn/ui registry/bases/base/ui/breadcrumb.tsx 的结构（冻结源
// test/fixtures/react-reference/src/registry/bases/base/ui/breadcrumb.tsx），
// 框架层 actview：BreadcrumbLink 的 useRender 展开为 data-slot；
// render prop 暂未移植（docs/BUGS.md E1）
import { computed, toRefs } from "@actview/core"
import type { AnchorHTMLAttributes, HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"
import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"

function Breadcrumb(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cls} {...rest} />
}

function BreadcrumbList(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-list flex flex-wrap items-center wrap-break-word",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <ol data-slot="breadcrumb-list" className={cls} {...rest} />
}

function BreadcrumbItem(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-item inline-flex items-center",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <li data-slot="breadcrumb-item" className={cls} {...rest} />
}

function BreadcrumbLink(
  props: AnchorHTMLAttributes & { render?: unknown }
) {
  const {
    class: className,
    className: legacyClassName,
    render,
    key,
    ...rest
  } = toRefs(props)

  void key
  void render

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-link",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return <a data-slot="breadcrumb-link" className={cls} {...rest} />
}

function BreadcrumbPage(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-page",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cls}
      {...rest}
    />
  )
}

function BreadcrumbSeparator(
  props: HTMLAttributes & { children?: unknown }
) {
  const {
    class: className,
    className: legacyClassName,
    children,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-separator",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cls}
      {...rest}
    >
      {children?.value ?? (
        <IconPlaceholder
          lucide="ChevronRightIcon"
          tabler="IconChevronRight"
          hugeicons="ArrowRight01Icon"
          phosphor="CaretRightIcon"
          remixicon="RiArrowRightSLine"
          className="cn-rtl-flip"
        />
      )}
    </li>
  )
}

function BreadcrumbEllipsis(props: HTMLAttributes) {
  const {
    class: className,
    className: legacyClassName,
    key,
    ...rest
  } = toRefs(props)

  void key

  const cls = computed(() => {
    const c = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-breadcrumb-ellipsis flex items-center justify-center",
      typeof c === "string" ? c : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cls}
      {...rest}
    >
      <IconPlaceholder
        lucide="MoreHorizontalIcon"
        tabler="IconDots"
        hugeicons="MoreHorizontalCircle01Icon"
        phosphor="DotsThreeIcon"
        remixicon="RiMoreLine"
      />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
