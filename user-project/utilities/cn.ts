// 最小 cn 实现（等价于 shadcn 里 @/lib/utils 的 cn）。
// 不需要真实依赖，只要生成的产物字符串能对应上即可。
export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(" ")
}
