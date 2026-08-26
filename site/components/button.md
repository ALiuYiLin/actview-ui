---
title: Button 按钮
---

# Button 按钮

触发操作的基础按钮组件，基于 `@actview/base-ui` 的 `Button` 原语（Base UI → ActView 移植），支持 6 种变体与 6 种尺寸。

<script lang="tsx">
import { ButtonVariantsDemo, ButtonSizesDemo, ButtonStatesDemo, ButtonRenderDemo, ButtonWithIconDemo } from '../examples/button'
export { ButtonVariantsDemo, ButtonSizesDemo, ButtonStatesDemo, ButtonRenderDemo, ButtonWithIconDemo }
</script>

## 变体

<ButtonVariantsDemo />

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>
```

## 尺寸

<ButtonSizesDemo />

```tsx
<Button size="xs">X-Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon-sm">🔍</Button>
<Button size="icon">⚙</Button>
<Button size="icon-lg">⋯</Button>
```

## 状态

<ButtonStatesDemo />

```tsx
<Button disabled>Disabled</Button>
```

## 自定义渲染（render）

通过 `render` 属性把按钮渲染为其它元素（链接、原生按钮等）：

<ButtonRenderDemo />

```tsx
<Button render={<a href="https://example.com" />}>As Link (render)</Button>
<Button render={<button type="button" />} nativeButton={false}>Native Button</Button>
```

## 带图标

<ButtonWithIconDemo />

```tsx
<Button>
  <span aria-hidden="true">⬇</span> Download
</Button>
```

## API

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "link" \| "destructive"` | `"default"` | 视觉变体 |
| `size` | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-sm" \| "icon-lg"` | `"default"` | 尺寸 |
| `render` | `VNode \| (props) => VNode` | — | 自定义渲染元素 |
| `nativeButton` | `boolean` | `true` | 是否渲染原生 `<button>`（Base UI 原语） |
| `disabled` | `boolean` | `false` | 禁用 |
| `type` | `"button" \| "submit" \| "reset"` | — | 原生类型 |
