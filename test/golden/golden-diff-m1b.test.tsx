// golden DOM 一致性对比：M1 剩余（badge/button-group/marker/bubble/item/
// attachment/breadcrumb）actview vs React 参考。
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, render } from "@actview/testing"

import { Badge } from "@/registry/bases/base/ui/badge"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/bases/base/ui/button-group"
import { Button } from "@/registry/bases/base/ui/button"
import { Marker, MarkerContent, MarkerIcon } from "@/registry/bases/base/ui/marker"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/bases/base/ui/bubble"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/registry/bases/base/ui/item"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/bases/base/ui/attachment"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/bases/base/ui/breadcrumb"
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
  expect(serializeNormalizedBody()).toBe(readGolden(name))
}

afterEach(() => {
  cleanup()
  for (const el of Array.from(
    document.body.querySelectorAll("[data-base-ui-portal]")
  )) {
    el.remove()
  }
})

describe("golden diff：M1 剩余 actview vs React", () => {
  it("badge.default", () => {
    function App() {
      return <Badge>New</Badge>
    }
    render(App)
    expectGolden("m1b.badge.default")
  })

  it("badge.variant-outline", () => {
    function App() {
      return (
        <Badge variant="outline" className="custom">
          Outline
        </Badge>
      )
    }
    render(App)
    expectGolden("m1b.badge.outline")
  })

  it("button-group.horizontal", () => {
    function App() {
      return (
        <ButtonGroup>
          <Button>Left</Button>
          <Button>Center</Button>
          <ButtonGroupSeparator />
          <Button>Right</Button>
          <ButtonGroupText>Hint</ButtonGroupText>
        </ButtonGroup>
      )
    }
    render(App)
    expectGolden("m1b.button-group.horizontal")
  })

  it("button-group.vertical", () => {
    function App() {
      return (
        <ButtonGroup orientation="vertical">
          <Button>Top</Button>
          <Button>Bottom</Button>
        </ButtonGroup>
      )
    }
    render(App)
    expectGolden("m1b.button-group.vertical")
  })

  it("marker.default", () => {
    function App() {
      return (
        <Marker>
          <MarkerIcon aria-hidden="true">✦</MarkerIcon>
          <MarkerContent>Marker label</MarkerContent>
        </Marker>
      )
    }
    render(App)
    expectGolden("m1b.marker.default")
  })

  it("marker.variant-separator", () => {
    function App() {
      return (
        <Marker variant="separator">
          <MarkerContent>Separated</MarkerContent>
        </Marker>
      )
    }
    render(App)
    expectGolden("m1b.marker.separator")
  })

  it("bubble.default", () => {
    function App() {
      return (
        <BubbleGroup>
          <Bubble>
            <BubbleContent>Hello from bubble</BubbleContent>
          </Bubble>
          <Bubble variant="muted" align="end">
            <BubbleContent>Muted right</BubbleContent>
          </Bubble>
        </BubbleGroup>
      )
    }
    render(App)
    expectGolden("m1b.bubble.default")
  })

  it("bubble.reactions", () => {
    function App() {
      return (
        <Bubble>
          <BubbleContent>With reactions</BubbleContent>
          <BubbleReactions side="top" align="start">
            <span>👍</span>
          </BubbleReactions>
        </Bubble>
      )
    }
    render(App)
    expectGolden("m1b.bubble.reactions")
  })

  it("item.default", () => {
    function App() {
      return (
        <ItemGroup>
          <Item>
            <ItemMedia variant="icon">📄</ItemMedia>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>Design file</ItemTitle>
                <ItemActions>
                  <AttachmentAction>Download</AttachmentAction>
                </ItemActions>
              </ItemHeader>
              <ItemDescription>2.4 MB · updated 2h ago</ItemDescription>
              <ItemFooter>Footer note</ItemFooter>
            </ItemContent>
          </Item>
          <Item variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>Second item</ItemTitle>
            </ItemContent>
          </Item>
        </ItemGroup>
      )
    }
    render(App)
    expectGolden("m1b.item.default")
  })

  it("attachment.default", () => {
    function App() {
      return (
        <AttachmentGroup>
          <Attachment>
            <AttachmentMedia variant="icon">📎</AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Report.pdf</AttachmentTitle>
              <AttachmentDescription>128 KB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction>Open</AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment variant="outline">
            <AttachmentContent>
              <AttachmentTitle>Notes</AttachmentTitle>
            </AttachmentContent>
            <AttachmentTrigger>
              <AttachmentAction>View</AttachmentAction>
            </AttachmentTrigger>
          </Attachment>
        </AttachmentGroup>
      )
    }
    render(App)
    expectGolden("m1b.attachment.default")
  })

  it("breadcrumb.default", () => {
    function App() {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Getting started</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }
    render(App)
    expectGolden("m1b.breadcrumb.default")
  })

  it("breadcrumb.ellipsis", () => {
    function App() {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }
    render(App)
    expectGolden("m1b.breadcrumb.ellipsis")
  })
})
