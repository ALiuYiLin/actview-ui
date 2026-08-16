// L2 组件测试：styles 构建物（base-aurora 的 button）行为断言
// 用 @actview/testing（render/fireEvent/waitFor）驱动 actview 组件。
// 注意：传给 render 的组件必须是"函数声明"形式 —— defineComponentPlugin
// 只转换声明/赋值形态，内联箭头函数会以裸函数进入运行时（渲染失败）。
import { describe, it, expect, afterEach } from "vitest"
import { render, fireEvent, waitFor, cleanup } from "@actview/testing"
import { reactive } from "actview"
import { Button } from "@/styles/base-aurora/ui/button"

afterEach(cleanup)

describe("Button（styles/base-aurora/ui/button.tsx 构建物）", () => {
  it("渲染默认 variant/size，cn(twMerge) 合并后无冲突类", () => {
    function App() {
      return <Button>Hello</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.getAttribute("data-slot")).toBe("button")
    expect(btn.textContent).toContain("Hello")
    // variant 类 bg-emerald-500 覆盖基类 bg-emerald-500/10（twMerge 去重）
    expect(btn.className).toContain("bg-emerald-500")
    expect(btn.className).not.toContain("bg-emerald-500/10")
    // 基类与展开类不重复（inline-flex 只出现一次）
    const inlineCount = btn.className
      .split(" ")
      .filter((c) => c === "inline-flex").length
    expect(inlineCount).toBe(1)
  })

  it("class 透传与 variant 样式并存", () => {
    function App() {
      return (
        <Button variant="outline" class="my-custom">
          Hi
        </Button>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.className).toContain("my-custom")
    expect(btn.className).toContain("bg-transparent")
  })

  it("点击事件触发（actview 响应式更新）", async () => {
    // 状态文本放在父组件（真实用户用法）：组件边界的 children 更新依赖
    // 框架调度细节，父级持有的响应式文本是稳定断言对象。
    function Demo() {
      const state = reactive({ clicked: false })
      return (
        <div>
          <span class="status">{state.clicked ? "clicked" : "idle"}</span>
          <Button onClick={() => (state.clicked = true)}>click me</Button>
        </div>
      )
    }
    const { container } = render(Demo)
    fireEvent(container.querySelector("button")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".status")!.textContent).toBe("clicked")
    )
  })

  it("size 变体渲染不同类", () => {
    function App() {
      return <Button size="icon">×</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.className).toContain("size-9")
    expect(btn.className).toContain("p-0")
  })
})
