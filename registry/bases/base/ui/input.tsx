// 复刻 shadcn/ui registry/bases/base/ui/input.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/input（<input> 透传 + render prop）
//   - 函数组件 + useProps；class 合并用 computed 惰性追踪
import { Input as InputPrimitive } from "@actview/base-ui/input"
import { computed, useProps } from "@actview/core"
import type { InputHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Input(
  props: InputHTMLAttributes & {
    type?: string
  }
) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      class: undefined,
      className: undefined,
    }
  )

  const mergedClass = computed(() =>
    cn(
      "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      className.value,
      legacyClassName.value
    )
  )

  return (
    <InputPrimitive
      data-slot="input"
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

export { Input }
