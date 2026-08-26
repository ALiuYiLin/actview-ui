// 复刻 shadcn/ui registry/bases/base/ui/separator.tsx（源 commit a85299a），
// 框架层 actview：原语 Separator（@actview/base-ui 单入口具名导出）；
// orientation 默认值用 computed；data-horizontal/data-vertical 由原语
// 状态属性生成（data-orientation 语义一致）
import { Separator as SeparatorPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Separator(props: SeparatorPrimitive.Props) {
  const {
    class: className,
    className: legacyClassName,
    orientation,
    key,
    ...rest
  } = toRefs(props)
  void key
  const orientationValue = computed(() => orientation?.value ?? "horizontal")
  const separatorClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientationValue}
      className={separatorClassName}
      {...rest}
    />
  )
}

export { Separator }
