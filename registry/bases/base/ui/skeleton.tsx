// 复刻 shadcn/ui registry/bases/base/ui/skeleton.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Skeleton(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const skeletonClassName = computed(() =>
    cn("cn-skeleton animate-pulse", className?.value, legacyClassName?.value)
  )

  return <div data-slot="skeleton" className={skeletonClassName} {...rest} />
}

export { Skeleton }
