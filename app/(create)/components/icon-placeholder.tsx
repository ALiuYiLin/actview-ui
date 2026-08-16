// 文档站形态的 IconPlaceholder（styles 产物 import 的解析目标）。
// @actview/lucide 是 lucide 的 actview 适配版（defineComponent 产物）。
// CLI 用户端由 transform-icons 把 <IconPlaceholder lucide="X" /> 替换为
// <X /> 并注入 import，本文件不会分发到用户项目。
import type { HTMLAttributes } from "@actview/jsx"
import { ChevronDown } from "@actview/lucide"

const ICON_COMPONENTS: Record<string, any> = {
  ChevronDown,
}

export function IconPlaceholder(
  props: HTMLAttributes & {
    lucide?: string
    tabler?: string
    hugeicons?: string
    phosphor?: string
    remixicon?: string
  }
) {
  const name = props.lucide ?? "ChevronDown"
  const Icon = ICON_COMPONENTS[name] ?? ChevronDown
  return <Icon />
}
