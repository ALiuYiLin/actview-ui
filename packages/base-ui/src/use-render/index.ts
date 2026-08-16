// 复刻 Base UI useRenderElement 的 render prop 核心：
//   - render 为 vnode：浅克隆并合并 props（元素自身 props 优先；
//     组件传入的 children 覆盖，未传则保留元素自身 children）
//   - render 为组件类型（函数/defineComponent）：createElement 直渲
//   - 无 render：渲染默认标签
import { createElement, isValidElement } from "@actview/jsx"
import type { VNodeChildren } from "@actview/jsx"

export function mergeRenderProps(
  render: any,
  defaultTag: any,
  outProps: Record<string, any>,
  children: VNodeChildren | undefined
): any {
  if (render != null && isValidElement(render)) {
    const el = render as any
    const props: Record<string, any> = { ...outProps, ...el.props }
    if (children !== undefined || props.children == null) {
      props.children = children
    }
    return {
      $$typeof: el.$$typeof,
      type: el.type,
      key: el.key ?? null,
      ref: el.ref ?? null,
      props,
    }
  }
  if (
    render != null &&
    (typeof render === "function" || typeof render === "object")
  ) {
    return createElement(render, outProps, children)
  }
  return createElement(defaultTag, outProps, children)
}
