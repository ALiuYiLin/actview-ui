// 复刻 shadcn/ui registry/bases/base/ui/aspect-ratio.tsx（源 commit a85299a），框架层 actview：
//   - style 用字符串（--ratio 为 CSS 自定义属性，actview style 对象经 Object.assign 写入
//     会丢失自定义属性，字符串走 cssText 正确保留）
import { useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function AspectRatio(
  props: HTMLAttributes & {
    ratio: number
  }
) {
  const { ratio, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      ratio: undefined,
      class: undefined,
      className: undefined,
    }
  )

  return (
    <div
      data-slot="aspect-ratio"
      style={`--ratio: ${ratio.value}`}
      class={cn("relative aspect-(--ratio)", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { AspectRatio }
