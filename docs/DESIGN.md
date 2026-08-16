# 设计文档：actview-ui 架构与机制

在 **button、separator、button-group 三个组件** 上复刻 shadcn/ui 的两段流水线，
组件框架层为 **actview**（`E:\code3\actview`，npm 已发布 `actview` / `@actview/jsx`，
图标库 `@actview/lucide`）。`button-group` 是"稍微复杂"的组件：跨 item 依赖
（separator）、6 个新 token、IconPlaceholder 图标占位符 —— 把依赖树解析与
transform-icons 图标替换两条机制都跑通。

> 依赖注意：`@actview/core` 需 `>=1.0.36`（SVG set property 修复 + `useProps`）。
> **pnpm 项目必须保证单一 core 实例**：`actview@1.0.29` 内部依赖 `^1.0.32`，
> pnpm 严格布局下会解析出第二个旧版 core，与组件 `useProps` 依赖的顶层版本
> 形成两套响应式系统（children 更新失效）。本仓库已用
> `pnpm-workspace.yaml` 的 `overrides` 强制 `@actview/core@1.0.36`；
> 用户项目建议同样配置。

## 框架差异（React → actview）

| | React 版（原 shadcn 复刻） | actview 版（当前） |
|---|---|---|
| 组件定义 | `function Button(props)` + `"use client"` | 普通函数组件 + `useProps`（props 响应式取值），Babel（defineComponentPlugin）自动转 defineComponent——源码层不手写 defineComponent |
| className | `className={...}` | `class={...}`（`className` 作兼容别名解构） |
| 事件 | 合成事件 `onClick` | 原生 DOM 事件 `onClick`（`@actview/jsx` 类型） |
| JSX 配置 | `jsx: react-jsx` | `jsx: react-jsx` + `jsxImportSource: "@actview/jsx"` |
| 组件类型 | `@types/react` | `import type { HTMLAttributes } from "@actview/jsx"` |
| 图标 | transform-icons 替换成 lucide 等图标库组件 + import 注入 | transform-icons 替换成 **@actview/lucide**（lucide 的 actview 适配版，defineComponent 产物）组件 + import 注入，机制与 shadcn 原版一致 |
| cva | class-variance-authority（框架无关，保留） | 同左 |

## 第一段：base × style → 两套注册表产物（构建侧）

```
registry/bases/base/registry.json（item 清单 + registryDependencies + 框架依赖）
        │
        ├─ style-aurora.css ──► styles/base-aurora/...   ← 路径①：cn-* 展开写死
        ├─ style-ember.css  ──► styles/base-ember/...       （CLI add 分发）
        ├─ style-mist.css   ──► styles/base-mist/...
        │
        └────────────────────► styles/semantic/...       ← 路径②：cn-* 保留
                                （ui/*.tsx + styles.css）  （运行时自由切换）
```

## 三条路径（对应 shadcn 的完整机制）

| 路径 | 组件形态 | 样式来源 | 能否运行时切 |
|---|---|---|---|
| ① CLI add | `cn-*` 已展开写死 | 组件 className 内联 | ❌（换 style = 重新 add） |
| ② semantic（`--semantic`） | `cn-*` **语义类保留** | 作用域样式表（`.style-<name>` + body class） | ✅ 换 body class 切 style（形态） |
| ③ 主题变量（themes.json） | ①②的 className 引用 `var(--color-*)`/`var(--radius)` | 运行时注入 `:root`/`.dark`/`body.radius-*` | ✅ 色板/明暗/圆角自由切换 |

路径②复刻 shadcn 文档站/create 页机制：style css 以 `.style-<name>` 作用域
嵌套包装，组件保留 `cn-*`，切换 = `<body class="style-aurora">` 换 class，
组件树零重挂载。CLI 语义模式还会把 icon-placeholder 组件随依赖落盘
（不跑 transform-icons）。

路径③复刻 shadcn cssVars 机制，四维正交切换：

```
<body class="style-aurora dark radius-full">   ← style（形态）× theme（明暗）× radius（圆角）
applyTheme(themes, { color: "red" })           ← 色板（运行时注入变量值）
```

- `registry/bases/base/themes.json`：3 色板 × light/dark 变量组 + radius 预设
- `registry/bases/base/lib/theme.ts`：`buildThemeCssText`/`applyTheme` 运行时
  注入函数（CLI 落盘到用户项目 `aliases.lib/theme.ts`）
- style css 的颜色全部引用 `--color-*`，圆角引用 `--radius`/`--radius-md`
  （style 作用域内定义默认值，保留三套形态差异；主题参数可覆盖）

## 第二段：注册表产物 → 用户本地（安装侧，CLI）

```
actview-ui init（components.json + utils + 主题文件） + styles/base-<style>/**
        │
        └─► 用户项目 components/ui/{separator.tsx, button-group.tsx}
            （依赖树解析：separator 先装；import 按 aliases 重写；
              IconPlaceholder → @actview/lucide 图标组件）
```

## 目录结构

```
app/(create)/components/
  icon-placeholder.tsx        # 文档站形态占位组件（styles 产物渲染用；CLI 用户端被 transform-icons 替换）
bin/
  actview-ui.js               # CLI 可执行入口（package.json bin: actview-ui）
src/
  cli.js                      # 参数解析 + 子命令分发（init / add / help）
  commands/init.js            # actview-ui init：写 components.json + 安装 utils + 主题文件
  commands/add.js             # actview-ui add：依赖树 + import 重写 + 落盘
  lib/registry.js             # loadRegistry / resolveRegistryTree（包内资源定位）
  lib/config.js               # 用户配置读写（components.json 优先，user-config.json 回退）
  lib/transforms.js           # resolveFilePath / transformImports / restoreRegistryImports
registry/
  bases/base/
    registry.json             # item 清单：button / separator / button-group（依赖 separator）
    themes.json               # 3 色板 × light/dark + radius 预设（路径③）
    ui/button.tsx             # 源头：cva + cn-* 占位符 + useProps（复刻 shadcn 结构）
    ui/separator.tsx          # 源头：被 button-group 依赖
    ui/button-group.tsx       # 源头：跨 item 引用 + 6 个新 token + IconPlaceholder
    components/icon-placeholder.tsx  # 图标占位组件（transform-icons 替换目标）
    lib/utils.ts              # cn = twMerge
    lib/theme.ts              # buildThemeCssText/applyTheme 运行时主题注入
  styles/style-aurora.css     # 3 套作用域样式（.style-<name> 嵌套 + @apply + CSS 变量）
  styles/style-ember.css
  styles/style-mist.css
scripts/
  build.mjs                   # 第一段入口：base + style → styles/**（两套产物）
  lib/build-registry.mjs      # 构建核心（可 import，供测试复用）
package.json                  # packageManager: pnpm + bin: actview-ui
pnpm-workspace.yaml           # minimumReleaseAge 排除 + core overrides（单一实例）
tsconfig.json                 # paths: "@/*" → "./*"；jsxImportSource: "@actview/jsx"
vitest.config.ts              # actviewPlugin() + happy-dom（组件测试）
lib/utils.ts                  # styles 产物 import "@/lib/utils" 的解析目标
styles/                       # 构建产物（gitignore，pnpm build 生成）
  base-aurora/{ui/button.tsx, ui/separator.tsx, ui/button-group.tsx, components/icon-placeholder.tsx}
  base-ember/...
  base-mist/...
  semantic/{ui/*.tsx, components/icon-placeholder.tsx, styles.css, themes.json, theme.ts}
test/                         # 三层测试（见下）
```

## 复刻点对照（对应真实 shadcn 代码）

### 第一段 scripts/build.mjs（registry 驱动）

| 本仓库 | shadcn/ui 原版 | 差异 |
|---|---|---|
| `registry/bases/base/registry.json` | `registry/bases/<base>/registry.ts`（item 清单） | JSON 代替 TS |
| `createStyleMap(css)` | `packages/shadcn/src/styles/create-style-map.ts`（postcss 提取 `@apply` 值） | 正则提取 `.cn-*` 规则块内 `@apply` 的值（同 `extractTailwindClasses` 语义） |
| `transformStyleMap(source, map)` | `packages/shadcn/src/styles/transform-style-map.ts`（ts-morph AST 遍历 cva） | 正则贪婪匹配替换字符串中的 `cn-*` token |
| `rewriteRegistryImports(source)` | `apps/v4/scripts/build-registry.mts` 的 `copyUIToStyles` | `@/registry/bases/base/ui/` → `@/styles/base-<style>/ui/`、`lib/utils` → `@/lib/utils` |
| `buildSemanticRegistry()` | 文档站 `registry/__components__` + `design-system-provider` | 语义类产物 + 作用域样式表合并 |

### 第二段 src/commands/add.js（CLI actview-ui add）

| 本仓库 | shadcn/ui 原版 |
|---|---|
| `resolveRegistryTree()` | `packages/shadcn/src/registry/resolver.ts`（BFS registryDependencies，visited 去重，依赖在前） |
| `getUserConfig()` | `packages/shadcn/src/utils/get-config.ts`（读 components.json） |
| `resolveFilePath()` | `packages/shadcn/src/utils/updaters/update-files.ts`（type → 目标目录，path 公共段截取文件名） |
| `transformImports()` | `packages/shadcn/src/utils/transformers/transform-import.ts`（`@/registry/...` → 用户 aliases） |
| `transformIcons()` | `packages/shadcn/src/utils/transformers/transform-icons.ts`（IconPlaceholder → 图标库组件 + import 注入；actview 生态目标库为 @actview/lucide） |
| `buildThemeCssText()` | create 页 `design-system-provider.tsx` 的 `buildRegistryTheme`（cssVars 运行时注入） |
| 内容相同则 skip | `update-files.ts` 的 `isContentSame` 逻辑 |

## 测试系统

三层结构（`test/`），全部走临时目录/直接调用，无外部示例项目依赖：

```
test/
├── unit/         # L1 纯函数（vitest, node）：createStyleMap/transformStyleMap、
│                 #   resolveRegistryTree（拓扑/环/缺依赖）、transformImports/
│                 #   transformIcons/resolveFilePath/buildThemeCssText
├── component/    # L2 组件行为（vitest + happy-dom + @actview/testing）：
│                 #   直接渲染 styles 构建物，断言 class 合并/变体/事件/lucide 图标、
│                 #   语义类作用域切换
└── integration/  # L3 流水线（临时目录）：buildRegistry 产物断言 +
                  #   runInitCommand/runAddCommand 落盘断言
```

关键实现点：

- **vitest 挂 `actviewPlugin()`**（`vitest.config.ts`）：测试与被测 TSX 经 Babel
  defineComponent 转换（同 actview 主仓库做法）
- **组件必须用 actview 规范写法：函数组件 + `useProps`**（props 响应式取值，
  Babel 自动转 defineComponent）。useProps 返回 ComputedRef（`.value` 惰性求值
  并追踪依赖），解决 setup 只执行一次导致的 props 解构快照问题——children/事件
  更新可达 render。`useProps` 从 `@actview/core` 导入（actview 主包发布版尚未
  re-export，core >=1.0.36 提供）
- **避免 `new URL(..., import.meta.url)`**：vite/vitest 会把它当静态资产转换破坏
  file: scheme；资源定位统一用 `fileURLToPath + path`
- L2 传给 `render()` 的组件必须是**函数声明**（插件只转换声明/赋值形态，内联箭头
  函数会以裸函数进运行时）
- happy-dom 的限制：不支持 CSS `var()` 解析、`getComputedStyle` 对 class 变化有
  缓存——切换断言用"作用域选择器命中"替代，真实浏览器渲染已由 puppeteer 验证

```bash
pnpm test                # vitest run（49 个用例）
pnpm run test:watch      # watch 模式
```

## 真实链路还原（与 shadcn CLI 行为对照）

真实 `button.json` 分发给用户的 `content` 里 import 是 **registry 形态**
（`@/registry/base-nova/lib/utils`），styles 产物则是文档站重写过（`@/lib/utils`）的。
`actview-ui add` 会先把 `@/lib/utils` 还原成 `@/registry/<style>/lib/utils`，
再走 `transformImports` —— 与真实 CLI 行为一致：

```
"@/registry/base-aurora/lib/utils"  ──aliases.utils──►  "@/lib/utils"
"registry/base-aurora/ui/button.tsx" ──type+aliases.ui─►  <用户项目>/components/ui/button.tsx
```

## 验证目标

- 第一段：每个 `cn-*` token 都能逐字对应回各自的 style 定义（`@apply` 后的
  tailwind 类），3 份产物互不相同。
- 第二段：组件按用户配置落到本地路径，import 按用户 aliases 重写，
  内容相同则 skip、不同则 overwrite。
- 第三段：颜色/圆角 token 化贯穿三套 style，主题注入函数输出正确的
  `:root`/`.dark`/`body.radius-*` 规则。

生成物的 className 是 tailwind 类字符串（含 `var(--color-*)` 引用），与 shadcn
原版产物形态一致 —— 这正是 shadcn「base 写行为骨架、style 决定外观、
cssVars 主题化、CLI 按用户配置落地」的核心机制。
