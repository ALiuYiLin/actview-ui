// L1 原语 smoke 测试：断言关键 DOM 契约（最终由 React golden 对比兜底）
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
  it("Checkbox：button + data-checked，Indicator 选中才挂载", async () => {
    function App() {
      return <Checkbox.Root>c</Checkbox.Root>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.getAttribute("type")).toBe("button")
    expect(btn.hasAttribute("data-checked")).toBe(false)
    expect(container.querySelector("[data-slot=checkbox-indicator]")).toBeNull()
    fireEvent(btn, "click")
    // 点击后选中：data-checked + Indicator 挂载
    await new Promise((r) => setTimeout(r, 0))
    expect(btn.hasAttribute("data-checked")).toBe(true)
  })

  it("Switch：data-unchecked ↔ data-checked", async () => {
    function App() {
      return <Switch.Root />
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.hasAttribute("data-unchecked")).toBe(true)
    fireEvent(btn, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(btn.hasAttribute("data-checked")).toBe(true)
    expect(btn.hasAttribute("data-unchecked")).toBe(false)
  })

  it("Progress：status → data-* 映射 + Indicator 内联 width", () => {
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
    const root = container.firstElementChild as HTMLElement
    expect(root.hasAttribute("data-progressing")).toBe(true)
    const indicator = container.querySelector(
      '[data-testid="indicator"]'
    ) as HTMLElement
    expect(indicator.style.width).toBe("50%")
  })

  it("Slider：结构 + data-horizontal + thumb 数量", () => {
    function App() {
      return (
        <Slider.Root defaultValue={[0, 100]}>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb data-slot="thumb" />
          </Slider.Control>
        </Slider.Root>
      )
    }
    const { container } = render(App)
    const root = container.firstElementChild as HTMLElement
    expect(root.hasAttribute("data-horizontal")).toBe(true)
    expect(container.querySelectorAll('[data-slot="thumb"]').length).toBe(1)
  })

  it("RadioGroup：value 归属 + aria-checked + 选中挂 Indicator", async () => {
    function App() {
      return (
        <RadioGroup defaultValue="a">
          <Radio.Root value="a">A</Radio.Root>
          <Radio.Root value="b">B</Radio.Root>
        </RadioGroup>
      )
    }
    const { container } = render(App)
    const [a, b] = Array.from(container.querySelectorAll("button"))
    expect(a.getAttribute("aria-checked")).toBe("true")
    expect(b.getAttribute("aria-checked")).toBe("false")
    expect(a.hasAttribute("data-checked")).toBe(true)
    fireEvent(b, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(b.getAttribute("aria-checked")).toBe("true")
    expect(a.getAttribute("aria-checked")).toBe("false")
  })

  it("Toggle：aria-pressed + data-pressed 切换", async () => {
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

  it("ToggleGroup + Toggle：组 value 归属", async () => {
    function App() {
      return (
        <ToggleGroup defaultValue={[]}>
          <Toggle value="a">A</Toggle>
          <Toggle value="b">B</Toggle>
        </ToggleGroup>
      )
    }
    const { container } = render(App)
    const [a, b] = Array.from(container.querySelectorAll("button"))
    expect(a.getAttribute("aria-pressed")).toBe("false")
    fireEvent(a, "click")
    await new Promise((r) => setTimeout(r, 0))
    expect(a.getAttribute("aria-pressed")).toBe("true")
    expect(b.getAttribute("aria-pressed")).toBe("false")
  })

  it("Input：<input> 透传 + value 受控", () => {
    function App() {
      return <Input value="hello" />
    }
    const { container } = render(App)
    const input = container.querySelector("input")!
    expect(input.value).toBe("hello")
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
