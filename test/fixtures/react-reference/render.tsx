// React 参考渲染器：vitest + happy-dom 环境内把 React 组件渲染进容器
// （容器形态与 @actview/testing 的 render 一致：div#testing-N append 到 body），
// 供 golden 采集。仅 test 侧使用，不进任何构建产物。
import { createRoot, type Root } from "react-dom/client"
import { flushSync } from "react-dom"

const roots: Root[] = []

export function renderReact(element: React.ReactElement): HTMLElement {
  const container = document.createElement("div")
  const id = "testing-" + roots.length
  container.id = id
  document.body.appendChild(container)
  const root = createRoot(container)
  // React 19 concurrent 渲染：flushSync 强制同步提交（否则 golden 采集时 DOM 为空）
  flushSync(() => root.render(element))
  roots.push(root)
  return container
}

/** 卸载全部 React 容器（测试用例间清理） */
export function cleanupReact(): void {
  for (const root of roots.splice(0)) {
    try {
      root.unmount()
    } catch {
      // 容器可能已被移除，忽略
    }
  }
  document.body.innerHTML = ""
}
