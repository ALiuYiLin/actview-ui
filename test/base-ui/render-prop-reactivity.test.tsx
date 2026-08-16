// 验证 mergeRenderProps 创建的组件是否丢失响应性。
// 对照：actview 组件模型 = Babel 把 function Comp(props){ return <jsx> }
// 转成 defineComponent((props) => () => jsx)，render 闭包每次重跑重建 vnode。
// 假设（用户提出）：mergeRenderProps 用 createElement 造 vnode 可能丢失响应性，
// 应改为 const Comp = render.value; return <Comp {...mergedProps} />。
// 本测试用可观测结果裁决：父状态更新后，render 目标的 props/children 是否实时到达 DOM。
import { describe, it, expect, afterEach } from "vitest"
import { render, fireEvent, waitFor, cleanup } from "@actview/testing"
import { ref } from "@actview/core"
import { Button } from "@actview/base-ui/button"

afterEach(cleanup)

function ShowCount(props: any) {
  return <span class="count">{props.count}</span>
}

function ShowChildren(props: any) {
  return <span class="children">{props.children}</span>
}

describe("mergeRenderProps 响应性验证", () => {
  it("对照组：无 render prop 的普通 button 子组件 props 更新可达", async () => {
    const count = ref(0)
    function App() {
      return (
        <div>
          <ShowCount count={count.value} />
          <button class="inc" onClick={() => (count.value += 1)}>
            +
          </button>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".count")!.textContent).toBe("0")
    fireEvent(container.querySelector(".inc")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".count")!.textContent).toBe("1")
    )
  })

  it("render=组件类型（render={ShowCount}）：mergeRenderProps 透传 props 实时更新", async () => {
    const count = ref(0)
    function App() {
      return (
        <div>
          <Button render={ShowCount} {...({ count: count.value } as any)} />
          <button class="inc" onClick={() => (count.value += 1)}>
            +
          </button>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".count")!.textContent).toBe("0")
    fireEvent(container.querySelector(".inc")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".count")!.textContent).toBe("1")
    )
  })

  it("render=vnode（render={<ShowCount />}）：克隆合并的 props 实时更新", async () => {
    const count = ref(0)
    function App() {
      return (
        <div>
          <Button render={<ShowCount />} {...({ count: count.value } as any)} />
          <button class="inc" onClick={() => (count.value += 1)}>
            +
          </button>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".count")!.textContent).toBe("0")
    fireEvent(container.querySelector(".inc")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".count")!.textContent).toBe("1")
    )
  })

  it("render=vnode + children：children 响应式更新可达 render 目标", async () => {
    const text = ref("a")
    function App() {
      return (
        <div>
          <Button render={<ShowChildren />}>{text.value}</Button>
          <button class="upd" onClick={() => (text.value = "b")}>
            upd
          </button>
        </div>
      )
    }
    const { container } = render(App)
    expect(container.querySelector(".children")!.textContent).toBe("a")
    fireEvent(container.querySelector(".upd")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".children")!.textContent).toBe("b")
    )
  })
})
