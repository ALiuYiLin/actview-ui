// 复刻 shadcn/ui registry/bases/base/ui/label.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref
import { type LabelHTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Label(props: LabelHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const labelClassName = computed(() =>
    cn(
      "cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
      className?.value,
      legacyClassName?.value
    )
  )

  return <label data-slot="label" className={labelClassName} {...rest} />
}

export { Label }
