// golden DOM 一致性对比：L1 表单组件 actview vs React 参考（受控状态）。
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, render } from "@actview/testing"

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

describe("golden diff：L1 表单组件 actview vs React", () => {
  it("input.default", () => {
    function App() {
      return <Input placeholder="Email" />
    }
    render(App)
    expectGolden("l1a.input.default")
  })

  it("input.type + className", () => {
    function App() {
      return <Input type="password" className="custom" />
    }
    render(App)
    expectGolden("l1a.input.type")
  })

  it("switch.unchecked / switch.checked", () => {
    function App() {
      return <Switch />
    }
    render(App)
    expectGolden("l1a.switch.unchecked")
    cleanup()
    function AppChecked() {
      return <Switch checked />
    }
    render(AppChecked)
    expectGolden("l1a.switch.checked")
  })

  it("progress.indeterminate / progress.value", () => {
    function App() {
      return <Progress />
    }
    render(App)
    expectGolden("l1a.progress.indeterminate")
    cleanup()
    function AppValue() {
      return <Progress value={40} />
    }
    render(AppValue)
    expectGolden("l1a.progress.value")
  })

  it("toggle.off / toggle.on / toggle.outline", () => {
    function App() {
      return <Toggle>B</Toggle>
    }
    render(App)
    expectGolden("l1a.toggle.off")
    cleanup()
    function AppOn() {
      return <Toggle pressed>B</Toggle>
    }
    render(AppOn)
    expectGolden("l1a.toggle.on")
    cleanup()
    function AppOutline() {
      return (
        <Toggle variant="outline" size="lg">
          B
        </Toggle>
      )
    }
    render(AppOutline)
    expectGolden("l1a.toggle.outline")
  })

  it("toggle-group.default", () => {
    function App() {
      return (
        <ToggleGroup defaultValue={["a"]}>
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      )
    }
    render(App)
    expectGolden("l1a.toggle-group.default")
  })

  it("radio-group.default", () => {
    function App() {
      return (
        <RadioGroup defaultValue="a">
          <RadioGroupItem value="a" />
          <RadioGroupItem value="b" />
        </RadioGroup>
      )
    }
    render(App)
    expectGolden("l1a.radio-group.default")
  })

  it("slider.default（双 thumb）", () => {
    function App() {
      return <Slider defaultValue={[25, 75]} />
    }
    render(App)
    expectGolden("l1a.slider.default")
  })

  it("checkbox.unchecked / checkbox.checked", () => {
    function App() {
      return <Checkbox />
    }
    render(App)
    expectGolden("l1a.checkbox.unchecked")
    cleanup()
    function AppChecked() {
      return <Checkbox checked />
    }
    render(AppChecked)
    expectGolden("l1a.checkbox.checked")
  })

  it("input-group.default", () => {
    function App() {
      return (
        <InputGroup>
          <InputGroupAddon>@</InputGroupAddon>
          <InputGroupInput placeholder="user" />
        </InputGroup>
      )
    }
    render(App)
    expectGolden("l1a.input-group.default")
  })

  it("direction.default", () => {
    function App() {
      return (
        <DirectionProvider>
          <span>hi</span>
        </DirectionProvider>
      )
    }
    render(App)
    expectGolden("l1a.direction.default")
  })
})
