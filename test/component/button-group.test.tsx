// L2 组件测试：button-group 构建物（跨组件互引 + lucide 图标 + 依赖组合）
// 传给 render 的组件必须是函数声明（defineComponentPlugin 转换要求）。
import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@actview/testing"
import {
  ButtonGroup,
  ButtonGroupText,
  ButtonGroupSeparator,
} from "@/styles/base-aurora/ui/button-group"
import { Button } from "@/styles/base-aurora/ui/button"

afterEach(cleanup)

describe("ButtonGroup（styles/base-aurora/ui/button-group.tsx 构建物）", () => {
  it("组合渲染：组容器 + 子按钮 + separator 依赖互引", () => {
    function App() {
      return (
        <ButtonGroup>
          <Button>编辑</Button>
          <Button variant="outline">复制</Button>
        </ButtonGroup>
      )
    }
    const { container } = render(App)
    const group = container.querySelector('[data-slot="button-group"]')!
    expect(group).not.toBeNull()
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("data-orientation")).toBe("horizontal")
    expect(group.querySelectorAll("button")).toHaveLength(2)
  })

  it("ButtonGroupText 渲染 lucide 图标（@actview/core>=1.0.34 SVG 修复）", () => {
    function App() {
      return (
        <ButtonGroup>
          <ButtonGroupText>更多</ButtonGroupText>
        </ButtonGroup>
      )
    }
    const { container } = render(App)
    const text = container.querySelector('[data-slot="button-group-text"]')!
    expect(text.textContent).toContain("更多")
    // 图标：真实 <svg>（lucide class + stroke currentColor）
    const svg = text.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg!.classList.contains("lucide")).toBe(true)
    expect(svg!.getAttribute("stroke")).toBe("currentColor")
  })

  it("vertical orientation 生效", () => {
    function App() {
      return (
        <ButtonGroup orientation="vertical">
          <Button>上</Button>
        </ButtonGroup>
      )
    }
    const { container } = render(App)
    expect(
      container
        .querySelector('[data-slot="button-group"]')!
        .getAttribute("data-orientation")
    ).toBe("vertical")
  })

  it("ButtonGroupSeparator 渲染 separator 插槽标记", () => {
    function App() {
      return (
        <ButtonGroup>
          <Button>a</Button>
          <ButtonGroupSeparator />
          <Button>b</Button>
        </ButtonGroup>
      )
    }
    const { container } = render(App)
    const sep = container.querySelector('[data-slot="button-group-separator"]')!
    expect(sep).not.toBeNull()
    expect(sep.getAttribute("data-slot")).toBe("button-group-separator")
    expect(sep.getAttribute("role")).toBe("separator")
  })
})
