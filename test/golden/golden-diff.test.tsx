// golden DOM 一致性对比（docs/MIGRATION.md §6.2）：
// 渲染 actview 版 registry 组件 → 与 React 参考 harness 采集的 golden 逐字节 diff。
// 对比输入与 test/fixtures/react-reference/tests/golden-capture.test.tsx 完全对应。
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, render } from "@actview/testing"

import { Button } from "@/registry/bases/base/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/bases/base/ui/tooltip"
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

function TooltipApp(props: { open?: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip open={props.open}>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe("golden diff：actview registry 组件 vs React 参考", () => {
  it("button.default", () => {
    function App() {
      return <Button>Hello</Button>
    }
    render(App)
    expectGolden("button.default")
  })

  it("button.outline-lg + className", () => {
    function App() {
      return (
        <Button variant="outline" size="lg" className="extra-cls">
          Outline
        </Button>
      )
    }
    render(App)
    expectGolden("button.outline")
  })

  it("button.disabled", () => {
    function App() {
      return <Button disabled>Disabled</Button>
    }
    render(App)
    expectGolden("button.disabled")
  })

  it("tooltip.closed", () => {
    function App() {
      return <TooltipApp />
    }
    render(App)
    expectGolden("tooltip.closed")
  })

  it("tooltip.open（受控 open）", () => {
    function App() {
      return <TooltipApp open />
    }
    render(App)
    expectGolden("tooltip.open")
  })
})
