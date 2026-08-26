# ActView UI 迁移计划（M 系列 TODO）

> 目标：将 shadcn v4 `registry/bases/base` 全部组件从 React 迁移到 ActView，
> 与 React 参考**字节级一致**（DOM golden diff 空 + token 编译 diff 零 + 像素 diff 阈值内），
> 样式直接适配 v4 官方 8 套（luma/lyra/maia/mira/nova/rhea/sera/vega）与 24 色板主题。
>
> 已完成的工作用 `[x]` 勾选；未完成的用 `[ ]`。每阶段完成标准（gate）：
> ① DOM golden diff 为空 ② token 编译 diff 为零 ③ 像素 diff 在阈值内
> ④ typecheck 干净 ⑤ 全量测试通过 ⑥ 先 commit 再执行下一步。

---

## M0 基础能力 ✅

- [x] React 参考冻结管线（scripts/freeze-react-reference.mjs + MANIFEST.json，28 文件）
- [x] golden 对比 harness（test/fixtures/golden-normalize.ts + vitest 双跑：React 重采 / actview 对比）
- [x] registry + CLI 构建管线（buildRegistry / buildSemanticRegistry）
- [x] 依赖切换为 npm 发布包（actview 生态 + @actview/base-ui@0.1.0，commit 8d2c4d36f）
- [x] 样式源切换为 v4 官方 8 套 + 24 色板主题（commit 501c801ce / 750884dbb / 8a2ece794）

---

## M1 L0 + L1 基础与表单组件（约 35 个）✅ 基本完成

- [x] L0a 基础组件 14 个：alert / aspect-ratio / card / empty / field / kbd / label / message / native-select / pagination / skeleton / spinner / table / textarea / separator
- [x] L1 表单组件 10 个：checkbox / switch / slider / radio-group / progress / toggle / toggle-group / input / direction / input-group
- [x] button 重写（toRefs 模式 + ButtonProps 类型导出）
- [x] golden 对比全绿：L0a 22 用例 + L1 11 用例（golden-diff-l0a / golden-diff-l1）
- [x] 全量回归 108/108 + typecheck + commit（65743a290）

### M1 剩余

- [ ] **增量冻结**：8 个无冻结源的组件（freeze-react-reference 扩展后重采）：
      badge / marker / bubble / item / attachment / breadcrumb / button-group / input-otp
- [ ] 上述 8 个组件迁移（toRefs 模式 + golden 用例）
- [ ] registry.json 增量更新（gen-registry-json.mjs merge 模式）+ styles 重建
- [ ] docs 站组件页补齐（site/components/*.md + examples，当前仅 button/card）

---

## M2 L2 + L3 浮层与菜单组件（约 17 个）

> 最重阶段：先原语（@actview/base-ui 浮层原语）后组件。

- [ ] tooltip（已冻结，直接迁移）
- [ ] popover
- [ ] dialog
- [ ] alert-dialog
- [ ] sheet
- [ ] drawer
- [ ] dropdown-menu
- [ ] context-menu
- [ ] menubar
- [ ] select
- [ ] combobox
- [ ] command
- [ ] hover-card
- [ ] navigation-menu
- [ ] sonner
- [ ] toast
- [ ] message-scroller

---

## M3 L4 复合组件（约 14 个）

- [ ] accordion
- [ ] tabs
- [ ] collapsible
- [ ] avatar
- [ ] calendar
- [ ] carousel
- [ ] chart
- [ ] resizable
- [ ] scroll-area
- [ ] sidebar
- [ ] questionnaire
- [ ] table 增强（如数据表格场景）
- [ ] （其余 L4 组件按冻结清单补充）

---

## M4 Phase 2 examples（62 个）

- [ ] examples 逐批迁移（golden 对比）

---

## M5 Phase 3 blocks（130+）

- [ ] blocks 迁移（跳过 dashboard-01 整块 + 11 个图表卡片 + 2 个 index 引用清理）

---

## M6 收尾 + 文档 + 发布

- [ ] 全量验收（§7 gate 全项）
- [ ] docs/MIGRATION.md §8 风险表更新（移除已修复项）
- [ ] 站点：全部组件页 + 主题切换器最终验收
- [ ] 发布流程（registry 发布 + CLI 验证）

---

## 横切任务（每阶段都要做）

- [ ] 每阶段：DOM golden diff 空 + token 零 + 像素阈值
- [ ] 每阶段：typecheck + 全量测试 + commit（先 commit 再执行）
- [ ] @actview/base-ui 重发布后清理（详见 BUGS.md D 组）：
      移除 dist 临时 patch + golden-normalize 13 项豁免 + tsconfig `@/` 兜底

---

## 明确跳过

- recharts 生态（chart 组件按需再议）
- ai-sdk 生态
- @dnd-kit 生态
