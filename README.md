# actview-ui：shadcn build-registry 最小复刻

在 **一个 button 组件** 上复刻 shadcn/ui 的两段流水线：

## 第一段：base × style → 注册表产物（构建侧）

```
base 只写一次骨架（cn-* 语义占位符）
        │
        ├─ style-aurora.css ──► styles/base-aurora/ui/button.tsx
        ├─ style-ember.css  ──► styles/base-ember/ui/button.tsx
        └─ style-mist.css   ──► styles/base-mist/ui/button.tsx
```

## 第二段：注册表产物 → 用户本地（安装侧）

```
user-config.json（aliases 配置） + styles/base-<style>/ui/button.tsx
        │
        └─► user-project/components/ui/button.tsx
            （路径由 aliases.ui 决定，import 按 aliases.utils 重写）
```

## 目录结构

```
registry/
  bases/base/ui/button.tsx    # 源头：cva + cn-* 占位符（复刻 shadcn 结构）
  bases/base/lib/utils.ts     # 最小 cn()
  styles/style-aurora.css     # 3 套自定义样式（@apply tailwind 形式，同 shadcn 原版）
  styles/style-ember.css
  styles/style-mist.css
scripts/
  build.mjs                   # 第一段：base + style → styles/<style>/ui/button.tsx
  install.mjs                 # 第二段：styles 产物 → 用户本地项目
user-config.json              # 模拟用户 components.json（utils 故意配成 @/utilities/cn）
styles/                       # 第一段产物
  base-aurora/ui/button.tsx
  base-ember/ui/button.tsx
  base-mist/ui/button.tsx
user-project/                 # 第二段产物（脚本生成）
  components/ui/button.tsx
```

## 复刻点对照（对应真实 shadcn 代码）

### 第一段 scripts/build.mjs

| 本仓库 | shadcn/ui 原版 | 差异 |
|---|---|---|
| `createStyleMap(css)` | `packages/shadcn/src/styles/create-style-map.ts`（postcss 提取 `@apply` 值） | 正则提取 `.cn-*` 规则块内 `@apply` 的值（同 `extractTailwindClasses` 语义） |
| `transformStyleMap(source, map)` | `packages/shadcn/src/styles/transform-style-map.ts`（ts-morph AST 遍历 cva） | 正则贪婪匹配替换字符串中的 `cn-*` token |
| `rewriteRegistryImports(source)` | `apps/v4/scripts/build-registry.mts` 的 `copyUIToStyles` | `@/registry/bases/base/` → `@/` |

### 第二段 scripts/install.mjs

| 本仓库 | shadcn/ui 原版 |
|---|---|
| `getUserConfig()` | `packages/shadcn/src/utils/get-config.ts`（读 components.json） |
| `resolveFilePath()` | `packages/shadcn/src/utils/updaters/update-files.ts`（type → 目标目录，path 公共段截取文件名） |
| `transformImports()` | `packages/shadcn/src/utils/transformers/transform-import.ts`（`@/registry/...` → 用户 aliases） |
| 内容相同则 skip | `update-files.ts` 的 `isContentSame` 逻辑 |

## 运行

```bash
# 第一段：生成 3 套 styles/base-<style>/ui/button.tsx
node scripts/build.mjs

# 第二段：模拟用户 add 组件
node scripts/install.mjs --style base-aurora      # action: create
node scripts/install.mjs --style base-aurora      # action: skip（内容相同）
node scripts/install.mjs --style base-ember       # action: overwrite
```

### 第二段的真实链路还原

真实 `button.json` 分发给用户的 `content` 里 import 是 **registry 形态**
（`@/registry/base-nova/lib/utils`），styles 产物则是文档站重写过（`@/lib/utils`）的。
install.mjs 会先把 `@/lib/utils` 还原成 `@/registry/<style>/lib/utils`，
再走 `transformImports` —— 与真实 CLI 行为一致：

```
"@/registry/base-aurora/lib/utils"  ──aliases.utils──►  "@/utilities/cn"
"registry/base-aurora/ui/button.tsx" ──type+aliases.ui─►  user-project/components/ui/button.tsx
```

## 验证目标

- 第一段：每个 `cn-*` token 都能逐字对应回各自的 style 定义（`@apply` 后的 tailwind 类），3 份产物互不相同。
- 第二段：组件按用户配置落到本地路径，import 按用户 aliases 重写，
  内容相同则 skip、不同则 overwrite。

生成物的 className 是 tailwind 类字符串，与 shadcn 原版产物形态一致；
只验证字符串级对应关系 —— 这正是 shadcn「base 写行为骨架、style 决定外观、
CLI 按用户配置落地」的核心机制。
