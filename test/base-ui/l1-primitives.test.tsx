// L1 原语 smoke 测试：断言关键 DOM 契约（React golden 对比兜底，见 test/golden/）
import { describe, it, expect, afterEach } from "vitest"
import { render, fireEvent, cleanup } from "@actview/testing"
import { Checkbox } from "@actview/base-ui/checkbox"
import { Switch } from "@actview/base-ui/switch"
import { Progress } from "@actview/base-ui/progress"
import { Slider } from "@actview/base-ui/slider"
import { Radio, RadioGroup } from "@actview/base-ui"
import { Toggle, ToggleGroup } from "@actview/base-ui"
import { Input } from "@actview/base-ui/input"
import { DirectionProvider } from "@actview/base-ui/direction-provider"

afterEach(cleanup)

describe("base-ui L1 原语（Base UI 1.6.0 DOM 契约）", () => {
  it("Checkbox：span[role=checkbox] + 隐藏原生 input，Indicator 选中才挂载", async () => {
    function App() {
      return <Checkbox.Root>c</Checkbox.Root>
    }
    const { container } = render(App)
    const root = container.querySelector('[role="checkbox"]')!
    expect(root.tagName).toBe("SPAN")
    expect(root.getAttribute("aria-checked")).toBe("false")
    expect(root.hasAttribute("data-unchecked")).toBe(true)
    expect(container.querySelector("input[type=checkbox]")).not.toBeNull()
    expect(container.querySelector("[data-slot=checkbox-indicator]")).toBeNull()
    fireEvent(root, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(root.hasAttribute("data-checked")).toBe(true)
    expect(
      container.querySelector("input[type=checkbox]")!.hasAttribute("checked")
    ).toBe(true)
  })

  it("Switch：span[role=switch]，data-unchecked ↔ data-checked", async () => {
    function App() {
      return <Switch.Root />
    }
    const { container } = render(App)
    const root = container.querySelector('[role="switch"]')!
    expect(root.hasAttribute("data-unchecked")).toBe(true)
    fireEvent(root, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(root.hasAttribute("data-checked")).toBe(true)
    expect(root.hasAttribute("data-unchecked")).toBe(false)
  })

  it("Progress：aria 属性 + status 映射 + Indicator 内联 width", () => {
    function App() {
      return (
        <Progress.Root value={50}>
          <Progress.Track data-testid="track">
            <Progress.Indicator data-testid="indicator" />
          </Progress.Track>
        </Progress.Root>
      )
    }
    const { container } = render(App)
    const root = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(root.getAttribute("aria-valuenow")).toBe("50")
    expect(root.getAttribute("aria-valuetext")).toBe("50%")
    expect(root.hasAttribute("data-progressing")).toBe(true)
    const indicator = container.querySelector(
      '[data-testid="indicator"]'
    ) as HTMLElement
    expect(indicator.style.width).toBe("50%")
  })

  it("Slider：role=group + data-orientation + thumb 按序 data-index + 隐藏 range input", () => {
    function App() {
      return (
        <Slider.Root defaultValue={[25, 75]}>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb data-slot="thumb" />
            <Slider.Thumb data-slot="thumb" />
          </Slider.Control>
        </Slider.Root>
      )
    }
    const { container } = render(App)
    const root = container.querySelector('[role="group"]') as HTMLElement
    expect(root.getAttribute("data-orientation")).toBe("horizontal")
    const thumbs = Array.from(container.querySelectorAll('[data-slot="thumb"]'))
    expect(thumbs[0].getAttribute("data-index")).toBe("0")
    expect(thumbs[1].getAttribute("data-index")).toBe("1")
    const inputs = Array.from(container.querySelectorAll("input[type=range]"))
    expect(inputs[0].getAttribute("value")).toBe("25")
    expect(inputs[0].getAttribute("aria-valuetext")).toBe("25 start range")
    expect(inputs[1].getAttribute("value")).toBe("75")
    expect(inputs[1].getAttribute("aria-valuetext")).toBe("75 end range")
  })

  it("RadioGroup：role=radiogroup + roving tabindex + 选中挂 Indicator", async () => {
    function App() {
      return (
        <RadioGroup defaultValue="a">
          <Radio.Root value="a">A</Radio.Root>
          <Radio.Root value="b">B</Radio.Root>
        </RadioGroup>
      )
    }
    const { container } = render(App)
    const [a, b] = Array.from(container.querySelectorAll('[role="radio"]'))
    expect(a.getAttribute("aria-checked")).toBe("true")
    expect(b.getAttribute("aria-checked")).toBe("false")
    expect(a.getAttribute("tabindex")).toBe("0")
    expect(b.getAttribute("tabindex")).toBe("-1")
    expect(a.hasAttribute("data-checked")).toBe(true)
    expect(b.hasAttribute("data-unchecked")).toBe(true)
    fireEvent(b, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(b.getAttribute("aria-checked")).toBe("true")
    expect(a.getAttribute("aria-checked")).toBe("false")
  })

  it("Toggle：button + aria-pressed + data-pressed 切换", async () => {
    function App() {
      return <Toggle>t</Toggle>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.getAttribute("aria-pressed")).toBe("false")
    fireEvent(btn, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(btn.getAttribute("aria-pressed")).toBe("true")
    expect(btn.hasAttribute("data-pressed")).toBe(true)
  })

  it("ToggleGroup + Toggle：role=group + 组 value 归属 + roving tabindex", async () => {
    function App() {
      return (
        <ToggleGroup defaultValue={[]}>
          <Toggle value="a">A</Toggle>
          <Toggle value="b">B</Toggle>
        </ToggleGroup>
      )
    }
    const { container } = render(App)
    expect(container.querySelector('[role="group"]')).not.toBeNull()
    const [a, b] = Array.from(container.querySelectorAll("button"))
    expect(a.getAttribute("aria-pressed")).toBe("false")
    expect(a.getAttribute("aria-disabled")).toBe("false")
    fireEvent(a, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(a.getAttribute("aria-pressed")).toBe("true")
    expect(a.getAttribute("tabindex")).toBe("0")
    expect(b.getAttribute("tabindex")).toBe("-1")
    expect(b.getAttribute("aria-pressed")).toBe("false")
  })

  it("Input：<input> 透传 + 自动 id + value 受控", () => {
    function App() {
      return <Input value="hello" />
    }
    const { container } = render(App)
    const input = container.querySelector("input")!
    expect(input.value).toBe("hello")
    expect(input.hasAttribute("id")).toBe(true)
  })

  it("DirectionProvider：不渲染 DOM，children 直出", () => {
    function App() {
      return (
        <DirectionProvider direction="rtl">
          <span>child</span>
        </DirectionProvider>
      )
    }
    const { container } = render(App)
    expect(container.querySelector("span")!.textContent).toBe("child")
  })
})
