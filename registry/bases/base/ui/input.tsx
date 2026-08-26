// 复刻 shadcn/ui registry/bases/base/ui/input.tsx（源 commit a85299a），
// 框架层 actview：原语 Input（@actview/base-ui 单入口具名导出）；
// InputPrimitive.Props 缺 input 专属键（type/placeholder 等，port 类型
// 基于通用 HTMLAttributes），Omit 叠加 InputHTMLAttributes 补全（避免
// style/className 等交集冲突：port 侧为函数形态）
import { Input as InputPrimitive } from "@actview/base-ui"
import { type InputHTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

type InputProps = InputPrimitive.Props &
  Omit<InputHTMLAttributes, keyof InputPrimitive.Props>

function Input(props: InputProps) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const inputClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  // rest cast：port 原语 Props 类型缺 input 专属键且 style/className 为
  // 函数形态，与通用属性交集不可满足；运行时接受全部透传属性
  return (
    <InputPrimitive
      data-slot="input"
      className={inputClassName}
      {...(rest as Record<string, unknown>)}
    />
  )
}

export { Input }
