// @actview/base-ui 原语 smoke 测试：断言与 Base UI 1.6.0 一致的 DOM 契约
// （最终由 React golden 对比兜底，这里先锁定读源码得出的精确属性集）。
import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@actview/testing"
import { Button } from "@actview/base-ui/button"
import { Separator } from "@actview/base-ui/separator"

afterEach(cleanup)

describe("base-ui Button（Base UI 1.6.0 DOM 契约）", () => {
  it("默认：<button type=button tabindex=0>，无 data-disabled", () => {
    function App() {
      return <Button>Hi</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.getAttribute("type")).toBe("button")
    expect(btn.getAttribute("tabindex")).toBe("0")
    expect(btn.hasAttribute("disabled")).toBe(false)
    expect(btn.hasAttribute("data-disabled")).toBe(false)
    expect(btn.textContent).toBe("Hi")
  })

  it("disabled：+ disabled + data-disabled=\"\"（原生 button）", () => {
    function App() {
      return <Button disabled>Hi</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.hasAttribute("disabled")).toBe(true)
    expect(btn.getAttribute("data-disabled")).toBe("")
  })

  it("focusableWhenDisabled + disabled：无 disabled，aria-disabled=true + data-disabled", () => {
    function App() {
      return (
        <Button disabled focusableWhenDisabled>
          Hi
        </Button>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.hasAttribute("disabled")).toBe(false)
    expect(btn.getAttribute("aria-disabled")).toBe("true")
    expect(btn.getAttribute("data-disabled")).toBe("")
  })

  it("nativeButton=false：role=button；disabled 时 tabindex=-1", () => {
    function App() {
      return (
        <Button nativeButton={false} disabled>
          Hi
        </Button>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("[role=button]")!
    expect(btn.getAttribute("tabindex")).toBe("-1")
    expect(btn.getAttribute("aria-disabled")).toBe("true")
  })

  it("disabled 拦截 onClick（Base UI 行为）", () => {
    let clicked = false
    function App() {
      return (
        <Button disabled onClick={() => (clicked = true)}>
          Hi
        </Button>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    btn.click()
    expect(clicked).toBe(false)
  })

  it("render prop：渲染自定义元素并合并 props", () => {
    function App() {
      return (
        <Button render={<a class="custom" />} disabled>
          Link
        </Button>
      )
    }
    const { container } = render(App)
    const a = container.querySelector("a")!
    expect(a.className).toBe("custom")
    expect(a.getAttribute("data-disabled")).toBe("")
    expect(a.textContent).toBe("Link")
  })
})

describe("base-ui Separator（Base UI 1.6.0 DOM 契约）", () => {
  it("默认：<div role=separator aria-orientation=horizontal data-orientation=horizontal>", () => {
    function App() {
      return <Separator />
    }
    const { container } = render(App)
    const el = container.querySelector("div")!
    expect(el.getAttribute("role")).toBe("separator")
    expect(el.getAttribute("aria-orientation")).toBe("horizontal")
    expect(el.getAttribute("data-orientation")).toBe("horizontal")
  })

  it("orientation=vertical 透传三处属性", () => {
    function App() {
      return <Separator orientation="vertical" />
    }
    const { container } = render(App)
    const el = container.querySelector("div")!
    expect(el.getAttribute("aria-orientation")).toBe("vertical")
    expect(el.getAttribute("data-orientation")).toBe("vertical")
  })
})
