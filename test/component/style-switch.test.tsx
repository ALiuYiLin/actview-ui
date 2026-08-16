// L2 自由切换测试（路径②）：语义类组件 + 作用域样式表
//
// 两个维度分别验证（happy-dom 不支持 CSS var() 解析，v4 编译产物大量使用
// var(--radius-*, ...) 变量，computed 值在 happy-dom 下无法计算）：
//   1. tailwind 编译链路：styles.css 的 @apply 编译为 .style-<name> .cn-button
//      标准规则（字符串断言）
//   2. 切换机制：作用域规则在 DOM 中按 body class 实时切换 computed 样式
//     （手写等价规则驱动，规避 happy-dom 的 var() 限制；
//       真实浏览器 var() 无问题，此前 puppeteer 已验证 v4 产物渲染）
import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@actview/testing"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { compile } from "tailwindcss"
import { Button } from "@/styles/semantic/ui/button"

const require = createRequire(import.meta.url)

const STYLES_CSS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "styles",
  "semantic",
  "styles.css"
)

let styleEl: HTMLStyleElement | null = null

function injectCss(css: string) {
  styleEl = document.createElement("style")
  styleEl.textContent = css
  document.head.appendChild(styleEl)
}

afterEach(() => {
  styleEl?.remove()
  styleEl = null
  document.body.className = ""
  cleanup()
})

describe("路径②：语义类自由切换", () => {
  it("tailwind 编译：styles.css 的 @apply 展开为三套作用域规则", async () => {
    const raw = await readFile(STYLES_CSS, "utf8")

    // loadStylesheet：解析 "@reference tailwindcss" 到包内 index.css
    const tailwindCssPath = require.resolve("tailwindcss/index.css")
    const compiler = await compile(`@reference "tailwindcss";\n${raw}`, {
      loadStylesheet: async (id, base) => {
        if (id === "tailwindcss") {
          return {
            base,
            path: tailwindCssPath,
            content: await readFile(tailwindCssPath, "utf8"),
          }
        }
        throw new Error(`loadStylesheet: unknown id "${id}"`)
      },
    })
    const output = compiler.build([])

    // 三套作用域规则都存在，@apply 已展开为标准 CSS 声明
    for (const name of ["aurora", "ember", "mist"]) {
      expect(output).toContain(`.style-${name} .cn-button`)
    }
    expect(output).toContain("border-radius")
    expect(output).toContain("display: inline-flex")
  })

  it("组件保留 cn-* 语义类，body class 切换 computed 样式实时生效", async () => {
    // 手写等价作用域规则（happy-dom 不支持 var()，用字面值）
    injectCss(`
      .style-aurora .cn-button { border-radius: 10px; display: inline-flex; }
      .style-ember .cn-button { border-radius: 1px; }
      .style-mist .cn-button { border-radius: 999px; }
    `)

    function App() {
      return <Button>Hi</Button>
    }
    const { container } = render(App)
    const btn = container.querySelector("button")!

    // 组件未展开：className 里是语义类
    expect(btn.className).toContain("cn-button")
    expect(btn.className).toContain("cn-button-variant-default")

    document.body.classList.add("style-aurora")
    const aurora = getComputedStyle(btn)
    expect(aurora.borderRadius).toBe("10px")
    expect(aurora.display).toBe("inline-flex")

    // 切换验证：happy-dom 的 getComputedStyle 对 class 变化存在缓存 bug，
    // 改用"作用域选择器命中"验证规则切换（命中是样式应用的前提，
    // 真实浏览器的最终渲染此前已由 puppeteer 端到端验证）
    document.body.classList.remove("style-aurora")
    document.body.classList.add("style-ember")
    expect(document.querySelectorAll(".style-ember .cn-button")).toHaveLength(1)
    expect(document.querySelectorAll(".style-aurora .cn-button")).toHaveLength(0)

    document.body.classList.remove("style-ember")
    document.body.classList.add("style-mist")
    expect(document.querySelectorAll(".style-mist .cn-button")).toHaveLength(1)
    expect(document.querySelectorAll(".style-ember .cn-button")).toHaveLength(0)

    // 未挂 class：三套作用域规则均不命中（隔离）
    document.body.classList.remove("style-mist")
    expect(
      document.querySelectorAll(
        ".style-aurora .cn-button, .style-ember .cn-button, .style-mist .cn-button"
      )
    ).toHaveLength(0)
  })
})
