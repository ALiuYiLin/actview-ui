// migrate-component：React 源组件 → actview 的半自动机械转换（docs/MIGRATION.md §5.6 步骤 2）。
// 机械部分：
//   - 删 "use client"
//   - @base-ui/react/<p> / @shadcn/react/<p> → @actview/base-ui/<p>
//   - @/app/(create)/components/icon-placeholder → @/registry/bases/base/components/icon-placeholder
//   - JSX 属性 className= → class=；style={{ → style={{
//   - import * as React from "react" → 移除 + React.x 用法处插 TODO 映射注释
//   - lucide 图标名映射（ChevronDownIcon → ChevronDown，lucide-react 带 Icon 后缀）
// 人工部分（输出 // TODO(actview) 标记供审查，§3 清单逐项核对）：
//   - useState/useEffect/useRef/useMemo/useCallback/useContext/forwardRef/createPortal
//   - 函数组件 → useProps 形态改写
// 用法：node scripts/migrate-component.mjs <源文件> [目标文件]（默认写到 stdout 旁边同名 .actview.tsx）
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HOOK_TODOS = {
  "React.useState": "useState → ref/reactive（.value 读写）",
  "React.useEffect": "useEffect → watchEffect + onMounted/onUnmounted（清理用 onWatcherCleanup）",
  "React.useRef": "useRef → ref（DOM 引用用 ref 属性）",
  "React.useMemo": "useMemo → computed",
  "React.useCallback": "useCallback → 普通函数（无闭包过期问题）",
  "React.useContext": "useContext → useInjects(key)",
  "React.createContext": "createContext → provide(key, value)",
  "React.forwardRef": "forwardRef → 函数组件直接收 ref prop",
  "React.createElement": "createElement → @actview/jsx createElement",
  "React.Fragment": "Fragment → jsx(Fragment, { children })（ElementType 不含 symbol）",
  "createPortal": "createPortal → <Teleport to=\"body\">",
  "document.createElement": "portal/手动挂载 → Teleport",
}

/** lucide-react 名（*Icon 后缀）→ @actview/lucide 名（无后缀，个别例外在下方 EXCEPTIONS） */
const LUCIDE_EXCEPTIONS = {
  // 如遇个别不对应名称在此补充：lucide-react 名 → @actview/lucide 名
}

export function migrateComponent(source) {
  let out = source

  // 1. "use client" 指令
  out = out.replace(/^(["'])use client\1;?\s*/m, "")

  // 2. 原语包名替换
  out = out.replace(/@base-ui\/react/g, "@actview/base-ui")
  out = out.replace(/@shadcn\/react/g, "@actview/base-ui")

  // 3. app 耦合路径
  out = out.replace(
    /@\/app\/\(create\)\/components\/icon-placeholder/g,
    "@/registry/bases/base/components/icon-placeholder"
  )

  // 4. React 默认导入移除 + 用法处插 TODO
  out = out.replace(/^import \* as React from ["']react["']\s*$/m, "")
  out = out.replace(/^import React from ["']react["']\s*$/m, "")
  for (const [pattern, todo] of Object.entries(HOOK_TODOS)) {
    out = out.replaceAll(pattern, `/* TODO(actview): ${todo} */\n  ${pattern}`)
  }

  // 5. lucide 名映射（"ChevronDownIcon" → "ChevronDown"）
  out = out.replace(/lucide=\{?"([A-Za-z0-9]+)Icon"\}?/g, (_m, name) => {
    const mapped = LUCIDE_EXCEPTIONS[name + "Icon"] ?? name
    return `lucide="${mapped}"`
  })
  out = out.replace(
    /lucide="([A-Za-z0-9]+)Icon"/g,
    (_m, name) => `lucide="${LUCIDE_EXCEPTIONS[name + "Icon"] ?? name}"`
  )

  // 6. JSX 属性 className= → class=（保留别名兼容；解构处由审查改 useProps 双写）
  out = out.replace(/className=\{/g, "class={")

  // 7. 文件头标记
  out = `// TODO(actview): 由 scripts/migrate-component.mjs 机械转换，待人工按 docs/MIGRATION.md §3 核对\n${out}`

  return out
}

// CLI 入口
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [src, dstArg] = process.argv.slice(2)
  if (!src) {
    console.error("用法：node scripts/migrate-component.mjs <源文件> [目标文件]")
    process.exit(1)
  }
  const source = readFileSync(src, "utf8")
  const out = migrateComponent(source)
  const dst = dstArg ?? src.replace(/\.tsx$/, ".actview.tsx")
  writeFileSync(dst, out, "utf8")
  console.log(`转换完成：${src} → ${dst}`)
  console.log("请按 docs/MIGRATION.md §3 清单人工核对 TODO 标记（hooks/ref/Portal/事件/类型）")
}
