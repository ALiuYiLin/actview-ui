// React 参考 golden 采集：M1 剩余（badge/button-group/marker/bubble/item/attachment/breadcrumb）
// 运行：pnpm test:react-ref
import { afterEach, describe, it } from "vitest"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

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

describe("golden capture：M1 剩余（React 参考）", () => {
  it("badge.default", () => {
    renderReact(<Badge>New</Badge>)
    capture("m1b.badge.default")
  })

  it("badge.variant-outline", () => {
    renderReact(
      <Badge variant="outline" className="custom">
        Outline
      </Badge>
    )
    capture("m1b.badge.outline")
  })

  it("button-group.horizontal", () => {
    renderReact(
      <ButtonGroup>
        <Button>Left</Button>
        <Button>Center</Button>
        <ButtonGroupSeparator />
        <Button>Right</Button>
        <ButtonGroupText>Hint</ButtonGroupText>
      </ButtonGroup>
    )
    capture("m1b.button-group.horizontal")
  })

  it("button-group.vertical", () => {
    renderReact(
      <ButtonGroup orientation="vertical">
        <Button>Top</Button>
        <Button>Bottom</Button>
      </ButtonGroup>
    )
    capture("m1b.button-group.vertical")
  })

  it("marker.default", () => {
    renderReact(
      <Marker>
        <MarkerIcon aria-hidden="true">✦</MarkerIcon>
        <MarkerContent>Marker label</MarkerContent>
      </Marker>
    )
    capture("m1b.marker.default")
  })

  it("marker.variant-separator", () => {
    renderReact(
      <Marker variant="separator">
        <MarkerContent>Separated</MarkerContent>
      </Marker>
    )
    capture("m1b.marker.separator")
  })

  it("bubble.default", () => {
    renderReact(
      <BubbleGroup>
        <Bubble>
          <BubbleContent>Hello from bubble</BubbleContent>
        </Bubble>
        <Bubble variant="muted" align="end">
          <BubbleContent>Muted right</BubbleContent>
        </Bubble>
      </BubbleGroup>
    )
    capture("m1b.bubble.default")
  })

  it("bubble.reactions", () => {
    renderReact(
      <Bubble>
        <BubbleContent>With reactions</BubbleContent>
        <BubbleReactions side="top" align="start">
          <span>👍</span>
        </BubbleReactions>
      </Bubble>
    )
    capture("m1b.bubble.reactions")
  })

  it("item.default", () => {
    renderReact(
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
    capture("m1b.item.default")
  })

  it("attachment.default", () => {
    renderReact(
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
    capture("m1b.attachment.default")
  })

  it("breadcrumb.default", () => {
    renderReact(
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
    capture("m1b.breadcrumb.default")
  })

  it("breadcrumb.ellipsis", () => {
    renderReact(
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
    capture("m1b.breadcrumb.ellipsis")
  })
})
