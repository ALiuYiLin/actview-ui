// registry 形态的 IconPlaceholder：把源组件的 lucide="XxxIcon" 映射到
// @actview/lucide 的 XxxIcon 组件并直接渲染 <svg>（与源 apps/v4 的 IconPlaceholder
// 在 iconLibrary=lucide 时的行为一致：无包裹元素，props 直接铺到 svg 上）。
// CLI 用户端由 transform-icons 替换为具体图标组件并注入 import，
// 本文件不会随组件落盘到用户项目。
// 规范写法：函数组件 + useProps（Babel 自动转 defineComponent）。
import { computed, useProps } from "@actview/core"
import { jsx } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  MoreHorizontalIcon,
} from "@actview/lucide"

const ICON_COMPONENTS: Record<string, any> = {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  Loader2Icon,
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
  // 各 icon library 名全部解构出 rest，避免 tabler/hugeicons/phosphor/remixicon
  // 等占位属性透传到 svg DOM（React 版 stub 同样只透传 svg props）
  const { lucide, rest } = useProps(props, {
    lucide: undefined,
    tabler: undefined,
    hugeicons: undefined,
    phosphor: undefined,
    remixicon: undefined,
  })

  const icon = computed(
    () => ICON_COMPONENTS[lucide.value ?? "ChevronDownIcon"] ?? ChevronDownIcon
  )

  return jsx(icon.value, rest.value)
}

export { IconPlaceholder }
