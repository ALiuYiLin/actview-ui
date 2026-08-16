// 复刻 shadcn/ui registry/bases/base/ui/kbd.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
//   - KbdGroup 源码渲染 <kbd>（与源一致，保留 DOM 契约）
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Kbd(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <kbd
      data-slot="kbd"
      class={cn(
        "cn-kbd pointer-events-none inline-flex items-center justify-center select-none",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

function KbdGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <kbd
      data-slot="kbd-group"
      class={cn("cn-kbd-group inline-flex items-center", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { Kbd, KbdGroup }
