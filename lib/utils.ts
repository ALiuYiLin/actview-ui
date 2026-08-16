// styles 产物的 import "@/lib/utils" 的解析目标。
// cn = twMerge（token 展开后的类冲突合并，同 shadcn cn 语义）。
import { twMerge } from "tailwind-merge"

export function cn(...inputs: Array<string | undefined | false | null>) {
  return twMerge(inputs.filter(Boolean))
}
