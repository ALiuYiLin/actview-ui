// 复刻 shadcn/ui registry/bases/base/ui/aspect-ratio.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；style 对象内 Ref 不解包
// （unwrapProps 只解顶层），--ratio 用 computed 取活值
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function AspectRatio(props: HTMLAttributes & { ratio: number }) {
  const { class: className, className: legacyClassName, ratio, key, ...rest } =
    toRefs(props)

  void key
  const ratioStyle = computed(() => ({ "--ratio": ratio?.value }) as Record<string, string | number | undefined>)

  return (
    <div
      data-slot="aspect-ratio"
      style={ratioStyle}
      className={cn(
        "relative aspect-(--ratio)",
        className?.value,
        legacyClassName?.value
      )}
      {...rest}
    />
  )
}

export { AspectRatio }
