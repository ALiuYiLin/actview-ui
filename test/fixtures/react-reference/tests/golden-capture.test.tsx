// React 参考 golden 采集：渲染冻结的 shadcn 源组件，归一化序列化后写入
// test/fixtures/golden/*.html（入库，作为 actview 侧的对比基线）。
// 运行：pnpm test:react-ref（独立配置 vitest.react.config.ts）
import { afterEach, describe, it } from "vitest"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Button } from "@/registry/bases/base/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/bases/base/ui/tooltip"

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

function tooltipApp(open?: boolean) {
  return (
    <TooltipProvider>
      <Tooltip open={open}>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

afterEach(cleanupReact)

describe("golden capture（React 参考，源 commit a85299a）", () => {
  it("captures button.default", () => {
    renderReact(<Button>Hello</Button>)
    capture("button.default")
  })

  it("captures button.outline-lg + className", () => {
    renderReact(
      <Button variant="outline" size="lg" className="extra-cls">
        Outline
      </Button>
    )
    capture("button.outline")
  })

  it("captures button.disabled", () => {
    renderReact(<Button disabled>Disabled</Button>)
    capture("button.disabled")
  })

  it("captures tooltip.closed", () => {
    renderReact(tooltipApp())
    capture("tooltip.closed")
  })

  it("captures tooltip.open（受控 open）", () => {
    renderReact(tooltipApp(true))
    capture("tooltip.open")
  })
})
