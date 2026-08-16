// 复刻 shadcn/ui registry/bases/base/ui/skeleton.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Skeleton(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <div
      data-slot="skeleton"
      class={cn("cn-skeleton animate-pulse", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { Skeleton }
