// cn：合并变体类与用户传入的 class（actview 语义：class 为字符串）。
// 用 tailwind-merge 解决 token 展开后的类冲突（如基类 bg-emerald-500/10
// 与 variant 类 bg-emerald-500 并存时，后者需覆盖前者）。
// 等价于 shadcn 里 @/lib/utils 的 cn = twMerge(clsx(...)) 的最小版。
import { twMerge } from "tailwind-merge"

export function cn(...inputs: Array<string | undefined | false | null>) {
  return twMerge(inputs.filter(Boolean))
}
