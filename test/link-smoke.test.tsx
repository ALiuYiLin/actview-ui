// 冒烟测试：npm 安装的 @actview/base-ui（Base UI → actview 移植库，dist 构建产物）
// 能否被 vitest 渲染。验证链路：npm 包 → actviewPlugin Babel 转换 → @actview/testing
// render → happy-dom DOM 断言。
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@actview/testing"
import { Button } from "@actview/base-ui"

afterEach(() => {
  cleanup()
})

describe("npm @actview/base-ui", () => {
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
