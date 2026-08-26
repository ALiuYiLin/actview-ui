# 快速开始

ActView UI 是 shadcn/ui 风格的 ActView 组件注册表：组件源码随 registry 分发，通过 CLI 落到你的项目，样式由你自己掌控。

## 环境要求

- Node.js ≥ 18，pnpm
- 一个使用 ActView（`actview` + `@actview/core` + `@actview/jsx`）的项目

## 1. 初始化样式

```bash
pnpm dlx @actview/ui init
```

生成 `styles/` 目录（tailwind v4 入口 + 主题变量）。

## 2. 添加组件

```bash
pnpm dlx @actview/ui add button card
```

组件源码（TSX）复制到 `components/ui/`，可直接修改定制。

## 3. 使用

```tsx
import { Button } from "@/components/ui/button"

export default function App() {
  return <Button variant="outline" size="lg">Hello ActView</Button>
}
```

## 依赖

| 包 | 用途 |
| --- | --- |
| `actview` / `@actview/core` / `@actview/jsx` | 框架运行时 |
| `@actview/base-ui` | Base UI → ActView 完整移植原语（Button、Checkbox、Slider…） |
| `class-variance-authority` | cva 变体 |
| `tailwind-merge` | 类名合并（cn 工具） |
| `@actview/lucide` | 图标（IconPlaceholder 的 lucide 来源） |
