// 复刻 shadcn/ui registry/bases/base/ui/label.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
import { useProps } from "@actview/core"
import type { LabelHTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Label(props: LabelHTMLAttributes) {
  // htmlFor（React 语义）需映射为原生 for 属性：actview 不会把 htmlFor 自动
  // 转成 for（会渲染成 htmlfor），显式转换保证 DOM 与 React 一致。
  const { htmlFor, for: forAttr, class: className, className: legacyClassName, rest } =
    useProps(props, {
      htmlFor: undefined,
      for: undefined,
      class: undefined,
      className: undefined,
    })

  return (
    <label
      data-slot="label"
      for={htmlFor.value ?? forAttr.value}
      class={cn(
        "cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export { Label }
