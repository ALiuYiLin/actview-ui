// 复刻 shadcn/ui registry/bases/base/ui/textarea.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref
import { type TextareaHTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Textarea(props: TextareaHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const textareaClassName = computed(() =>
    cn(
      "cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <textarea data-slot="textarea" className={textareaClassName} {...rest} />
  )
}

export { Textarea }
