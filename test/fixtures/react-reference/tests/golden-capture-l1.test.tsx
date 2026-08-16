// React 参考 golden 采集：L1 表单组件（受控状态覆盖 checked/pressed/value 等，
// 交互行为态由原语级测试覆盖）。运行：pnpm test:react-ref
import { afterEach, describe, it } from "vitest"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Checkbox } from "@/registry/bases/base/ui/checkbox"
import { DirectionProvider } from "@/registry/bases/base/ui/direction"
import { Input } from "@/registry/bases/base/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/bases/base/ui/input-group"
import { Progress } from "@/registry/bases/base/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/registry/bases/base/ui/radio-group"
import { Slider } from "@/registry/bases/base/ui/slider"
import { Switch } from "@/registry/bases/base/ui/switch"
import { Toggle } from "@/registry/bases/base/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/registry/bases/base/ui/toggle-group"

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

describe("golden capture：L1 表单组件（React 参考）", () => {
  it("input.default", () => {
    renderReact(<Input placeholder="Email" />)
    capture("l1a.input.default")
  })

  it("input.type + className", () => {
    renderReact(<Input type="password" className="custom" />)
    capture("l1a.input.type")
  })

  it("switch.unchecked / switch.checked", () => {
    renderReact(<Switch />)
    capture("l1a.switch.unchecked")
    cleanupReact()
    renderReact(<Switch checked />)
    capture("l1a.switch.checked")
  })

  it("progress.indeterminate / progress.value", () => {
    renderReact(<Progress />)
    capture("l1a.progress.indeterminate")
    cleanupReact()
    renderReact(<Progress value={40} />)
    capture("l1a.progress.value")
  })

  it("toggle.off / toggle.on / toggle.outline", () => {
    renderReact(<Toggle>B</Toggle>)
    capture("l1a.toggle.off")
    cleanupReact()
    renderReact(<Toggle pressed>B</Toggle>)
    capture("l1a.toggle.on")
    cleanupReact()
    renderReact(
      <Toggle variant="outline" size="lg">
        B
      </Toggle>
    )
    capture("l1a.toggle.outline")
  })

  it("toggle-group.default", () => {
    renderReact(
      <ToggleGroup defaultValue={["a"]}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    capture("l1a.toggle-group.default")
  })

  it("radio-group.default", () => {
    renderReact(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" />
        <RadioGroupItem value="b" />
      </RadioGroup>
    )
    capture("l1a.radio-group.default")
  })

  it("slider.default（双 thumb）", () => {
    renderReact(<Slider defaultValue={[25, 75]} />)
    capture("l1a.slider.default")
  })

  it("checkbox.unchecked / checkbox.checked", () => {
    renderReact(<Checkbox />)
    capture("l1a.checkbox.unchecked")
    cleanupReact()
    renderReact(<Checkbox checked />)
    capture("l1a.checkbox.checked")
  })

  it("input-group.default", () => {
    renderReact(
      <InputGroup>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="user" />
      </InputGroup>
    )
    capture("l1a.input-group.default")
  })

  it("direction.default", () => {
    renderReact(
      <DirectionProvider>
        <span>hi</span>
      </DirectionProvider>
    )
    capture("l1a.direction.default")
  })
})
