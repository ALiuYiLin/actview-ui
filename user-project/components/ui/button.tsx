// 复刻 shadcn/ui registry/bases/base/ui/button.tsx 的结构，框架层 actview：
//   - actview 设计规范：源码层写普通函数组件 + useProps（props 响应式取值），
//     Babel（@actview/plugin-babel 的 defineComponentPlugin）在构建期自动把
//     函数组件转换为 defineComponent 形态——不手写 defineComponent。
//   - useProps 返回 ComputedRef（.value 惰性求值并追踪依赖），解决
//     setup 只执行一次导致的 props 解构快照问题（children/事件更新可达 render）。
//   - className 用 actview 的 class（className 作 React 迁移兼容别名）。
import { useProps } from "@actview/core"
import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-violet-500 bg-violet-50 font-medium transition-opacity duration-300 group/button inline-flex shrink-0",
  {
    variants: {
      variant: {
        default: "bg-violet-500 text-white shadow-lg shadow-violet-500/35",
        outline: "bg-transparent text-violet-500",
        secondary: "bg-violet-100 text-violet-900",
        ghost: "bg-transparent text-violet-900",
        destructive: "bg-rose-500 text-white",
        link: "bg-transparent text-violet-500 underline decoration-wavy",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-[30px] px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button(
  props: ButtonHTMLAttributes & VariantProps<typeof buttonVariants>
) {
  const {
    variant,
    size,
    class: className,
    className: legacyClassName,
    rest,
  } = useProps(props, {
    variant: (v) => v ?? "default",
    size: (v) => v ?? "default",
    class: undefined,
    className: undefined,
  })

  return (
    <button
      data-slot="button"
      class={cn(
        buttonVariants({ variant: variant.value, size: size.value }),
        className.value,
        legacyClassName.value
      )}
      {...rest.value}
    />
  )
}

export { Button, buttonVariants }
