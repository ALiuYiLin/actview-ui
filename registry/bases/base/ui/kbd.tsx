// 复刻 shadcn/ui registry/bases/base/ui/kbd.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Kbd(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const kbdClassName = computed(() =>
    cn(
      "cn-kbd pointer-events-none inline-flex items-center justify-center select-none",
      className?.value,
      legacyClassName?.value
    )
  )

  return <kbd data-slot="kbd" className={kbdClassName} {...rest} />
}

function KbdGroup(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const groupClassName = computed(() =>
    cn("cn-kbd-group inline-flex items-center", className?.value, legacyClassName?.value)
  )

  return <kbd data-slot="kbd-group" className={groupClassName} {...rest} />
}

export { Kbd, KbdGroup }
