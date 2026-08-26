// 复刻 shadcn/ui registry/bases/base/ui/table.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref
import { type HTMLAttributes, type TableHTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Table(props: TableHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const tableClassName = computed(() =>
    cn("cn-table", className?.value, legacyClassName?.value)
  )

  return (
    <div data-slot="table-container" className="cn-table-container">
      <table data-slot="table" className={tableClassName} {...rest} />
    </div>
  )
}

function TableHeader(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const headerClassName = computed(() =>
    cn("cn-table-header", className?.value, legacyClassName?.value)
  )

  return <thead data-slot="table-header" className={headerClassName} {...rest} />
}

function TableBody(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const bodyClassName = computed(() =>
    cn("cn-table-body", className?.value, legacyClassName?.value)
  )

  return <tbody data-slot="table-body" className={bodyClassName} {...rest} />
}

function TableFooter(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const footerClassName = computed(() =>
    cn("cn-table-footer", className?.value, legacyClassName?.value)
  )

  return <tfoot data-slot="table-footer" className={footerClassName} {...rest} />
}

function TableRow(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const rowClassName = computed(() =>
    cn("cn-table-row has-aria-expanded:bg-muted/50", className?.value, legacyClassName?.value)
  )

  return <tr data-slot="table-row" className={rowClassName} {...rest} />
}

function TableHead(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const headClassName = computed(() =>
    cn("cn-table-head", className?.value, legacyClassName?.value)
  )

  return <th data-slot="table-head" className={headClassName} {...rest} />
}

function TableCell(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const cellClassName = computed(() =>
    cn("cn-table-cell", className?.value, legacyClassName?.value)
  )

  return <td data-slot="table-cell" className={cellClassName} {...rest} />
}

function TableCaption(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const captionClassName = computed(() =>
    cn("cn-table-caption", className?.value, legacyClassName?.value)
  )

  return (
    <caption data-slot="table-caption" className={captionClassName} {...rest} />
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
