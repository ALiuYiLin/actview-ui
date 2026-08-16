// 复刻 shadcn/ui registry/bases/base/ui/spinner.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
//   - IconPlaceholder 直接渲染 <svg>（与源一致），角色/标签铺到 svg 上
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"
import { cn } from "@/registry/bases/base/lib/utils"

function Spinner(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <IconPlaceholder
      lucide="Loader2Icon"
      tabler="IconLoader"
      hugeicons="Loading03Icon"
      phosphor="SpinnerIcon"
      remixicon="RiLoaderLine"
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      class={cn("size-4 animate-spin", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { Spinner }
