// 临时验证：重写后的 registry button（基于 @base-ui/actview/button）DOM 与
// React golden 逐字节一致。验证通过后并入 golden-diff.test.tsx 正式用例。
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, render } from "@actview/testing"

import { Button } from "@/registry/bases/base/ui/button"
import { serializeNormalizedBody } from "../fixtures/golden-normalize"

const GOLDEN_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
  "golden"
)

function expectGolden(name: string): void {
  const golden = readFileSync(path.join(GOLDEN_DIR, `${name}.html`), "utf8").trim()
  expect(serializeNormalizedBody()).toBe(golden)
}

afterEach(() => {
  cleanup()
})

describe("port-primitive button golden", () => {
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
})
