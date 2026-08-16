// 复刻 shadcn/ui registry/bases/base/ui/textarea.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { TextareaHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Textarea(props: TextareaHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <textarea
      data-slot="textarea"
      class={cn(
        "cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export { Textarea }
