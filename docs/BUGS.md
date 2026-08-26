# @actview/base-ui@0.1.0 移植缺陷（TODO 清单）

> 这些是 Base UI → ActView 移植库（@actview/base-ui@0.1.0）与 React 参考之间的已知差异，
> 全部已在消费方（actview-ui）用临时 workaround 兜底（**D 组是修复后必须移除的清理清单**）。
>
> 修复方式：在 @actview/base-ui 源码仓库修复 → 重新发布 → 回到本仓库执行 D 组清理。
> 每项完成请将 `[ ]` 改为 `[x]`。

---

## A. 类型系统（d.ts）

- [ ] **A1. build/*.d.ts 残留 `@/` 内部别名（386 处）**
  - 现象：tsgo 构建不解析 paths，发布物 build/*.d.ts 保留 `@/` 相对内部 import，
    消费方解析不到 → 组件 Props 类型链断裂（如 `Button.Props` 退化为仅自身声明的 6 个键）
  - 修复：d.ts 改为相对路径
  - 验证：消费方 `Button.Props` 含完整 HTMLButtonAttributes 继承键；移除 tsconfig 兜底后 typecheck 仍干净
- [ ] **A2. `Input` 的 Props 类型缺 input 专属键**
  - 现象：InputProps 无 `type` / `placeholder` 等 InputHTMLAttributes 键（d.ts 中 Input: any 兜底）
  - 影响：输入型组件（input / input-group / native-select 等）被迫 `Omit + as Record` 强转
  - 修复：InputProps 继承 InputHTMLAttributes
  - 验证：`<Input type="password" placeholder="x" />` 类型通过，移除 `rest as Record<string, unknown>` 强转

---

## B. 渲染缺陷（运行时丢内容/丢样式）

- [ ] **B1. ToggleGroup 非 Toolbar 场景丢 className/style**
  - 现象：ToggleGroup 在无 Toolbar 上下文中走 pv（ComponentPart）分支，
    className/style 硬编码 `void 0` → 整个组件的类与内联样式丢失
  - 修复：pv 分支透传 className/style（或删除 pv 分支）
  - 验证：`<ToggleGroup className="custom" style={{...}}>` 渲染出 class/style 属性
- [ ] **B2. Toggle 在 ToggleGroup 内漏传 children**
  - 现象：Toggle 处于 group 中时经 uf（CompositeItem）分支渲染，children 未透传 → 内容空白
  - 修复：uf 调用补 `children: e.children`
  - 验证：ToggleGroupItem 内文本正常渲染

---

## C. DOM / 状态泄漏（与 React 参考不一致）

> 每一项都对应 test/fixtures/golden-normalize.ts 中的一条豁免（见该文件头注释），
> 修复后豁免即可删除（D3）。

- [ ] **C1. ComponentPart 内部属性泄漏到 DOM**
  - 现象：`tag` / `state` / `stateattributesmapping` / `metadata` 作为属性出现在渲染结果
  - 验证：渲染结果无这 4 个属性（golden 豁免 #1 移除）
- [ ] **C2. visuallyHidden 样式缺 height / margin / width**
  - 现象：隐藏元素（sr-only）样式集不完整（React 参考含 full width/height/margin）
  - 验证：golden 豁免 #2 移除（sr-only 样式对齐）
- [ ] **C3. composite 项 highlightedIndex 未初始化**
  - 现象：选中项 tabindex 恒为 -1（React 参考高亮项为 0）
  - 验证：`[data-slot=radio-group-item][aria-checked=true]` / toggle-group-item 的 tabindex=0（豁免 #3 移除）
- [ ] **C4. Slider.Root 未消费 min / max / thumbAlignment**
  - 现象：这 3 个 prop 泄漏到根元素 DOM 属性
  - 验证：`[data-slot=slider]` 根无 max/min/thumbalignment 属性（豁免 #4 移除）
- [ ] **C5. Slider.Thumb 索引与隐藏 input 状态缺失**
  - 现象：data-index 恒 -1；隐藏 input 缺 value / aria-valuenow / aria-valuetext
  - 验证：slider-thumb data-index 为实际序号；隐藏 input 含完整 ARIA 值（豁免 #10/#13 移除）
- [ ] **C6. Toggle stateAttributesMapping 未应用（pressed 裸属性）**
  - 现象：`pressed` 作为裸属性输出，应为 `data-pressed`
  - 验证：Toggle 渲染无 `pressed` 属性、有 `data-pressed`（豁免 #6 移除）
- [ ] **C7. undefined 样式值渲染为字面量 `"undefined"`**
  - 现象：如 writingMode 等样式值为 undefined 时输出 `style="writing-mode: undefined"`
  - 验证：样式串无 `undefined` 字面量（豁免 #12 移除）
- [ ] **C8. ToggleGroupItem 的 button 缺 aria-disabled**
  - 现象：React 参考输出 aria-disabled="false"，移植输出缺失
  - 验证：toggle-group-item 的 button 含 aria-disabled（豁免 #7 移除）
- [ ] **C9. Slider.Indicator 缺 data-base-ui-slider-indicator**
  - 现象：slider-range 元素缺该数据属性（React 参考有）
  - 验证：slider-range 含 data-base-ui-slider-indicator（豁免 #8 移除）
- [ ] **C10. ToggleGroupItem 的 value 泄漏到 DOM**
  - 现象：value 作为属性出现在渲染结果（React 参考无）
  - 验证：toggle-group-item 无 value 属性（豁免 #9 移除）
- [ ] **C11. 布尔属性差异（checked/disabled/required/readonly）**
  - 现象：input property true 时 React 参考输出 `attr=""`，移植不输出
  - 验证：checkbox/input 的布尔属性形态对齐（豁免 #5 移除）

---

## D. 修复后清理清单（@actview/base-ui 重发布后执行）

> 全部移除后：全量测试 + `pnpm test:react-ref` 重采 golden + `pnpm test` 对比应仍全绿。

- [ ] **D1. 移除 tsconfig.json 的 `@/` 兜底 paths**
      （`"./node_modules/@actview/base-ui/build/*"` 候选，A1 修复后删）
- [ ] **D2. 移除 node_modules dist 临时 patch**
      （ToggleGroup children 分支 + Toggle children 透传，B1/B2 修复后删；
       注意 dist 为 LF 行尾，恢复方式：`npm pack @actview/base-ui@0.1.0` + tar 解包）
- [ ] **D3. 移除 golden-normalize.ts 全部 13 项豁免**
      （对应 C1~C11 + svg.lucide 跳过 + sr-only 补全；B/C 组全部勾选后删）
- [ ] **D4. 移除 site/.vitepress 中因 A/B 组 workaround 产生的注释与强转**
      （Input 的 `as Record<string, unknown>`、theme 目录 css import 的 @ 别名 workaround）
- [ ] **D5. 重采 React 参考 golden + 全量回归 + commit**
      （`pnpm test:react-ref` → `pnpm test` → typecheck → docs 站 site:build）

---

## E. 消费方已知缺口（非 @actview/base-ui 缺陷，记录备查）

> 这些不是 port bug，而是 actview 生态尚未提供的能力，迁移时显式解构剔除
> （组件内 `void render`），不参与 golden 对比（用例不带 render prop）。

- [ ] **E1. `render` prop（React useRender 的 as-child 换标签）未移植**
  - 涉及组件：Badge / Marker / Item / BubbleContent / ButtonGroupText /
    BreadcrumbLink / AttachmentTrigger（7 个静态组件的 useRender）
  - 原因：actview 无 useRender 等价物；`render={<a/>}` 等换标签用法暂不可用
  - 修复方向：actview 提供 as-child 原语后，为这 7 个组件补 render 支持并加 golden 用例
  - 验证：组件文件里仍有 `void render` 标记（移除后即修复）

---

## 备注

- 临时 patch 位置：`node_modules/.pnpm/@actview+base-ui@0.1.0_@act_*…/node_modules/@actview/base-ui/dist/index.mjs`
  （已 gitignore，不入库；文件内标记 `PATCHED(actview-ui M1 temp)`）
- normalize 豁免清单：`test/fixtures/golden-normalize.ts` 头部注释（⚠️ 待 port 修复后移除）
- M 系列整体进度见 docs/PLAN.md
