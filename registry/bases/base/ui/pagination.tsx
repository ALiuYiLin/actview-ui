// 复刻 shadcn/ui registry/bases/base/ui/pagination.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
//   - PaginationLink 用 Button 的 render prop（nativeButton=false）+ <a> 元素
//   - data-active / aria-hidden 等布尔属性显式 String 化（React 渲染 "true"/"false"，
//     actview 布尔值会删属性或渲染 ""，需 String 化保持一致）
import { useProps } from "@actview/core"
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  PropsOf,
} from "@actview/jsx"

import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"
import { cn } from "@/registry/bases/base/lib/utils"
import { Button } from "@/registry/bases/base/ui/button"

function Pagination(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class={cn(
        "cn-pagination mx-auto flex w-full justify-center",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function PaginationContent(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <ul
      data-slot="pagination-content"
      class={cn("cn-pagination-content flex items-center", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function PaginationItem(props: HTMLAttributes) {
  const { rest } = useProps(props, {})
  return <li data-slot="pagination-item" {...rest.value} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<PropsOf<typeof Button>, "size"> &
  AnchorHTMLAttributes

function PaginationLink(props: PaginationLinkProps) {
  const {
    isActive,
    size,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    isActive: undefined,
    size: (v) => v ?? "icon",
    class: undefined,
    className: undefined,
  })

  return (
    <Button
      variant={isActive.value ? "outline" : "ghost"}
      size={size.value}
      class={cn("cn-pagination-link", className.value, legacyClassName.value)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive.value ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive.value == null ? undefined : String(isActive.value)}
          {...rest.value}
        />
      }
    />
  )
}

function PaginationPrevious(
  props: PropsOf<typeof PaginationLink> & { text?: string }
) {
  const { text, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      text: (v) => v ?? "Previous",
      class: undefined,
      className: undefined,
    }
  )

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      class={cn("cn-pagination-previous", className.value, legacyClassName.value)}
      {...rest.value}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        data-icon="inline-start"
        class="cn-rtl-flip"
      />
      <span class="cn-pagination-previous-text hidden sm:block">
        {text.value}
      </span>
    </PaginationLink>
  )
}

function PaginationNext(
  props: PropsOf<typeof PaginationLink> & { text?: string }
) {
  const { text, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      text: (v) => v ?? "Next",
      class: undefined,
      className: undefined,
    }
  )

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      class={cn("cn-pagination-next", className.value, legacyClassName.value)}
      {...rest.value}
    >
      <span class="cn-pagination-next-text hidden sm:block">{text.value}</span>
      <IconPlaceholder
        lucide="ChevronRightIcon"
        tabler="IconChevronRight"
        hugeicons="ArrowRight01Icon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        data-icon="inline-end"
        class="cn-rtl-flip"
      />
    </PaginationLink>
  )
}

function PaginationEllipsis(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      class={cn(
        "cn-pagination-ellipsis flex items-center justify-center",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    >
      <IconPlaceholder
        lucide="MoreHorizontalIcon"
        tabler="IconDots"
        hugeicons="MoreHorizontalCircle01Icon"
        phosphor="DotsThreeIcon"
        remixicon="RiMoreLine"
      />
      <span class="sr-only">More pages</span>
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
