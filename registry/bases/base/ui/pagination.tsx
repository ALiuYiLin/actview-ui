// 复刻 shadcn/ui registry/bases/base/ui/pagination.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；PaginationLink 用 Button 的
// render VNode + nativeButton={false} 换 a 元素
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"
import { Button, type ButtonProps } from "@/registry/bases/base/ui/button"
import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"

function Pagination(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const paginationClassName = computed(() =>
    cn("cn-pagination mx-auto flex w-full justify-center", className?.value, legacyClassName?.value)
  )

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={paginationClassName}
      {...rest}
    />
  )
}

function PaginationContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const contentClassName = computed(() =>
    cn("cn-pagination-content flex items-center", className?.value, legacyClassName?.value)
  )

  return <ul data-slot="pagination-content" className={contentClassName} {...rest} />
}

function PaginationItem(props: HTMLAttributes) {
  const { key, ...rest } = toRefs(props)
  void key
  return <li data-slot="pagination-item" {...rest} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  HTMLAttributes

function PaginationLink(props: PaginationLinkProps) {
  const {
    class: className,
    className: legacyClassName,
    isActive,
    size,
    key,
    ...rest
  } = toRefs(props)
  void key
  const sizeValue = computed(() => size?.value ?? "icon")
  const linkClassName = computed(() =>
    cn("cn-pagination-link", className?.value, legacyClassName?.value)
  )

  return (
    <Button
      variant={isActive?.value ? "outline" : "ghost"}
      size={sizeValue}
      className={linkClassName}
      nativeButton={false}
      render={<a aria-current={isActive?.value ? "page" : undefined} data-slot="pagination-link" data-active={isActive?.value} {...rest} />}
    />
  )
}

function PaginationPrevious(props: PaginationLinkProps & { text?: string }) {
  const { class: className, className: legacyClassName, text, size, key, ...rest } =
    toRefs(props)
  void key
  const textValue = computed(() => text?.value ?? "Previous")
  const prevClassName = computed(() =>
    cn("cn-pagination-previous", className?.value, legacyClassName?.value)
  )

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size={size?.value ?? "default"}
      className={prevClassName}
      {...rest}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        data-icon="inline-start"
        className="cn-rtl-flip"
      />
      <span className="cn-pagination-previous-text hidden sm:block">
        {textValue}
      </span>
    </PaginationLink>
  )
}

function PaginationNext(props: PaginationLinkProps & { text?: string }) {
  const { class: className, className: legacyClassName, text, size, key, ...rest } =
    toRefs(props)
  void key
  const textValue = computed(() => text?.value ?? "Next")
  const nextClassName = computed(() =>
    cn("cn-pagination-next", className?.value, legacyClassName?.value)
  )

  return (
    <PaginationLink
      aria-label="Go to next page"
      size={size?.value ?? "default"}
      className={nextClassName}
      {...rest}
    >
      <span className="cn-pagination-next-text hidden sm:block">{textValue}</span>
      <IconPlaceholder
        lucide="ChevronRightIcon"
        tabler="IconChevronRight"
        hugeicons="ArrowRight01Icon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        data-icon="inline-end"
        className="cn-rtl-flip"
      />
    </PaginationLink>
  )
}

function PaginationEllipsis(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const ellipsisClassName = computed(() =>
    cn(
      "cn-pagination-ellipsis flex items-center justify-center",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={ellipsisClassName}
      {...rest}
    >
      <IconPlaceholder
        lucide="MoreHorizontalIcon"
        tabler="IconDots"
        hugeicons="MoreHorizontalCircle01Icon"
        phosphor="DotsThreeIcon"
        remixicon="RiMoreLine"
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
