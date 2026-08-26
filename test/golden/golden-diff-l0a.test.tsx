// golden DOM 一致性对比（L0a 无行为依赖组件，docs/MIGRATION.md §5.2 第一批 14 组件）：
// 渲染 actview 版 registry 组件 → 与 React 参考 harness 采集的 golden 逐字节 diff。
// 采集用例与 test/fixtures/react-reference/tests/golden-capture-l0a.test.tsx 逐字对应。
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, render } from "@actview/testing"

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
import { serializeNormalizedBody } from "../fixtures/golden-normalize"

const GOLDEN_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
  "golden"
)

function readGolden(name: string): string {
  return readFileSync(path.join(GOLDEN_DIR, `${name}.html`), "utf8").trim()
}

function expectGolden(name: string): void {
  const actual = serializeNormalizedBody()
  expect(actual).toBe(readGolden(name))
}

afterEach(() => {
  cleanup()
  // Teleport/Portal 挂到 body 的浮层容器不受 testing cleanup 管理，手动清理
  for (const el of Array.from(
    document.body.querySelectorAll("[data-base-ui-portal]")
  )) {
    el.remove()
  }
})

describe("golden diff：L0a actview registry 组件 vs React 参考", () => {
  it("l0a.alert.default", () => {
    function App() {
      return (
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Something happened</AlertDescription>
        </Alert>
      )
    }
    render(App)
    expectGolden("l0a.alert.default")
  })

  it("l0a.alert.destructive", () => {
    function App() {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Request failed</AlertDescription>
        </Alert>
      )
    }
    render(App)
    expectGolden("l0a.alert.destructive")
  })

  it("l0a.aspect-ratio.default", () => {
    function App() {
      return <AspectRatio ratio={16 / 9}>16:9</AspectRatio>
    }
    render(App)
    expectGolden("l0a.aspect-ratio.default")
  })

  it("l0a.card.default", () => {
    function App() {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
    }
    render(App)
    expectGolden("l0a.card.default")
  })

  it("l0a.empty.default", () => {
    function App() {
      return (
        <Empty>
          <EmptyMedia />
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>Try again later</EmptyDescription>
        </Empty>
      )
    }
    render(App)
    expectGolden("l0a.empty.default")
  })

  it("l0a.empty.icon", () => {
    function App() {
      return <EmptyMedia variant="icon" />
    }
    render(App)
    expectGolden("l0a.empty.icon")
  })

  it("l0a.field.default", () => {
    function App() {
      return (
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldDescription>Enter your email</FieldDescription>
        </Field>
      )
    }
    render(App)
    expectGolden("l0a.field.default")
  })

  it("l0a.field.horizontal", () => {
    function App() {
      return (
        <Field orientation="horizontal">
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <FieldTitle>Email address</FieldTitle>
          </FieldContent>
        </Field>
      )
    }
    render(App)
    expectGolden("l0a.field.horizontal")
  })

  it("l0a.field.separator", () => {
    function App() {
      return (
        <Field>
          <FieldSeparator>or</FieldSeparator>
        </Field>
      )
    }
    render(App)
    expectGolden("l0a.field.separator")
  })

  it("l0a.field.error", () => {
    function App() {
      return (
        <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldError errors={[{ message: "Required" }]} />
        </Field>
      )
    }
    render(App)
    expectGolden("l0a.field.error")
  })

  it("l0a.field.error-multi", () => {
    function App() {
      return (
        <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldError
            errors={[{ message: "Too short" }, { message: "Needs a number" }]}
          />
        </Field>
      )
    }
    render(App)
    expectGolden("l0a.field.error-multi")
  })

  it("l0a.kbd.default", () => {
    function App() {
      return <Kbd>Ctrl</Kbd>
    }
    render(App)
    expectGolden("l0a.kbd.default")
  })

  it("l0a.kbd.group", () => {
    function App() {
      return (
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      )
    }
    render(App)
    expectGolden("l0a.kbd.group")
  })

  it("l0a.label.default", () => {
    function App() {
      return <Label htmlFor="email">Email</Label>
    }
    render(App)
    expectGolden("l0a.label.default")
  })

  it("l0a.message.default", () => {
    function App() {
      return (
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
    }
    render(App)
    expectGolden("l0a.message.default")
  })

  it("l0a.message.end", () => {
    function App() {
      return (
        <MessageGroup>
          <Message align="end">
            <MessageAvatar />
            <MessageContent>Hi there</MessageContent>
          </Message>
        </MessageGroup>
      )
    }
    render(App)
    expectGolden("l0a.message.end")
  })

  it("l0a.native-select.default", () => {
    function App() {
      return (
        <NativeSelect>
          <NativeSelectOption value="a">Option A</NativeSelectOption>
          <NativeSelectOptGroup label="Group">
            <NativeSelectOption value="b">Option B</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      )
    }
    render(App)
    expectGolden("l0a.native-select.default")
  })

  it("l0a.pagination.default", () => {
    function App() {
      return (
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
    }
    render(App)
    expectGolden("l0a.pagination.default")
  })

  it("l0a.skeleton.default", () => {
    function App() {
      return <Skeleton />
    }
    render(App)
    expectGolden("l0a.skeleton.default")
  })

  it("l0a.spinner.default", () => {
    function App() {
      return <Spinner />
    }
    render(App)
    expectGolden("l0a.spinner.default")
  })

  it("l0a.table.default", () => {
    function App() {
      return (
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
    }
    render(App)
    expectGolden("l0a.table.default")
  })

  it("l0a.textarea.default", () => {
    function App() {
      return <Textarea placeholder="Type here" />
    }
    render(App)
    expectGolden("l0a.textarea.default")
  })
})
