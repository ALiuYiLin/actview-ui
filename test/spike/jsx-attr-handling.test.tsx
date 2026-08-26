// spike：验证 toRefs + JSX 属性自动解包 Ref 的规范写法（用户纠正后的新范式）
// 假设：jsxFactory unwrapProps 对顶层 props 中所有 Ref（isRef && !__av_raw）
// 自动取 .value —— 包括直接属性与 spread 进来的。
import { describe, expect, it } from "vitest"
import { computed, ref, toRefs } from "@actview/core"
import { render } from "@actview/testing"

describe("toRefs + JSX 自动解包 Ref", () => {
  it("直接属性传 Ref：className={ref} 自动解包", () => {
    const cls = ref("foo bar")
    function App() {
      return <div className={cls} data-testid="a" />
    }
    const { container } = render(App)
    const el = container.querySelector("[data-testid=a]") as HTMLElement
    expect(el.getAttribute("class")).toBe("foo bar")
  })

  it("computed Ref 自动解包", () => {
    const size = ref("sm")
    function App() {
      const cls = computed(() => `sz-${size.value}`)
      return <div className={cls} data-testid="b" />
    }
    const { container } = render(App)
    const el = container.querySelector("[data-testid=b]") as HTMLElement
    expect(el.getAttribute("class")).toBe("sz-sm")
  })

  it("spread 透传 Ref：{...rest} 中 Ref 自动解包", () => {
    const { a, b } = toRefs({ a: "1", b: "2" })
    function App() {
      return <div {...{ a, b, "data-testid": "c" }} />
    }
    const { container } = render(App)
    const el = container.querySelector("[data-testid=c]") as HTMLElement
    expect(el.getAttribute("a")).toBe("1")
    expect(el.getAttribute("b")).toBe("2")
  })

  it("事件属性传 Ref 自动解包（rest 里的事件）", () => {
    let fired = 0
    const onClick = ref(() => fired++)
    function App() {
      return <button data-testid="d" onClick={onClick} />
    }
    const { container } = render(App)
    ;(container.querySelector("[data-testid=d]") as HTMLElement).click()
    expect(fired).toBe(1)
  })

  it("toRefs 解构 className 后 spread 的 rest 不含 className", () => {
    function App(props: Record<string, unknown>) {
      const { class: cls, className, ...rest } = toRefs(props)
      void cls
      void className
      return <div data-testid="e" data-has-class={String("class" in rest)} data-has-cn={String("className" in rest)} {...rest} />
    }
    const { container } = render(App)
    const el = container.querySelector("[data-testid=e]") as HTMLElement
    expect(el.getAttribute("data-has-class")).toBe("false")
    expect(el.getAttribute("data-has-cn")).toBe("false")
  })
})
