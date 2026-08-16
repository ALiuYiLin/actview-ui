// L0a（无行为依赖组件）React 参考 golden 采集（docs/MIGRATION.md §5.2 第一批 14 组件）。
// 运行：pnpm test:react-ref（独立配置 vitest.react.config.ts）。
// 采集用例与 test/golden/golden-diff-l0a.test.tsx 逐字对应（props/children 相同）。
import { afterEach, describe, it } from "vitest"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Alert, AlertDescription, AlertTitle } from "@/registry/bases/base/ui/alert"
import { AspectRatio } from "@/registry/bases/base/ui/aspect-ratio"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/bases/base/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/bases/base/ui/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/registry/bases/base/ui/field"
import { Kbd, KbdGroup } from "@/registry/bases/base/ui/kbd"
import { Label } from "@/registry/bases/base/ui/label"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/bases/base/ui/message"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/bases/base/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/bases/base/ui/pagination"
import { Skeleton } from "@/registry/bases/base/ui/skeleton"
import { Spinner } from "@/registry/bases/base/ui/spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/bases/base/ui/table"
import { Textarea } from "@/registry/bases/base/ui/textarea"

import { serializeNormalizedBody } from "../../golden-normalize"
import { cleanupReact, renderReact } from "../render"

const GOLDEN_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "golden"
)

function capture(name: string): void {
  const html = serializeNormalizedBody()
  mkdirSync(GOLDEN_DIR, { recursive: true })
  writeFileSync(path.join(GOLDEN_DIR, `${name}.html`), html, "utf8")
}

afterEach(cleanupReact)

describe("golden capture（React 参考，L0a 无行为依赖组件）", () => {
  it("captures l0a.alert.default", () => {
    renderReact(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>
    )
    capture("l0a.alert.default")
  })

  it("captures l0a.alert.destructive", () => {
    renderReact(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Request failed</AlertDescription>
      </Alert>
    )
    capture("l0a.alert.destructive")
  })

  it("captures l0a.aspect-ratio.default", () => {
    renderReact(<AspectRatio ratio={16 / 9}>16:9</AspectRatio>)
    capture("l0a.aspect-ratio.default")
  })

  it("captures l0a.card.default", () => {
    renderReact(
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    capture("l0a.card.default")
  })

  it("captures l0a.empty.default", () => {
    renderReact(
      <Empty>
        <EmptyMedia />
        <EmptyTitle>Nothing here</EmptyTitle>
        <EmptyDescription>Try again later</EmptyDescription>
      </Empty>
    )
    capture("l0a.empty.default")
  })

  it("captures l0a.empty.icon", () => {
    renderReact(<EmptyMedia variant="icon" />)
    capture("l0a.empty.icon")
  })

  it("captures l0a.field.default", () => {
    renderReact(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldDescription>Enter your email</FieldDescription>
      </Field>
    )
    capture("l0a.field.default")
  })

  it("captures l0a.field.horizontal", () => {
    renderReact(
      <Field orientation="horizontal">
        <FieldLabel>Email</FieldLabel>
        <FieldContent>
          <FieldTitle>Email address</FieldTitle>
        </FieldContent>
      </Field>
    )
    capture("l0a.field.horizontal")
  })

  it("captures l0a.field.separator", () => {
    renderReact(
      <Field>
        <FieldSeparator>or</FieldSeparator>
      </Field>
    )
    capture("l0a.field.separator")
  })

  it("captures l0a.field.error", () => {
    renderReact(
      <Field>
        <FieldLabel>Password</FieldLabel>
        <FieldError errors={[{ message: "Required" }]} />
      </Field>
    )
    capture("l0a.field.error")
  })

  it("captures l0a.field.error-multi", () => {
    renderReact(
      <Field>
        <FieldLabel>Password</FieldLabel>
        <FieldError
          errors={[{ message: "Too short" }, { message: "Needs a number" }]}
        />
      </Field>
    )
    capture("l0a.field.error-multi")
  })

  it("captures l0a.kbd.default", () => {
    renderReact(<Kbd>Ctrl</Kbd>)
    capture("l0a.kbd.default")
  })

  it("captures l0a.kbd.group", () => {
    renderReact(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    )
    capture("l0a.kbd.group")
  })

  it("captures l0a.label.default", () => {
    renderReact(<Label htmlFor="email">Email</Label>)
    capture("l0a.label.default")
  })

  it("captures l0a.message.default", () => {
    renderReact(
      <MessageGroup>
        <Message>
          <MessageAvatar />
          <MessageContent>
            <MessageHeader>Sender</MessageHeader>
            Hello
            <MessageFooter>12:00</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    )
    capture("l0a.message.default")
  })

  it("captures l0a.message.end", () => {
    renderReact(
      <MessageGroup>
        <Message align="end">
          <MessageAvatar />
          <MessageContent>Hi there</MessageContent>
        </Message>
      </MessageGroup>
    )
    capture("l0a.message.end")
  })

  it("captures l0a.native-select.default", () => {
    renderReact(
      <NativeSelect>
        <NativeSelectOption value="a">Option A</NativeSelectOption>
        <NativeSelectOptGroup label="Group">
          <NativeSelectOption value="b">Option B</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    )
    capture("l0a.native-select.default")
  })

  it("captures l0a.pagination.default", () => {
    renderReact(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
    capture("l0a.pagination.default")
  })

  it("captures l0a.skeleton.default", () => {
    renderReact(<Skeleton />)
    capture("l0a.skeleton.default")
  })

  it("captures l0a.spinner.default", () => {
    renderReact(<Spinner />)
    capture("l0a.spinner.default")
  })

  it("captures l0a.table.default", () => {
    renderReact(
      <Table>
        <TableCaption>Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    capture("l0a.table.default")
  })

  it("captures l0a.textarea.default", () => {
    renderReact(<Textarea placeholder="Type here" />)
    capture("l0a.textarea.default")
  })
})
