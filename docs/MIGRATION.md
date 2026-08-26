# 迁移计划：shadcn v4 base registry（React）→ actview-ui（actview）

> 源：`E:\code3\ui\apps\v4\registry\bases\base`（314 文件，React + Base UI）
> 目标：`E:\code3\ui.worktrees\actview-ui\registry\bases\base`（actview 函数组件 + `useProps`）
> 目标约束：**DOM 结构与样式和迁移前保持一致**，可自动化验证。

---

## 1. 目标与范围

把源 base registry 的全部组件迁移到 actview-ui，分三期交付：

| 期 | 范围 | 文件量 | 说明 |
|---|---|---|---|
| Phase 1 | `ui/` 全部 + `lib/` + `hooks/` | 61 组件，跳过 1（chart）→ 60 | 核心组件层，优先级最高 |
| Phase 2 | `examples/` 全部 | 65，跳过 3（chart/message/message-scroller）→ 62 | 依赖 Phase 1 |
| Phase 3 | `blocks/` 全部 | 130+，跳过 dashboard-01 整块 + 11 个图表卡片 | 见下方跳过清单 |

**跳过规则（本次新增）**：文件 import `recharts`，或 import 当前 actview 生态无等价、且不在手写清单内的 React 库（`ai-sdk`/`@/lib/ai`、`@dnd-kit`）→ **该文件直接跳过**（不降级、不手写替代、不收录进 registry.json）。块内关键文件被跳过时整块跳过（dashboard-01）。`next/link`→`<a>`、`next/image`→`<img>` 有等价物，不属于跳过范围。

已确认的三个总体决策：

1. **交互原语层**：在本仓库新建 `@actview/base-ui` workspace 包（`E:\code3\ui.worktrees\actview-ui\packages\base-ui`）。actview 仓库只保留核心代码，UI 组件实现一律放本仓库；复刻 Base UI 的 API 面与 DOM 契约。
2. **范围分期**：ui 全部 → examples → blocks；涉及 `recharts`/`ai-sdk`/`@dnd-kit` 的文件按跳过规则直接跳过（不降级、不手写图表）。
3. **一致性基线**：在 actview-ui worktree 内建 React 参考 harness（`test/fixtures/react-reference/`），做 DOM 序列化 diff + 编译 CSS diff + puppeteer 像素对比。

---

## 2. 现状盘点

### 2.1 源（React）依赖面

**外部依赖清单**（grep 自源目录，仅 `ui/`）：

| 依赖 | 使用处 | actview 侧处理 |
|---|---|---|
| `@base-ui/react/*`（26 个原语） | accordion/alert-dialog/avatar/button/checkbox/collapsible/combobox/context-menu/dialog/direction-provider/drawer/menu/menubar/navigation-menu/popover/preview-card/progress/radio/radio-group/scroll-area/select/separator/slider/switch/tabs/toast/toggle/toggle-group/tooltip/input | → **`@actview/base-ui`（本仓库新建 workspace 包 `packages/base-ui`，核心工作）** |
| `@base-ui/react/merge-props`、`use-render` | badge/bubble/marker/item/attachment/breadcrumb/button-group/sidebar | → `@actview/base-ui` 内同 API |
| `@shadcn/react/questionnaire`、`message-scroller` | questionnaire/message-scroller | → `@actview/base-ui` 或组件内实现 |
| `react-day-picker` | calendar | → `@actview/base-ui/calendar` |
| `embla-carousel-react` | carousel | → `@actview/base-ui/carousel`（或组件内实现） |
| `recharts` | chart + 15 个 block/example 文件 | **跳过（不迁移）** |
| `cmdk` | command | → 组件内手写（combobox 已有 base-ui 原语兜底） |
| `input-otp` | input-otp | → 组件内手写 |
| `react-resizable-panels` | resizable | → 组件内手写 |
| `sonner` | sonner | → 组件内手写 toast store |
| `@dnd-kit/*` | blocks/dashboard-01/data-table | 随 dashboard-01 整块跳过 |
| `ai-sdk` / `ai` | message 相关 example（含 `@/lib/ai` 应用耦合） | 涉及文件跳过 |
| `zod` | blocks/data-table | **保留**（纯 JS；data-table 已随块跳过） |
| `date-fns` | calendar example | **保留**（纯 JS） |
| `next/link`、`next/image` | examples/blocks | → `<a>` / `<img>` |
| `class-variance-authority`、`tailwind-merge` | 大量 | **保留**（已在目标 dependencies） |
| `lucide-react`（经 IconPlaceholder） | 全部组件 | → `@actview/lucide`（已有 transform-icons 机制） |

**源注册表格式**：`registry.ts` + 各目录 `_registry.ts`（shadcn schema，item 含 `files`/`registryDependencies`/`meta.links`）。
**源样式**：`apps/v4/registry/styles/` 8 套（style-luma…style-vega），每套内含全部 `.cn-*` token 的 `@apply` 定义（如 `.cn-button { @apply … }`，1744 行的 luma 为全集量级）。

### 2.2 目标（actview-ui）现有能力

- `registry/bases/base/`：registry.json（items + `semanticDependencies` 扩展）、ui/（button/separator/button-group）、components/icon-placeholder、lib/（utils/theme）、themes.json
- `registry/styles/style-{luma,lyra,maia,mira,nova,rhea,sera,vega}.css`：8 套（v4 官方样式直接适配），`.style-<name>` 作用域壳 + `.cn-*` token
- 构建：`scripts/lib/build-registry.mjs`（createStyleMap / transformStyleMap / verifyTokens / buildRegistry / buildSemanticRegistry）
- CLI：`src/cli.js` init/add（`--semantic`），transforms（transformImports / transformIcons / transformSemanticImports / restoreRegistryImports）
- 测试：vitest + happy-dom + `@actview/testing`，49 用例全绿
- actview core 已具备：ref/reactive/computed/watch/watchEffect/nextTick/onMounted/onUnmounted/provide/useInjects/**Teleport/Transition/TransitionGroup**/Suspense/lazy/renderToString/useProps

### 2.3 差距总结（本次迁移要补的三块）

1. **原语层**：26+ 个 Base UI 交互原语在 actview 生态不存在 → 本仓库建 `@actview/base-ui` workspace 包（`packages/base-ui`）。
2. **组件资产**：目标只有 3 个 ui 组件 → 迁移 60 个（chart 跳过）+ lib/hooks。
3. **样式 token**：目标 8 套 style css 只有少量 token → 全量同步源的 `.cn-*` token 集。

---

## 3. React → actview 迁移完整注意事项

### 3.1 组件形态（最重要）

- **一律函数组件 + `useProps`**，不手写 `defineComponent`（Babel `defineComponentPlugin` 构建期自动转换）。这是 actview 设计规范，已有 button/separator/button-group 为范本。
- `useProps(props, { key: normalizer })` 返回 ComputedRef，**必须 `.value` 惰性取值**：直接解构会得到 setup 快照，children/事件/后续 props 更新不达 render。`cn(...)` 内部取 `className.value` 保证依赖被追踪。
- **`class`/`className` 双写**：actview 用 `class`，`className` 作 React 迁移兼容别名；两者都解构出 `rest` 之外，避免 DOM 覆盖。源代码只写 `className`，迁移后两种都要消费（现有 button.tsx 范本）。
- 源里的 `"use client"` 指令直接删除。

### 3.2 JSX 与渲染差异

| React 写法 | actview 写法 | 注意 |
|---|---|---|
| `className={…}` | `class={…}`（兼容保留 `className` 消费） | cn 合并时双源合并 |
| `style={{ '--x': v }}` | 同（对象/字符串均可） | CSS 变量内联（如 `--accordion-panel-height`）必须保留 |
| `onClick` 等事件 | 同名 React 风格 | Phase 0 spike 验证：`onKeyDownCapture`/`onPointerDownCapture`/`onPointerLeave`/`onMouseEnter` 等捕获阶段与非标准事件是否支持；缺口列入 actview 仓库 backlog |
| `ref={…}`（对象/回调） | actview renderer 有 `applyRef` | spike 验证 ref 属性语义；React 19 的 ref-prop 组件传引用改写为普通 prop |
| `createPortal(…, document.body)` | `<Teleport to="body">`（或 `Teleport` 组件） | 挂载位置与顺序要和 Base UI 一致（body 末尾） |
| `createContext`/`useContext` | `provide(key, val)` / `useInjects(key)` | key 建议用 Symbol/字符串常量；carousel/sidebar 等复合组件用到 |
| `<Fragment>` / `<>` | 同 | — |
| 条件渲染 / `&&` 短路 | 同 | — |
| `React.memo` | 不需要（响应式依赖追踪天然精确更新） | — |
| `dangerouslySetInnerHTML` | 无 | 源组件基本不用，用则手写 DOM 赋值替代 |
| SVG 属性 camelCase（`strokeWidth` 等） | 同 | `@actview/core >= 1.0.34` 已修复 SVG set property |

### 3.3 Hooks / 状态映射表

| React | actview | 备注 |
|---|---|---|
| `useState` | `ref` / `reactive` | 读写 `x.value`；reactive 用于对象 |
| `useRef`（DOM） | `ref` + `ref` 属性 | spike 验证 |
| `useEffect(fn, deps)` | `watchEffect` + `onMounted`/`onUnmounted` | 清理用 `onWatcherCleanup`；deps 语义用 `watch(source, fn, {immediate})` |
| `useLayoutEffect` | `onMounted` + `nextTick` | 测 DOM 布局类副作用 |
| `useMemo` | `computed` | |
| `useCallback` | 普通函数 | 无闭包过期问题，直接内联 |
| `createContext`/`useContext` | `provide` / `useInjects` | |
| `useId` | base-ui 包内 `useId` 实现（确定性/计数 id） | 生成 id 归一化后不参与 diff |
| `useImperativeHandle` | 事件回调 prop 或暴露 ref 对象 | 源组件很少用 |
| `forwardRef` | 直接接收 `ref` prop | — |
| `useReducer` | `ref` + 函数 | — |
| `React.Suspense`/`lazy` | `Suspense` / `lazy`（actview 自带） | — |

### 3.4 类型层

- `React.ComponentProps<"div">` → `import type { HTMLAttributes } from "@actview/jsx"`（button 用 `ButtonHTMLAttributes`，等等）。
- `React.ReactNode` → `VNodeChild`（`@actview/core`）。
- `VariantProps<typeof cva>` 不变（cva 保留）。
- `React.ElementRef<typeof X>` → 手写提取 `keyof` 类型或省略。
- `React.forwardRef<Ref, Props>` 签名 → 函数组件直接加 `ref` prop。

### 3.5 图标（IconPlaceholder → @actview/lucide）

- 目标已有 `registry/bases/base/components/icon-placeholder.tsx` + CLI `transform-icons` 机制（替换 `<IconPlaceholder lucide="X"/>` → `<X/>` + import 注入），**全部复用**，不需要改机制。
- 名称映射：lucide-react 名带 `Icon` 后缀（`ChevronDownIcon`）→ `@actview/lucide` 无后缀（`ChevronDown`）。`@actview/lucide` 为全量 lucide（~1400 图标），覆盖没问题。
- 行动项：写脚本扫描源组件里用到的全部 `lucide="…"` 名 → 生成映射表 → 扩充 `icon-placeholder.tsx` 的 `ICON_COMPONENTS` 与 transform-icons 的名称转换逻辑（按映射表转换，而不是简单去后缀——个别名称可能不对应，需逐一核对）。

### 3.6 第三方依赖替换矩阵

| 源 | 目标 | 策略 |
|---|---|---|
| `@base-ui/react/*` | `@actview/base-ui/*` | **API 面刻意保持同名同名导出**，组件源码层改动最小（只换包名） |
| `@shadcn/react/*` | `@actview/base-ui/*` 或组件内 | questionnaire/message-scroller |
| `recharts` | — | **跳过**（不迁移，不提供 SVG 替代） |
| `embla-carousel-react` | `@actview/base-ui/carousel` | scroll 行为手写 |
| `react-day-picker` | `@actview/base-ui/calendar` | 网格 + 键盘导航手写 |
| `cmdk` / `input-otp` / `react-resizable-panels` | 组件内手写 | 行为简单、DOM 可控 |
| `sonner` | 组件内 toast store | `@actview/base-ui/toast` + store |
| `@dnd-kit/*` / `ai-sdk` / `ai` | — | **跳过**（涉及文件不迁移） |
| `zod`、`date-fns` | **保留** | 纯 JS |
| `next/link` → `<a>`；`next/image` → `<img>` | 替换 | 保留 class/data-slot |

### 3.7 DOM 一致性红线

DOM 结构保持一致是本迁移的硬约束，逐组件锁定以下细节：

1. **`data-slot` 属性全部保留**（值一字不改）。
2. **状态属性**：Base UI 渲染的 `data-state` / `data-panel-open` / `data-popup-open` / `data-checked` / `data-unchecked` / `data-selected` / `data-horizontal` / `data-vertical` / `data-[size=…]` / `data-ending-style` / `data-starting-style` 等 —— `@actview/base-ui` 原语必须输出同名同值。
3. **aria/role/tabindex**：`aria-expanded`、`aria-controls`、`aria-hidden`、`aria-labelledby`、`role`、`tabindex`、`aria-roledescription` 等全部一致。
4. **元素层级与嵌套顺序**：如 `DialogPortal > Backdrop + Popup`、`AccordionTrigger 外层 Header`、`Select` 的 trigger/value/icon 顺序。
5. **Portal 挂载位置**：`Teleport to="body"`，挂载顺序在 body 末尾（与 Base UI 一致）。
6. **内联 style 变量**：`h-(--accordion-panel-height)` 对应的 `style="--accordion-panel-height: …"` 必须存在。
7. **SVG 内部结构**：图标 `<svg>` 的 viewBox/stroke 属性与内部 path 结构一致（`@actview/lucide` 与 lucide-react 同源，天然一致）。
8. **生成 id**（aria-labelledby/id 对）：值可以不同，但**属性位置与配对关系**必须一致 → diff 时归一化。

### 3.8 样式一致性（token 同步）

- `.cn-*` token 是框架无关的纯 CSS（`@apply` 在 tailwind v4 两栈等价编译），**token body 以源为准全量搬运**。
- 策略：以源 `style-luma.css`（8 套之一）为 canonical token 源，用脚本提取全部 `.cn-*` 块，写入目标 8 套 `style-*.css` 的 `.style-<name>` 作用域内（8 套共用同一 token body，只保留各自 `.style-<name>` 壳与 `--radius` 默认值；颜色/圆角差异继续走 cssVars 主题层）。
- 校验：扩充现有 `verifyTokens` —— 组件 class 字符串里出现的每个 `.cn-*` 前缀必须在 styles css 中有定义，双向（styles 里有定义但无组件使用则告警）。
- 主题变量名对齐：源的 `--color-*` v4 变量集与目标 themes.json/theme.ts 的变量集做一次全量核对（源变量 ⊇ 目标变量；缺失的补进 themes.json）。
- 源 BASE_STYLE 的 `@import "tw-animate-css"` / `"shadcn/tailwind.css"`：目标等价物已在现有 styles css 中处理（`@reference "tailwindcss"` + 编译管线），不照搬。

---

## 4. @actview/base-ui 包设计（本仓库 workspace 包）

- **位置**：`E:\code3\ui.worktrees\actview-ui\packages\base-ui` —— 与 registry/CLI 同仓库，actview 仓库不承载任何 UI 组件实现。
- **workspace 接入**：`pnpm-workspace.yaml` 增加 `packages: ['packages/*']`；actview-ui 根 `package.json` 增加 `"@actview/base-ui": "workspace:*"`（devDependencies 即可，registry 组件经 vitest/vite 直读 TS 源码）。现有 `overrides` 机制保留，若 `@actview/base-ui` 未来发布后出现双实例问题按 core 先例钉版本。
- **依赖**：`@actview/core`、`@actview/jsx`（peer/dev）；**零 React 依赖**。
- **构建与导出**：沿用 `@actview/core` 的模式 —— 开发期 `exports: { ".": "./src/index.ts" }`（仓库内 vitest/vite 直读源码），发布期 `publishConfig` 指向 tsup 产物 `dist/`（`build: tsup`）。
- **发版**：遵循"不自动发布"约束 —— 本地 workspace 链接开发；需要发布时与 `@actview/ui` 一起手动 `pnpm publish`（用户项目经 CLI add 安装 `@actview/base-ui` 依赖，发布前先声明版本）。
- **导出面**（与源 import 一一对应，chart 已跳过故不含）：`accordion` `alert-dialog` `avatar` `button` `checkbox` `collapsible` `combobox` `context-menu` `dialog` `direction-provider` `drawer` `menu` `menubar` `navigation-menu` `popover` `preview-card` `progress` `radio` `radio-group` `scroll-area` `select` `separator` `slider` `switch` `tabs` `toast` `toggle` `toggle-group` `tooltip` `input` `calendar` `carousel` + 工具 `merge-props` `use-render` `useId`。
- **契约**：每个原语的 props API 与渲染 DOM 同 Base UI 当前版本（以 React 参考 harness 的 golden 为准，见 §6.2）；组件名刻意同名（`Root`/`Trigger`/`Popup`/`Panel`/`Item`…），使 ui 组件源码层只改 import 包名。
- **实现套路**（每个原语）：`provide` 上下文 + `ref` 状态 + `watchEffect` 事件绑定 + `Teleport`（浮层类）+ 与 Base UI 相同的 data/aria 输出。
- **验收**：原语级 golden 测试全部通过（比 ui 组件测试更细的状态矩阵）。

---

## 5. 迁移方法（分阶段）

### 5.1 Phase 0：前置基建（先做，不迁移组件）

> **已落地（M0 实施记录）**：spike 用例 `test/spike/actview-capabilities.test.tsx`（9 用例，见 §8 结论）；`packages/base-ui` 骨架 + button/separator/tooltip 三个原语（workspace 链接，`pnpm-workspace.yaml` packages + 根 package.json `workspace:*`）；React 参考 harness（`test/fixtures/react-reference/`，vitest + happy-dom 内跑 React 19 + Base UI 1.6.0，独立配置 `vitest.react.config.ts` / `pnpm test:react-ref`）；token 同步脚本 `scripts/sync-style-tokens.mjs`（421 token 已同步，canonical = style-luma）；golden 采集/对比以 vitest 形式落地（`test/fixtures/react-reference/tests/golden-capture.test.tsx` 采集 → `test/fixtures/golden/*.html` 入库；`test/golden/golden-diff.test.tsx` 对比）。**首对 golden（button×3 + tooltip×2）5/5 逐字节一致。**
>
> M0/M1 发现的框架层事实（已写入 §8 风险表与组件规范）：
> - **props 合成必须用 computed**（或 JSX 内实时求值）：setup 只跑一次，mergeProps/mergeClassName 在 setup 体构造会快照过期；`computed(() => mergeProps(...))` 惰性追踪是标准解法（用户指定）。
> - **最终 return 必须是 JSX（或条件 JSX/jsx 调用）**：defineComponentPlugin 只包装这种形态；`return () => {}` 不被识别（组件会以裸函数进入运行时）。
> - **useProps 派生的对象/数组值引用不稳定**：每次 `.value` 访问返回新包装（spike 实证），身份比较（`===`/`!==`）恒为真 → 受控同步死循环。跨访问比较一律用 `sameValue`（packages/base-ui/src/internals/compare.ts）。原语受控同步（toggle-group/radio-group）已按此修复，带回归测试。
> - **aria-* 布尔 false 会被 actview 移除属性**（React 渲染 `aria-pressed="false"` 字符串）→ 所有 aria 布尔值 String() 化（aria-pressed/aria-checked/aria-disabled 已修）。
> - **具名插槽 API**：`<template slot="x">` 被插件提取为 `slots={{ x: () => <fragment>... }}` prop（函数形态，支持作用域参数裸属性）；插槽是纯内容投影，**不能替代 render prop 的 props 合并语义**（Base UI useRender 需要把原语 props 合进目标元素），且改插槽会破坏与源文件的结构对齐。render prop + mergeRenderProps 路径经回归测试验证响应性无损失（test/base-ui/render-prop-reactivity.test.tsx，4/4）。
> - `<Fragment>`/`<>` JSX 语法过不了 @actview/jsx 的 TS 类型（ElementType 不含 symbol）→ 用 `jsx(Fragment, { children })` 显式调用。
> - 源 token 依赖 tw-animate-css（animate-in/fade-out 等）与自定义 @utility（no-scrollbar、animate-caret-blink）→ semantic styles.css 已带 `@import "tw-animate-css"`，自定义 utility 需随分发 base css 提供（见 M1 变量对齐任务）。
> - v4 变量形态：`@theme inline` 桥接 `--color-*: var(--*)`，编译产物引用 `var(--primary)` 等原始名 → **M1 任务：themes.json/theme.ts 从 --color-* 改为原始变量名对齐 v4**（§3.8）。
> - golden 归一化已覆盖：Base UI id 形态 `base-ui-_r_3_`/`_r_4_`、React 19 useId `«rN»`、浮层定位数值（left/top/transform）、测试容器 id。
> - transformStyleMap 语义对齐源 shadcn：未定义 token 移除（非抛错）+ ALLOWLIST（cn-menu-target/cn-menu-translucent/cn-logical-sides/cn-rtl-flip/cn-font-heading）保留；verifyTokens 过滤白名单。

1. ~~**spike 验证 actview 能力边界**（半天，写 `test/spike/` 一次性用例）~~ ✅ 已落地
2. ~~**建 `@actview/base-ui` 包骨架**（本仓库 `packages/base-ui`）+ 首批 3 个原语（button / separator / tooltip，作为标准实现范本）+ workspace 接入~~ ✅ 已落地
3. **React 参考 harness**（`test/fixtures/react-reference/`）✅ 已落地（冻结源 commit `a85299a`，MANIFEST.json 记录；随迁移进度增量冻结）
4. **半自动转换脚本** `scripts/migrate-component.mjs`（机械转换 + 人工审查标记，M0 剩余项）
   - 删 `"use client"`；`@base-ui/react/` → `@actview/base-ui/`；`@/app/(create)/components/icon-placeholder` → `@/registry/bases/base/components/icon-placeholder`；
   - `import * as React from "react"` → 按 hooks 映射表改写（`React.useState` → `ref` 等，输出 TODO 注释供人工核对）；
   - `className` → `class` 双写；`React.ComponentProps<"x">` → `@actview/jsx` 类型；
   - lucide 名映射表替换。
5. **registry.json 生成器** `scripts/gen-registry-json.mjs`：解析源各 `_registry.ts` 的 name/files/registryDependencies → 生成目标 registry.json items（dependencies 字段由 import 扫描得出），保留 `semanticDependencies` 扩展。
6. **token 同步脚本** `scripts/sync-style-tokens.mjs`：源 style css → 目标 8 套 styles css + verifyTokens 双向校验。
7. **一致性采集器** `scripts/capture-golden.mjs`：跑 React harness，输出归一化 golden HTML + 截图到 `test/fixtures/golden/`。

### 5.2 Phase 1：ui 组件（60 个，按依赖分层推进）

每层内部：**先写 base-ui 原语 → 迁移组件 → registry.json item → token 同步 → 测试 → gate**。

| 层 | 组件 | 依赖特征 |
|---|---|---|
| L0 无行为依赖 | badge, skeleton, spinner, kbd, separator, label, marker, empty, alert, card, aspect-ratio, direction, message, bubble, item, attachment, button-group, button, input-group, native-select, input, textarea, field, pagination, breadcrumb, table | 仅 cva/cn/merge-props/use-render |
| L1 表单行为 | checkbox, switch, slider, radio-group, progress, toggle, toggle-group, input-otp | base-ui 表单原语 |
| L2 浮层 | tooltip, popover, hover-card, dialog, alert-dialog, drawer, sheet | Teleport + 焦点管理 |
| L3 菜单/选择 | dropdown-menu, context-menu, menubar, navigation-menu, select, combobox, command | menu 原语最复杂 |
| L4 复合 | accordion, collapsible, tabs, scroll-area, toast, sonner, carousel, resizable, calendar, avatar, sidebar, questionnaire, message-scroller | 多原语组合 + 手写第三方（chart 跳过，不进本清单） |

### 5.3 Phase 2：examples（62 个）

- **跳过 3 个**：`chart-example`（recharts）、`message-example`、`message-scroller-example`（ai-sdk + `@/lib/ai` 应用耦合）→ 迁移 62 个；
- `next/link`→`<a>`、`next/image`→`<img>`、`sonner`/`date-fns` 替换按 §3.6。

### 5.4 Phase 3：blocks（130+ 个）

- **跳过清单（不迁移）**：
  - `dashboard-01` 整块（chart-area-interactive、data-table 依赖 recharts，data-table 另依赖 @dnd-kit）；
  - `preview/cards`：visitors、sleep-report、pie-chart-card、bar-chart-card、analytics-card（5 个图表卡片）；
  - `preview-02/cards`：card-overview、dividend-income、contribution-history、power-usage、stock-performance、savings-progress（6 个图表卡片）；
  - `preview/index.tsx`、`preview-02/index.tsx` 删除被跳文件的引用后保留；
- `next/image` → `<img>`；login/signup/sidebar 系列基本只依赖 ui 组件，机械化程度高。

### 5.5 Phase 4：收尾

- registry.json 全量（60 ui + hooks + lib + components），`semanticDependencies` 关系完整；
- README/DESIGN.md 更新（组件清单、`@actview/base-ui` 说明）；
- 全量验收矩阵跑通（§8）。

### 5.6 单文件迁移 SOP（每个组件固定流程）

1. 复制源文件到目标同路径；
2. 跑 `scripts/migrate-component.mjs` 机械转换；
3. 按 §3 清单人工核对（hooks、ref、Portal、事件、类型）；
4. 跑 token 同步校验 + 补 styles css 缺失 token；
5. 写组件测试 + 采集/对比 golden；
6. `pnpm test` + `pnpm typecheck` + `pnpm build` + CLI add 落盘冒烟。

---

## 6. 测试体系

### 6.1 单元/组件测试（vitest + happy-dom + @actview/testing，沿用现有体系）

- 每个组件至少：默认渲染（class/data-slot/variant）、props 变更、交互事件（fireEvent/waitFor）；
- happy-dom 限制（不支持 var()、getComputedStyle class 变化缓存）→ 只断言结构/属性/class 字符串，不断言计算样式。

### 6.2 DOM 一致性测试（核心）

```
test/fixtures/
  react-reference/          # React 原版 harness（冻结 commit）
  golden/<component>/<state>.html      # React 渲染的归一化序列化
  golden/<component>/<state>.actview.html
```

- **归一化规则**（两侧同一套函数）：生成 id 值（`«r0»` 等）→ `{id}` 占位；属性顺序排序；`style` 内属性排序；忽略注释节点；类名按原序保留（顺序即 token 顺序，参与对比）。
- **状态矩阵**：每个组件取 `默认 / 打开 / 选中 / 悬停 / 禁用 / 聚焦` 等适用状态，一态一个 golden（交互测试逐态驱动）。
- **对比**：actview 渲染 → 同一归一化 → 与 React golden 逐字节 diff；diff 必须为空（除 §3.7.8 的 id 值外无例外）。
- **原语级**：`@actview/base-ui` 每个原语同样跑 golden（状态矩阵更细，含键盘/指针路径）。

### 6.3 CSS 一致性测试

- **token 编译 diff**：同一 `.cn-*` token 在 React harness 与 actview harness 各自编译，diff 编译产物（应逐条相同；变量名差异按 §3.8 对齐后应为零）。
- **verifyTokens 双向完整性**（组件用到的 token 必须存在；styles 中孤儿 token 告警）。
- 两栈 `cn()` 合并顺序一致（twMerge 同版本，输出 class 字符串直接对比，§6.2 已覆盖）。

### 6.4 视觉回归测试（puppeteer + pixelmatch）

- `scripts/visual-compare.mjs`：同状态矩阵两栈各截一屏（固定 viewport、同字体、同背景），`pixelmatch` diff；
- 阈值：像素差异率 < 0.5%（排除亚像素/字体渲染差异，阈值实测后校准）；
- 矩阵维度：组件状态 × light/dark × radius(default/none/full) × 3 主题色板（cssVars 路径）；
- 视觉层同时承担 happy-dom 测不了的 var()/真实样式验证。

### 6.5 测试矩阵汇总

| 层 | 工具 | 覆盖 |
|---|---|---|
| 单元/组件 | vitest + happy-dom | class/data-slot/props/交互 |
| DOM 一致性 | golden HTML diff | 结构/属性/层级/状态属性 |
| CSS 一致性 | 编译产物 diff + verifyTokens | token 级样式 |
| 视觉一致性 | puppeteer + pixelmatch | 像素级样式 |
| 链路 | 现有 integration 测试 | build + CLI add 落盘 |

---

## 7. 验收标准（每阶段 gate，全部满足才算完成）

1. `pnpm typecheck` 零错误；
2. `pnpm test` 全绿（含新增 golden/视觉用例）；
3. 该阶段全部组件：DOM golden diff 为空、token 编译 diff 为零、像素 diff 在阈值内；
4. `pnpm build` 成功，且 CLI `add <组件>` 每个组件可独立落盘到干净项目并通过编译；
5. registry.json 与源 `_registry.ts` 的 item 清单一一对应（跳过清单显式排除后脚本比对，chart/message 相关 item 不收录）；
6. 每层完成后打 commit（可回溯）。

---

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| actview 能力缺口 | spike 已验证：事件（含 Capture/非标准）、ref、Teleport、provide/useInjects、受控 input、Fragment 全部可用。两处缺口已定位并各有 workaround：① SVG camelCase 属性（strokeWidth）以原名 setAttribute → **JSX 写 kebab-case**（@actview/lucide 同法）② style 对象不支持 CSS 变量（--x）→ **原语层 ref + setProperty 命令式**（accordion 测量本就命令式）。两缺口进 actview 仓库 backlog（核心代码范畴），不阻塞迁移 |
| Base UI 行为复刻不精确（焦点陷阱/指针捕获/滚动锁定） | 原语逐个对照 Base UI 源码实现，原语级 golden 状态矩阵覆盖键盘/指针路径 |
| 源仓库持续升级导致漂移 | harness 冻结 commit hash 记录；升级时重跑全量 golden 再放行 |
| happy-dom 覆盖不了真实样式 | 视觉回归层兜底（§6.4），CI 里 happy-dom 只跑结构断言 |
| `@actview/base-ui` 发版节奏阻塞 actview-ui | 同仓库 workspace 包：开发期 `workspace:*` 直读源码，零跨仓库阻塞；发布仅在 CLI add 需要用户端安装时与 `@actview/ui` 一起手动执行 |

---

## 9. 里程碑顺序

1. **M0** Phase 0 基建全部落地（本仓库 `packages/base-ui` 骨架 + 3 原语范本 + harness + 三个脚本）—— gate：spike 用例 + 首对 golden（button/tooltip）通过；
2. **M1** L0 + L1 组件（约 35 个）—— gate：§7 全项；
3. **M2** L2 + L3 浮层/菜单组件（约 15 个）—— 最重，先原语后组件；
4. **M3** L4 复合组件（约 14 个）—— Phase 1 完成；
5. **M4** Phase 2 examples（62）；
6. **M5** Phase 3 blocks（130+，跳过 dashboard-01 整块 + 11 个图表卡片 + 2 个 index 引用清理）；
7. **M6** Phase 4 收尾 + 文档 + 全量验收。
