// 文档站形态的 IconPlaceholder（styles 产物 import 的解析目标）。
// @actview/lucide 是 lucide 的 actview 适配版（defineComponent 产物）。
// CLI 用户端由 transform-icons 把 <IconPlaceholder lucide="X" /> 替换为
// <X /> 并注入 import，本文件不会分发到用户项目。
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
