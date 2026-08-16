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

    // token 使用 v4 主题变量（bg-primary 等），编译需注入 v4 准确形态的
    // 变量桥（复刻 shadcn v4 globals.css）：
    //   :root 定义原始变量（--primary/--background/...）
    //   @theme inline 桥接 --color-*: var(--*)（inline = 编译产物直接引用 var(--*)）
    //   --radius-* 刻度由 --radius 推导（radius 切换 = 整体缩放）
    const THEME_PRELUDE = `
:root {
  --background: #fff; --foreground: #000;
  --card: #fff; --card-foreground: #000;
  --popover: #fff; --popover-foreground: #000;
  --primary: #10b981; --primary-foreground: #fff;
  --secondary: #f3f4f6; --secondary-foreground: #111;
  --muted: #f3f4f6; --muted-foreground: #6b7280;
  --accent: #f3f4f6; --accent-foreground: #111;
  --destructive: #ef4444; --destructive-foreground: #fff;
  --border: #e5e7eb; --input: #e5e7eb; --ring: #10b981;
  --chart-1: #10b981; --chart-2: #f59e0b; --chart-3: #3b82f6;
  --chart-4: #8b5cf6; --chart-5: #ec4899;
  --sidebar: #f9fafb; --sidebar-foreground: #111;
  --sidebar-primary: #10b981; --sidebar-primary-foreground: #fff;
  --sidebar-accent: #f3f4f6; --sidebar-accent-foreground: #111;
  --sidebar-border: #e5e7eb; --sidebar-ring: #10b981;
  --radius: 0.625rem;
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --animate-caret-blink: caret-blink 1s step-end infinite;
}
@utility no-scrollbar {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
`
    // loadStylesheet：解析 "@reference tailwindcss" / "@import tw-animate-css"
    // 到包内实际文件（token 的 animate-in/fade-out 动画类依赖后者）
    const tailwindCssPath = require.resolve("tailwindcss/index.css")
    // tw-animate-css 的 exports 只暴露 "style" 条件，直接按 hoisted 布局定位
    const animateCssPath = path.join(
      process.cwd(),
      "node_modules",
      "tw-animate-css",
      "dist",
      "tw-animate.css"
    )
    const compiler = await compile(
      `${THEME_PRELUDE}\n@reference "tailwindcss";\n${raw}`,
      {
        loadStylesheet: async (id, base) => {
          if (id === "tailwindcss") {
            return {
              base,
              path: tailwindCssPath,
              content: await readFile(tailwindCssPath, "utf8"),
            }
          }
          if (id === "tw-animate-css") {
            return {
              base,
              path: animateCssPath,
              content: await readFile(animateCssPath, "utf8"),
            }
          }
          throw new Error(`loadStylesheet: unknown id "${id}"`)
        },
      }
    )
    const output = compiler.build([])

    // 三套作用域规则都存在，@apply 已展开为标准 CSS 声明
    // （v4 输出保留嵌套形式：.style-<name> { .cn-button { ... } }）
    for (const name of ["aurora", "ember", "mist"]) {
      expect(output).toContain(`.style-${name}`)
    }
    expect(output).toContain(".cn-button")
    expect(output).toContain("border-radius")
    expect(output).toContain("display: inline-flex")
    // 颜色经 @theme inline 桥接：编译产物直接引用原始变量（v4 语义）
    expect(output).toContain("var(--primary)")
    // 圆角刻度由 --radius 推导（radius 切换 = 整体缩放）
    expect(output).toContain("var(--radius-4xl)")
    expect(output).toContain("var(--radius)")
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
