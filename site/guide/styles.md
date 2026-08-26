# 样式与主题

组件使用 **tailwind v4**（工具类）+ **cva**（变体）+ 语义类（`cn-button` 等）三层组合。

## 样式结构

- 工具类：tailwind v4 原子类（`flex`、`items-center`、`bg-background`…）
- 语义类：`cn-button`、`cn-button-variant-default` 等（由 styles 层定义具体视觉）
- 主题变量：`--color-*`（色板）、`--radius*`（圆角刻度）

## 主题切换

本站样式由 `registry/bases/base/lib/theme.ts` 的 `buildThemeCssText` 生成：

```ts
import { buildThemeCssText } from "@/registry/bases/base/lib/theme"
import themes from "@/styles/semantic/themes.json"

const css = buildThemeCssText(themes, {
  color: "emerald",  // 色板：emerald / red / violet
  theme: "light",    // light | dark
  radius: "default", // 圆角
})
```

组件样式表是**作用域样式**：body 挂 `style-<name>` class 即整套切换视觉（本站默认挂 `style-luma`，右下角切换器可换 8 套官方风格：luma / lyra / maia / mira / nova / rhea / sera / vega）。

## 组件原语

所有组件构建在 `@actview/base-ui`（Base UI 的 ActView 完整移植）之上：

```tsx
import { Button } from "@actview/base-ui"
import { Checkbox, Switch, Slider, Radio, RadioGroup } from "@actview/base-ui"
```

原语提供可访问性（ARIA、键盘导航、焦点管理）与状态（`data-checked`、`data-pressed` 等），注册表组件只负责外观组合。
