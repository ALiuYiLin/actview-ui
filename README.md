# actview-ui：shadcn build-registry 最小复刻（框架层 actview）

在 **button、separator、button-group 三个组件** 上复刻 shadcn/ui 的两段流水线，
组件框架层为 **actview**（`E:\code3\actview`，npm 已发布 `actview` / `@actview/jsx`，
图标库 `@actview/lucide`）。`button-group` 是"稍微复杂"的组件：跨 item 依赖
（separator）、6 个新 token、IconPlaceholder 图标占位符 —— 把依赖树解析与
transform-icons 图标替换两条机制都跑通。

> 依赖注意：`@actview/core` 需 `>=1.0.34`（修复 renderer 对 SVG 元素 set property
> 的报错，`@actview/lucide` 的图标渲染依赖此修复）。

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

## 第一段：base × style → 注册表产物（构建侧）

```
registry/bases/base/registry.json（item 清单 + registryDependencies + 框架依赖）
        │
        ├─ style-aurora.css ──► styles/base-aurora/{ui/button.tsx, ui/separator.tsx, ui/button-group.tsx, components/icon-placeholder.tsx}
        ├─ style-ember.css  ──► styles/base-ember/...
        └─ style-mist.css   ──► styles/base-mist/...
```

## 第二段：注册表产物 → 用户本地（安装侧，CLI）

```
actview-ui init（components.json + utils） + styles/base-<style>/**
        │
        └─► user-project/components/ui/{separator.tsx, button-group.tsx}
            （依赖树解析：separator 先装；import 按 aliases 重写；
              IconPlaceholder → @actview/lucide 图标组件）

## 目录结构

```
app/(create)/components/
  icon-placeholder.tsx        # 文档站形态占位组件（styles 产物渲染用；CLI 用户端被 transform-icons 替换）
bin/
  actview-ui.js                  # CLI 可执行入口（package.json bin: actview-ui）
src/
  cli.js                      # 参数解析 + 子命令分发（init / add / help）
  commands/init.js            # actview-ui init：写 components.json + 安装 utils
  commands/add.js             # actview-ui add：依赖树 + import 重写 + 落盘
  lib/registry.js             # loadRegistry / resolveRegistryTree（包内资源定位）
  lib/config.js               # 用户配置读写（components.json 优先，user-config.json 回退）
  lib/transforms.js           # resolveFilePath / transformImports / restoreRegistryImports
registry/
  bases/base/
    registry.json             # item 清单：button / separator / button-group（依赖 separator）
    ui/button.tsx             # 源头：cva + cn-* 占位符（复刻 shadcn 结构）
    ui/separator.tsx          # 源头：被 button-group 依赖
    ui/button-group.tsx       # 源头：跨 item 引用 + 6 个新 token + IconPlaceholder
    lib/utils.ts              # 最小 cn()
  styles/style-aurora.css     # 3 套自定义样式（@apply tailwind 形式，同 shadcn 原版）
  styles/style-ember.css
  styles/style-mist.css
scripts/
  build.mjs                   # 第一段：base + style → styles/<style>/**
package.json                  # actview / @actview/jsx / cva / typescript + bin: actview-ui
tsconfig.json                 # paths: "@/*" → ["./*", "./user-project/*"]
lib/utils.ts                  # styles 产物 import "@/lib/utils" 的解析目标
styles/                       # 第一段产物
  base-aurora/{ui/button.tsx, ui/separator.tsx, ui/button-group.tsx}
  base-ember/...
  base-mist/...
user-project/                 # 演示用"用户项目"（独立工程：actview + vite + tailwind）
  components.json             # actview-ui init 生成
  package.json                # actview / @actview/core(>=1.0.34) / @actview/jsx / @actview/lucide / cva / tailwind-merge + vite/tailwind
  vite.config.ts              # actviewPlugin()（Babel defineComponent 转换，必需）+ tailwindcss()
  tsconfig.json               # jsxImportSource: "@actview/jsx" + paths（@/*、@/styles/*）
  index.html                  # #app 挂载点
  src/main.tsx                # createApp(App).mount("#app")
  src/App.tsx                 # 效果呈现页：三套 style 对比 + 响应式计数器
  src/index.css               # @import "tailwindcss" + @source "../../styles"
  components/ui/*.tsx         # actview-ui add 安装的组件（当前 style；图标已替换为 @actview/lucide）
  lib/utils.ts                # actview-ui init 安装的 utils（cn = twMerge）
```

## 复刻点对照（对应真实 shadcn 代码）

### 第一段 scripts/build.mjs（registry 驱动）

| 本仓库 | shadcn/ui 原版 | 差异 |
|---|---|---|
| `registry/bases/base/registry.json` | `registry/bases/<base>/registry.ts`（item 清单） | JSON 代替 TS |
| `createStyleMap(css)` | `packages/shadcn/src/styles/create-style-map.ts`（postcss 提取 `@apply` 值） | 正则提取 `.cn-*` 规则块内 `@apply` 的值（同 `extractTailwindClasses` 语义） |
| `transformStyleMap(source, map)` | `packages/shadcn/src/styles/transform-style-map.ts`（ts-morph AST 遍历 cva） | 正则贪婪匹配替换字符串中的 `cn-*` token |
| `rewriteRegistryImports(source)` | `apps/v4/scripts/build-registry.mts` 的 `copyUIToStyles` | `@/registry/bases/base/ui/` → `@/styles/base-<style>/ui/`、`lib/utils` → `@/lib/utils` |

### 第二段 src/commands/add.js（CLI actview-ui add）

| 本仓库 | shadcn/ui 原版 |
|---|---|
| `resolveRegistryTree()` | `packages/shadcn/src/registry/resolver.ts`（BFS registryDependencies，visited 去重，依赖在前） |
| `getUserConfig()` | `packages/shadcn/src/utils/get-config.ts`（读 components.json） |
| `resolveFilePath()` | `packages/shadcn/src/utils/updaters/update-files.ts`（type → 目标目录，path 公共段截取文件名） |
| `transformImports()` | `packages/shadcn/src/utils/transformers/transform-import.ts`（`@/registry/...` → 用户 aliases） |
| `transformIcons()` | `packages/shadcn/src/utils/transformers/transform-icons.ts`（IconPlaceholder → 图标库组件 + import 注入；actview 生态目标库为 @actview/lucide） |
| 内容相同则 skip | `update-files.ts` 的 `isContentSame` 逻辑 |

## 测试系统

三层结构，**不依赖 user-project**（它只作 example/人工验证）：

```
test/
├── unit/         # L1 纯函数（vitest, node）：createStyleMap/transformStyleMap、
│                 #   resolveRegistryTree（拓扑/环/缺依赖）、transformImports/
│                 #   transformIcons/resolveFilePath
├── component/    # L2 组件行为（vitest + happy-dom + @actview/testing）：
│                 #   直接渲染 styles 构建物，断言 class 合并/变体/事件/lucide 图标
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

```bash
npm test                 # vitest run（39 个用例）
npm run test:watch       # watch 模式
```

## 运行

```bash
npm install                      # 安装 actview / @actview/jsx / cva / typescript（tsc 验证用）
npm link                         # （可选）全局注册 actview-ui 命令

# 第一段：生成 3 套 styles/base-<style>/**（9 个文件）
node scripts/build.mjs

# 第二段：CLI（推荐）
cd user-project
actview-ui init --style base-mist                # 写 components.json + 安装 utils
actview-ui add button-group                      # 依赖树解析 + import 重写 + 图标替换（@actview/lucide）
actview-ui add button separator                  # 一次安装多个组件
actview-ui add button-group                      # 内容相同 → 全部 skip

# 或在仓库根直接跑 demo（等价于上面 cwd=user-project 的 add）
npm run install:demo

# 全量类型检查（根 + user-project 独立工程）
npx tsc --noEmit
cd user-project && npx tsc --noEmit

# 效果呈现页（user-project 独立 vite 工程，真实浏览器渲染）
cd user-project
npm install
npm run dev          # http://localhost:5173（端口占用时 vite.config.ts 可调）
npm run build        # tsc + vite build（Babel 转换 + tailwind 扫描的强验证）
```

CLI 与真实 shadcn 的对应：
- `actview-ui init` ← `shadcn init`（写 components.json + 安装 utils）
- `actview-ui add <component>` ← `shadcn add <component>`（依赖树 → transformers → 落盘）

### 第二段的真实链路还原

真实 `button.json` 分发给用户的 `content` 里 import 是 **registry 形态**
（`@/registry/base-nova/lib/utils`），styles 产物则是文档站重写过（`@/lib/utils`）的。
`actview-ui add` 会先把 `@/lib/utils` 还原成 `@/registry/<style>/lib/utils`，
再走 `transformImports` —— 与真实 CLI 行为一致：

```
"@/registry/base-aurora/lib/utils"  ──aliases.utils──►  "@/lib/utils"
"registry/base-aurora/ui/button.tsx" ──type+aliases.ui─►  user-project/components/ui/button.tsx
```

## 验证目标

- 第一段：每个 `cn-*` token 都能逐字对应回各自的 style 定义（`@apply` 后的 tailwind 类），3 份产物互不相同。
- 第二段：组件按用户配置落到本地路径，import 按用户 aliases 重写，
  内容相同则 skip、不同则 overwrite。

生成物的 className 是 tailwind 类字符串，与 shadcn 原版产物形态一致；
只验证字符串级对应关系 —— 这正是 shadcn「base 写行为骨架、style 决定外观、
CLI 按用户配置落地」的核心机制。
