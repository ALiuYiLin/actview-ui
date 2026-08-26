# @actview/ui

actview 组件注册表 CLI：registry + build 生成 styles，CLI 把组件**源码**落到
用户项目（shadcn build-registry 复刻，框架层 actview）。

架构与机制详见 [docs/DESIGN.md](docs/DESIGN.md)。

## 安装

```bash
# 开发本仓库
pnpm install
pnpm build        # 生成 styles 产物（registry 源 + style css → styles/**）

# 全局 CLI（包发布后）
npm i -g @actview/ui
actview-ui --help
```

> 依赖注意：用户项目需 `@actview/core >= 1.0.36`；pnpm 项目建议在
> `pnpm-workspace.yaml` 用 overrides 强制单一 core 实例
> （详见 docs/DESIGN.md）。

## 使用

```bash
# ① 初始化用户项目：components.json + lib/utils.ts + lib/theme.ts + styles/themes.json
actview-ui init --cwd my-app --style base-luma

# ② 安装组件：依赖树解析 + import 重写 + 图标替换 + 落盘
actview-ui add button-group --cwd my-app

# ③ 语义类模式：cn-* 保留 + 作用域样式表（运行时自由切换 style）
actview-ui add button-group --cwd my-app --semantic
```

## 使用参数

### `init`

| 参数 | 说明 | 默认 |
|---|---|---|
| `--cwd <dir>` | 项目目录（不存在则自动创建） | 当前目录 |
| `--style <style>` | 注册表风格（8 套官方）：`base-luma` / `base-lyra` / `base-maia` / `base-mira` / `base-nova` / `base-rhea` / `base-sera` / `base-vega` | `base-luma` |
| `--yes` | 已有配置时强制覆盖重写 | 否 |

落盘产物：`components.json`（含 style/baseColor/theme/radius）、`lib/utils.ts`、
`lib/theme.ts`、`styles/themes.json`。

### `add <component...>`

| 参数 | 说明 | 默认 |
|---|---|---|
| `--cwd <dir>` | 项目目录 | 当前目录 |
| `--style <style>` | 覆盖配置里的 style | `components.json` 的 style |
| `--semantic` | 语义类模式：`cn-*` 保留 + 落盘 `styles/actview-ui.css`（作用域样式表） | 关 |
| `--yes` | 已存在的文件直接覆盖 | 关（内容相同则 skip） |

可用组件：`button` / `separator` / `button-group`。

## demo 示例

### ① 单组件安装

```bash
actview-ui init --cwd demo-app
actview-ui add button --cwd demo-app
```

### ② 依赖组件（依赖树自动解析）

```bash
actview-ui add button-group --cwd demo-app
# 依赖树: separator → button-group（依赖在前）
# 落盘: demo-app/components/ui/separator.tsx + button-group.tsx
```

### ③ 语义类模式（style 自由切换）

```bash
actview-ui add button-group --cwd demo-app --semantic
# 落盘: components/ui/*（cn-* 保留）+ styles/actview-ui.css（作用域样式表）
```

```html
<!-- 换 body class 即切换整套形态，组件树零重挂载 -->
<body class="style-luma">   <!-- ↔ style-lyra / style-maia / style-mira / style-nova / style-rhea / style-sera / style-vega -->
```

### ④ 主题切换（色板 / 明暗 / 圆角）

```ts
import themes from "./styles/themes.json"
import { applyTheme } from "@/lib/theme"

// 运行时注入 CSS 变量：色板 / 明暗 / 圆角自由切换
applyTheme(themes, { color: "red", theme: "dark", radius: "full" })
```

```html
<body class="style-nova dark radius-full">
  <!-- style=形态 / dark=明暗 / radius-full=圆角覆盖 -->
</body>
```

### ⑤ 落盘产物形态（actview 规范写法）

```tsx
// demo-app/components/ui/button.tsx（add 后的形态）
import { useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0",          // cn-* 已展开（路径①）
  { variants: { variant: { default: "bg-(--color-primary) text-(--color-primary-foreground)" /* 颜色引用主题变量 */ } } }
)

function Button(props: ButtonHTMLAttributes & VariantProps<typeof buttonVariants>) {
  const { variant, size, class: className, rest } = useProps(props, {
    variant: (v) => v ?? "default",
    size: (v) => v ?? "default",
    class: undefined,
  })

  return (
    <button
      data-slot="button"
      class={cn(buttonVariants({ variant: variant.value, size: size.value }), className.value)}
      {...rest.value}
    />
  )
}

export { Button, buttonVariants }
```
