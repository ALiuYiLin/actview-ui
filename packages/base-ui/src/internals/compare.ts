// 值相等比较：useProps 派生的对象/数组值每次 .value 访问返回新包装
// （引用不稳定，spike 实证），身份比较（===/!==）永远为真会导致受控
// 同步死循环。跨访问比较一律用 sameValue。
export function sameValue(a: any, b: any): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((v, i) => sameValue(v, b[i]))
    )
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }
  return false
}
