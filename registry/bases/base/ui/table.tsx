// 复刻 shadcn/ui registry/bases/base/ui/table.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { HTMLAttributes, TableHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Table(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div data-slot="table-container" class="cn-table-container">
      <table
        data-slot="table"
        class={cn("cn-table", className.value, legacyClassName.value)}
        {...rest.value}
      />
    </div>
  )
}

function TableHeader(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <thead
      data-slot="table-header"
      class={cn("cn-table-header", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableBody(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <tbody
      data-slot="table-body"
      class={cn("cn-table-body", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableFooter(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <tfoot
      data-slot="table-footer"
      class={cn("cn-table-footer", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableRow(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <tr
      data-slot="table-row"
      class={cn("cn-table-row has-aria-expanded:bg-muted/50", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableHead(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <th
      data-slot="table-head"
      class={cn("cn-table-head", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableCell(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <td
      data-slot="table-cell"
      class={cn("cn-table-cell", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function TableCaption(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <caption
      data-slot="table-caption"
      class={cn("cn-table-caption", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
