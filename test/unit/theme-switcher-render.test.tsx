// 回归验证：受控分组（OptionGroup 单根返回）在 actview 客户端渲染下正常输出按钮。
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@actview/testing"

import { OptionGroup } from "@/site/.vitepress/theme/components/OptionGroup"
import { FontSelects } from "@/site/.vitepress/theme/components/FontSelects"

afterEach(cleanup)

describe("受控分组客户端渲染", () => {
  it("OptionGroup options 模式渲染文本按钮", () => {
    function App() {
      return (
        <OptionGroup
          label="风格"
          value="luma"
          options={[
            { value: "luma", label: "Luma" },
            { value: "lyra", label: "Lyra" },
          ]}
          onChange={() => {}}
        />
      )
    }
    render(App)
    const buttons = document.querySelectorAll(".actview-ui-switcher-row button")
    expect(buttons.length).toBe(2)
    expect(document.querySelector(".actview-ui-switcher-row button.active")?.textContent).toBe("Luma")
  })

  it("OptionGroup items 模式渲染色块（含 square 方形）", () => {
    function App() {
      return (
        <OptionGroup
          label="基色"
          value="neutral"
          items={[
            { name: "neutral", label: "Neutral", swatch: "#000000" },
            { name: "stone", label: "Stone", swatch: "#888888" },
          ]}
          onChange={() => {}}
          square
        />
      )
    }
    render(App)
    const swatches = document.querySelectorAll(".actview-ui-switcher-swatch")
    expect(swatches.length).toBe(2)
    expect(document.querySelector(".actview-ui-switcher-swatch.active")).toBeTruthy()
  })

  it("FontSelects 单根返回渲染两个 select", () => {
    function App() {
      return (
        <FontSelects
          font="inter"
          fontHeading="inherit"
          onChange={() => {}}
        />
      )
    }
    render(App)
    const selects = document.querySelectorAll("select.actview-ui-switcher-select")
    expect(selects.length).toBe(2)
  })
})
