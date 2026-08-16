// actview 图标方案（与 React 生态的"图标库组件注入"不同）：
// 框架 renderer 用 document.createElement（HTML 命名空间），内联 JSX 的 SVG
// 子元素不会以 SVG 命名空间创建、浏览器不渲染。因此图标以 SVG 字符串经
// ref 注入 innerHTML（actview 官方 IconPage 演示方案）。
//
// 本组件作为 registry item（registry:component）随组件一起分发到用户项目，
// CLI 的 transformIcons 阶段相应简化为"确保 icon-placeholder 被依赖安装"。
import type { HTMLAttributes } from "@actview/jsx"

const ICONS: Record<string, string> = {
  "chevron-down":
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
}

export function IconPlaceholder(
  props: HTMLAttributes & { name?: string }
) {
  const name = props.name ?? "chevron-down"

  return (
    <span
      data-icon="inline-start"
      ref={(el: HTMLSpanElement | null) => {
        if (el) {
          el.innerHTML = ICONS[name] ?? ICONS["chevron-down"]
        }
      }}
      style={{ display: "inline-flex", alignItems: "center" }}
    />
  )
}
