---
layout: home

hero:
  name: ActView UI
  text: shadcn/ui 风格组件库
  tagline: 基于 ActView 重写的组件注册表 —— 源码级定制、字节级对齐 React 参考
  actions:
    - theme: brand
      text: 浏览组件
      link: /components/button
    - theme: alt
      text: 快速开始
      link: /guide/getting-started

features:
  - title: ActView 重写
    details: 框架层使用 ActView（actview/core + @actview/jsx），组件原语来自 @actview/base-ui（Base UI 完整移植）
  - title: 与 React 参考字节一致
    details: golden 对比测试（DOM 归一化后逐字节比对）覆盖 L0a 22 用例 + L1 11 用例，全部通过
  - title: registry + CLI
    details: 组件通过 actview-ui CLI 落到用户项目，样式可自由切换（aurora / emerald / mist…）
  - title: 文档由 ActPress 驱动
    details: 本站由 @actview/press（vitepress 的 ActView 移植版）构建 —— 文档框架本身也是 ActView
---
