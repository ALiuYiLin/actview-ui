// 最小 cn 实现（actview 语义：class 为字符串，合并变体类与用户传入的 class）。
// 等价于 shadcn 里 @/lib/utils 的 cn（去掉 tailwind-merge 依赖）。
export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(" ")
}
