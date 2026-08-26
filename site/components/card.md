---
title: Card 卡片
---

# Card 卡片

容器组件，用于组织内容与操作：`Card` + `CardHeader` / `CardTitle` / `CardDescription` / `CardAction` / `CardContent` / `CardFooter`。

<script lang="tsx">
import { CardSimpleDemo, CardWithActionDemo } from '../examples/card'
export { CardSimpleDemo, CardWithActionDemo }
</script>

## 基础用法

<CardSimpleDemo />

```tsx
<Card>
  <CardHeader>
    <CardTitle>项目概览</CardTitle>
    <CardDescription>本月数据一览</CardDescription>
  </CardHeader>
  <CardContent>卡片内容区域</CardContent>
  <CardFooter>
    <Button>保存</Button>
  </CardFooter>
</Card>
```

## 带操作区

`CardAction` 渲染在标题行右侧（顶对齐）：

<CardWithActionDemo />

## API

| 组件 | 说明 |
| --- | --- |
| `Card` | 容器（data-slot="card"） |
| `CardHeader` | 头部区域 |
| `CardTitle` | 标题 |
| `CardDescription` | 描述 |
| `CardAction` | 头部操作区（绝对定位右上角） |
| `CardContent` | 内容区 |
| `CardFooter` | 底部操作区 |
