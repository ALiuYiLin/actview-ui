// registry 形态的 IconPlaceholder（build 生成 styles/<style>/components/icon-placeholder.tsx）。
// 图标来自 @actview/lucide（lucide 的 actview 适配版）。
// CLI 用户端由 transform-icons 替换为具体图标组件并注入 import，
// 本文件不会随组件落盘到用户项目（button-group 不再依赖本 item）。
// 规范写法：函数组件 + useProps（Babel 自动转 defineComponent）。
import { useProps } from "@actview/core"
import { createElement } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"
import { ChevronDown } from "@actview/lucide"

const ICON_COMPONENTS: Record<string, any> = {
  ChevronDown,
}

function IconPlaceholder(
  props: HTMLAttributes & {
    lucide?: string
    tabler?: string
    hugeicons?: string
    phosphor?: string
    remixicon?: string
  }
) {
  const { lucide, rest } = useProps(props, { lucide: undefined })

  return (
    <span data-icon="inline-start" {...rest.value}>
      {createElement(ICON_COMPONENTS[lucide.value ?? "ChevronDown"] ?? ChevronDown, {})}
    </span>
  )
}

export { IconPlaceholder }
