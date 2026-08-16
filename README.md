# actview-ui：shadcn build-registry 最小复刻

在 **button、separator、button-group 三个组件** 上复刻 shadcn/ui 的两段流水线。
`button-group` 是"稍微复杂"的组件：跨 item 依赖（separator）、6 个新 token、
IconPlaceholder 图标占位符 —— 把依赖树解析与图标替换两条机制都跑通。

## 第一段：base × style → 注册表产物（构建侧）

```
registry/bases/base/registry.json（item 清单 + registryDependencies）
        │
        ├─ style-aurora.css ──► styles/base-aurora/{ui/button.tsx, ui/separator.tsx, ui/button-group.tsx}
        ├─ style-ember.css  ──► styles/base-ember/...
        └─ style-mist.css   ──► styles/base-mist/...
```

## 第二段：注册表产物 → 用户本地（安装侧）

```
user-project/user-config.json（aliases + iconLibrary） + styles/base-<style>/**
        │
        └─► user-project/components/ui/{separator.tsx, button-group.tsx}
            （依赖树解析：separator 先装；import 按 aliases 重写；
              IconPlaceholder → lucide 图标）

## 目录结构

```
app/(create)/components/
  icon-placeholder.tsx        # IconPlaceholder 占位组件（用户端被 transform-icons 替换）
registry/
  bases/base/
    registry.json             # item 清单：button / separator / button-group（依赖 separator）
    ui/button.tsx             # 源头：cva + cn-* 占位符（复刻 shadcn 结构）
    ui/separator.tsx          # 源头：被 button-group 依赖
    ui/button-group.tsx       # 源头：跨 item 引用 + 6 个新 token + IconPlaceholder
    lib/utils.ts              # 最小 cn()
  styles/style-aurora.css     # 3 套自定义样式（@apply tailwind 形式，同 shadcn 原版）
  styles/style-ember.css
  styles/style-mist.css
scripts/
  build.mjs                   # 第一段：base + style → styles/<style>/ui/button.tsx
  install.mjs                 # 第二段：styles 产物 → 用户本地项目
package.json                  # react / class-variance-authority / typescript
tsconfig.json                 # paths: "@/*" → ["./*", "./user-project/*"]
lib/utils.ts                  # styles 产物 import "@/lib/utils" 的解析目标
styles/                       # 第一段产物
  base-aurora/ui/button.tsx
  base-ember/ui/button.tsx
  base-mist/ui/button.tsx
user-project/                 # 第二段产物（脚本生成）
  user-config.json            # 模拟用户 components.json（utils 故意配成 @/utilities/cn）
  components/ui/button.tsx
  utilities/cn.ts             # install.mjs 模拟 init 安装的 utils
```

## 复刻点对照（对应真实 shadcn 代码）

### 第一段 scripts/build.mjs（registry 驱动）

| 本仓库 | shadcn/ui 原版 | 差异 |
|---|---|---|
| `registry/bases/base/registry.json` | `registry/bases/<base>/registry.ts`（item 清单） | JSON 代替 TS |
| `createStyleMap(css)` | `packages/shadcn/src/styles/create-style-map.ts`（postcss 提取 `@apply` 值） | 正则提取 `.cn-*` 规则块内 `@apply` 的值（同 `extractTailwindClasses` 语义） |
| `transformStyleMap(source, map)` | `packages/shadcn/src/styles/transform-style-map.ts`（ts-morph AST 遍历 cva） | 正则贪婪匹配替换字符串中的 `cn-*` token |
| `rewriteRegistryImports(source)` | `apps/v4/scripts/build-registry.mts` 的 `copyUIToStyles` | `@/registry/bases/base/ui/` → `@/styles/base-<style>/ui/`、`lib/utils` → `@/lib/utils` |

### 第二段 scripts/install.mjs

| 本仓库 | shadcn/ui 原版 |
|---|---|
| `resolveRegistryTree()` | `packages/shadcn/src/registry/resolver.ts`（BFS registryDependencies，visited 去重，依赖在前） |
| `getUserConfig()` | `packages/shadcn/src/utils/get-config.ts`（读 components.json） |
| `resolveFilePath()` | `packages/shadcn/src/utils/updaters/update-files.ts`（type → 目标目录，path 公共段截取文件名） |
| `transformImports()` | `packages/shadcn/src/utils/transformers/transform-import.ts`（`@/registry/...` → 用户 aliases） |
| `transformIcons()` | `packages/shadcn/src/utils/transformers/transform-icons.ts`（IconPlaceholder → 图标库组件 + import 注入） |
| 内容相同则 skip | `update-files.ts` 的 `isContentSame` 逻辑 |

## 运行

```bash
npm install                      # 安装 react / cva / lucide-react / typescript（tsc 验证用）

# 第一段：生成 3 套 styles/base-<style>/**（9 个文件）
node scripts/build.mjs

# 第二段：模拟用户 add 组件（依赖树解析 + import 重写 + 图标替换）
node scripts/install.mjs --item button-group --style base-aurora   # 装 separator + button-group
node scripts/install.mjs --item button-group --style base-ember    # 同一套路径 → overwrite
node scripts/install.mjs --item button --style base-mist           # 单组件无依赖

# 全量类型检查（所有 tsx 零报错）
npx tsc --noEmit
```

install.mjs 还会把 base 的最小 `cn` 落到用户项目的 `aliases.utils` 路径
（`user-project/utilities/cn.ts`），模拟 shadcn init 安装 utils 的行为，
保证 `import { cn } from "@/utilities/cn"` 有真实的解析目标。

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
