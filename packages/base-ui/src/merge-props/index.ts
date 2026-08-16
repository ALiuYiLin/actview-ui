// 复刻 @base-ui/react/merge-props 语义（DOM 契约对齐的基石）：
//   - 后参数覆盖前参数（undefined 值跳过）
//   - on* 事件函数链式合并：先注册的先执行（Base UI 顺序）
//   - makeEventPreventable：为事件挂 baseUIHandlerPrevented 标记与
//     preventBaseUIHandler()（Button 等原语的 keydown 拦截依赖它）
type AnyRecord = Record<string, any>

function isEventHandlerKey(key: string): boolean {
  return key.length > 2 && key.startsWith("on")
}

export function mergeProps(
  ...sources: (AnyRecord | undefined | null)[]
): AnyRecord {
  const result: AnyRecord = {}
  for (const source of sources) {
    if (!source) continue
    for (const key of Object.keys(source)) {
      const value = source[key]
      if (value === undefined) continue
      const existing = result[key]
      if (
        isEventHandlerKey(key) &&
        typeof value === "function" &&
        typeof existing === "function"
      ) {
        const first = existing
        const second = value
        result[key] = function merged(this: any, ...args: any[]) {
          first.apply(this, args)
          second.apply(this, args)
        }
      } else {
        result[key] = value
      }
    }
  }
  return result
}

export function makeEventPreventable(event: any): any {
  Object.defineProperty(event, "baseUIHandlerPrevented", {
    configurable: true,
    value: false,
    writable: true,
  })
  Object.defineProperty(event, "preventBaseUIHandler", {
    configurable: true,
    value() {
      event.baseUIHandlerPrevented = true
    },
  })
  return event
}
