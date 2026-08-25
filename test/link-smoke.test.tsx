// 冒烟测试：本地链接的 @base-ui/actview 移植库能否被 vitest 转译 + 渲染。
// 验证链路：link 协议 → vite fs.allow → deps.inline 转译源码 TS → actviewPlugin
// Babel 转换 → @actview/testing render → happy-dom DOM 断言。
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@actview/testing"
import { Button } from "@base-ui/actview/button"

afterEach(() => {
  cleanup()
})

describe("local-linked @base-ui/actview", () => {
  it("renders ported Button with correct DOM contract", () => {
    function App() {
      return (
        <Button data-slot="button" className="cn-button">
          Hello
        </Button>
      )
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn).not.toBeNull()
    expect(btn.textContent).toBe("Hello")
    expect(btn.getAttribute("data-slot")).toBe("button")
    expect(btn.getAttribute("class")).toContain("cn-button")
    expect(btn.getAttribute("type")).toBe("button")
  })

  it("renders ported Button with disabled state attribute", () => {
    function App() {
      return <Button disabled>X</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!
    expect(btn.hasAttribute("disabled")).toBe(true)
  })
})
