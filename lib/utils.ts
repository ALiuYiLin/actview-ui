// styles 产物的 import "@/lib/utils" 的解析目标。
// 真实 shadcn 中，文档站与用户项目都持有各自的 lib/utils（由 init 安装）。
// 最小 cn 实现（等价于 shadcn 里 @/lib/utils 的 cn）。
export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(" ")
}
