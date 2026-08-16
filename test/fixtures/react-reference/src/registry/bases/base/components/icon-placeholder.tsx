// React 参考 harness 的 IconPlaceholder stub：把源组件的 lucide="XxxIcon" 映射到
// lucide-react 的 XxxIcon 组件，并直接渲染 <svg>（源 apps/v4 的 IconPlaceholder 在
// iconLibrary=lucide 时渲染 <IconLucide name={...} {...props}/>，即直接渲染 svg，
// 无包裹元素）。本 stub 复刻该行为，保证 golden DOM 与 @actview/lucide 侧一致。
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  MoreHorizontalIcon,
} from "lucide-react"

const ICON_COMPONENTS: Record<string, any> = {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  Loader2Icon,
}

export function IconPlaceholder({
  lucide,
  tabler,
  hugeicons,
  phosphor,
  remixicon,
  ...props
}: {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
} & React.ComponentProps<"svg">) {
  const Icon = ICON_COMPONENTS[lucide ?? "ChevronDownIcon"] ?? ChevronDownIcon
  return <Icon {...props} />
}
