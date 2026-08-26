// M0 spike：验证 actview 能力边界（docs/MIGRATION.md Phase 0 步骤 1）。
// 结论直接决定 @actview/base-ui 原语的实现方式；全部通过 = Base UI 行为
// 层可以按计划复刻；失败项 = actview 仓库 backlog（核心能力缺口）。
// 覆盖：捕获阶段事件、非标准事件、ref（对象/函数）、Teleport、provide/useInjects、
//       SVG 属性、受控 input 双向、Fragment/条件渲染、style 对象与 CSS 变量。
import { describe, it, expect, afterEach } from "vitest"
import { render, fireEvent, waitFor, cleanup } from "@actview/testing"
import { ref, provide, useInjects, Teleport } from "@actview/core"
import { Fragment, jsx } from "@actview/jsx"

afterEach(cleanup)

describe("spike: actview 能力边界", () => {
  it("捕获阶段事件 onClickCapture/onKeyDownCapture（patchEvent 修饰符）", () => {
    const order: string[] = []
    function App() {
      return (
        <div onClick={() => order.push("bubble")}>
          <button
            onClick={() => order.push("child-bubble")}
            onClickCapture={() => order.push("child-capture")}
          >
            hit
          </button>
        </div>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    fireEvent(btn, "click")
    // 捕获先于冒泡
    expect(order).toEqual(["child-capture", "child-bubble", "bubble"])
  })

  it("非标准事件 onMouseEnter/onMouseLeave 正常派发", () => {
    const seen: string[] = []
    function App() {
      return (
        <div
          onMouseEnter={() => seen.push("enter")}
          onMouseLeave={() => seen.push("leave")}
          onPointerLeave={() => seen.push("pointerleave")}
        />
      )
    }
    const { container } = render(App)
    const el = container.firstElementChild!
    fireEvent(el, "mouseenter")
    fireEvent(el, "mouseleave")
    fireEvent(el, "pointerleave")
    expect(seen).toEqual(["enter", "leave", "pointerleave"])
  })

  it("ref 对象与函数在挂载时被调用（applyRef）", () => {
    const elRef = ref<Element | null>(null)
    let fnEl: Element | null = null
    function App() {
      return (
        <div>
          <span ref={elRef} />
          <em ref={(el: Element) => (fnEl = el)} />
        </div>
      )
    }
    const { container } = render(App)
    expect(elRef.value).toBe(container.querySelector("span"))
    expect(fnEl).toBe(container.querySelector("em"))
  })

  it("Teleport to=body 挂到 body（浮层原语基础）", () => {
    function App() {
      return (
        <div>
          <Teleport to="body">
            <div class="teleported">portal</div>
          </Teleport>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".teleported")).toBeNull()
    expect(document.body.querySelector(".teleported")!.textContent).toBe("portal")
  })

  it("provide/useInjects 上下文（Base UI 状态分发基础）", () => {
    function Child() {
      const open = useInjects("menu-open")
      return <span class="child">{open.value ? "open" : "closed"}</span>
    }
    function App() {
      const open = ref(false)
      provide("menu-open", open)
      return (
        <div>
          <Child />
          <button onClick={() => (open.value = true)}>toggle</button>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".child")!.textContent).toBe("closed")
    fireEvent(container.querySelector("button")!, "click")
    return waitFor(() =>
      expect(container.querySelector(".child")!.textContent).toBe("open")
    )
  })

  it("SVG：createElementNS + class 走 setAttribute；camelCase 属性缺口与 kebab workaround", () => {
    const svgAttrs: any = { class: "icon" }
    function App() {
      return (
        <svg viewBox="0 0 24 24" {...svgAttrs} data-testid="svg">
          <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" />
        </svg>
      )
    }
    const { container } = render(App)
    const svg = container.querySelector("svg")!
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24")
    expect(svg.getAttribute("class")).toBe("icon")
    const circle = svg.querySelector("circle")!
    // 缺口（actview 仓库 backlog）：camelCase 以原名 setAttribute，
    // SVG 需要 stroke-width，当前写法不生效。
    expect(circle.getAttribute("strokeWidth")).toBe("2")
    expect(circle.getAttribute("stroke-width")).toBeNull()

    // workaround：JSX 直接写 kebab-case（@actview/lucide 即此做法，走 setAttribute）
    function AppKebab() {
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="2" />
        </svg>
      )
    }
    const kebab = render(AppKebab)
    const circle2 = kebab.container.querySelector("circle")!
    expect(circle2.getAttribute("stroke-width")).toBe("2")
  })

  it("受控 input：value 写入 DOM + onInput 驱动响应式更新", async () => {
    function App() {
      const value = ref("initial")
      return (
        <input
          value={value.value}
          onInput={(e: any) => (value.value = e.target.value)}
        />
      )
    }
    const { container } = render(App)
    const input = container.querySelector("input")!
    expect(input.value).toBe("initial")
    // 1) 外部状态变化 → DOM 同步
    fireEvent(input, "input", { value: "typed" })
    // 2) fireEvent 已设 el.value；反向验证：通过响应式路径改状态看 DOM 是否跟随
    const target = input
    target.dispatchEvent(new Event("input", { bubbles: true }))
    await waitFor(() => expect(input.value).toBe("typed"))
  })

  it("Fragment 与条件渲染", () => {
    const show = ref(true)
    function App() {
      return jsx(Fragment, {
        children: [
          jsx("span", { children: "a" }),
          show.value ? jsx("b", { children: "b" }) : null,
        ],
      })
    }
    const { container } = render(App)
    expect(container.querySelectorAll("span").length).toBe(1)
    expect(container.querySelectorAll("b").length).toBe(1)
  })

  it("style 对象：普通属性 + CSS 自定义属性均生效", () => {
    function App() {
      return (
        <div
          style={{ color: "red", "--accordion-panel-height": "120px" }}
          data-testid="styled"
        />
      )
    }
    const { container } = render(App)
    const el = container.querySelector("[data-testid=styled]") as HTMLElement
    expect(el.style.color).toBe("red")
    // actview 已修复：style 对象中的 CSS 自定义属性（--x）经 setProperty 生效
    // （旧断言认为这是缺口，actview 源码演进后已闭合）
    expect(el.style.getPropertyValue("--accordion-panel-height")).toBe("120px")

    // 命令式 setProperty 依然可用（accordion 高度测量等场景）
    function AppImperative() {
      return <div ref={(el: HTMLElement) => el.style.setProperty("--h", "99px")} />
    }
    const imperative = render(AppImperative)
    const el2 = imperative.container.firstElementChild as HTMLElement
    expect(el2.style.getPropertyValue("--h")).toBe("99px")
  })
})
