// 插槽特性 spike：验证 actview 具名插槽的真实 API 与行为。
// 插件（@actview/plugin-babel extractNamedSlots）把 <template slot="x"> 提取为
// slots={{ x: () => <fragment>... } } prop —— 插槽值是"函数返回 fragment vnode"，
// 支持作用域参数（<template slot="x" item> → x: (item) => ...）。
// 背景：评估"render prop 改用插槽实现"的可行性（Base UI useRender 语义）。
import { describe, it, expect, afterEach } from "vitest"
import { render, fireEvent, waitFor, cleanup } from "@actview/testing"
import { ref } from "@actview/core"

afterEach(cleanup)

describe("spike: actview 具名插槽", () => {
  it("基础：<template slot> → props.slots.<name>() 函数投影", () => {
    function Child(props: any) {
      return <div class="child">{props.slots.render()}</div>
    }
    function Parent() {
      return (
        <div>
          <Child>
            <template slot="render">
              <span class="slotted">hello</span>
            </template>
          </Child>
        </div>
      )
    }
    const { container } = render(Parent)
    expect(container.querySelector(".child .slotted")!.textContent).toBe(
      "hello"
    )
  })

  it("响应性：父状态更新 → 插槽函数每次返回新 vnode", async () => {
    const v = ref(1)
    function Child(props: any) {
      return <div class="child">{props.slots.render()}</div>
    }
    function Parent() {
      return (
        <div>
          <Child>
            <template slot="render">
              <span class="slotted">{v.value}</span>
            </template>
          </Child>
          <button class="inc" onClick={() => (v.value += 1)}>
            +
          </button>
        </div>
      )
    }
    const { container } = render(Parent)
    expect(container.querySelector(".slotted")!.textContent).toBe("1")
    fireEvent(container.querySelector(".inc")!, "click")
    await waitFor(() =>
      expect(container.querySelector(".slotted")!.textContent).toBe("2")
    )
  })

  it("作用域插槽：<template slot=x item> → x(item) 传参", () => {
    // 作用域参数由 Babel 插件在构建期提取（裸属性），TS 层无该属性声明：
    // 用 @ts-expect-error 跳过 + 手动声明引用类型
    let item: any = null
    void item
    function Child(props: any) {
      return (
        <div class="child">
          {props.slots.render({ value: 42 })}
        </div>
      )
    }
    function Parent() {
      return (
        <Child>
          {/* @ts-expect-error 裸属性 = 作用域插槽参数（插件提取） */}
          <template slot="render" item>
            <span class="slotted">{item.value}</span>
          </template>
        </Child>
      )
    }
    const { container } = render(Parent)
    expect(container.querySelector(".slotted")!.textContent).toBe("42")
  })

  it("对照：插槽内容是片段投影，子组件无法把自身 props 合并进内容元素", () => {
    // Base UI render prop 语义 = 默认元素 props（type/handlers/data-*）合并进
    // render 目标；插槽只做内容投影——即便子组件拿到 slots.render() 的 vnode，
    // 仍需"克隆 + 合并 props"（即 mergeRenderProps 的活），插槽本身不提供该能力。
    function Child(props: any) {
      return <div class="child">{props.slots.render()}</div>
    }
    function Parent() {
      return (
        <Child>
          <template slot="render">
            <span class="slotted">content</span>
          </template>
        </Child>
      )
    }
    const { container } = render(Parent)
    const slotted = container.querySelector(".slotted")!
    expect(slotted.hasAttribute("type")).toBe(false)
    expect(slotted.tagName).toBe("SPAN")
  })
})
