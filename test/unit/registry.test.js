// L1 单元测试：依赖树解析与 registry 加载
import { describe, it, expect } from "vitest"
import { resolveRegistryTree, loadRegistry } from "../../src/lib/registry.js"

const registry = {
  items: [
    { name: "a", files: [] },
    { name: "b", registryDependencies: ["a"], files: [] },
    { name: "c", registryDependencies: ["b"], files: [] },
  ],
}

describe("resolveRegistryTree", () => {
  it("依赖在前拓扑序", () => {
    expect(resolveRegistryTree(registry, "c").map((i) => i.name)).toEqual([
      "a",
      "b",
      "c",
    ])
  })

  it("无依赖组件返回自身", () => {
    expect(resolveRegistryTree(registry, "a").map((i) => i.name)).toEqual(["a"])
  })

  it("环检测抛错", () => {
    const cyclic = {
      items: [
        { name: "a", registryDependencies: ["b"], files: [] },
        { name: "b", registryDependencies: ["a"], files: [] },
      ],
    }
    expect(() => resolveRegistryTree(cyclic, "a")).toThrow(/循环依赖/)
  })

  it("依赖不存在抛错（含来源）", () => {
    const broken = {
      items: [{ name: "a", registryDependencies: ["missing"], files: [] }],
    }
    expect(() => resolveRegistryTree(broken, "a")).toThrow(/不在 registry/)
  })

  it("目标组件不存在抛错", () => {
    expect(() => resolveRegistryTree(registry, "nope")).toThrow(/不存在组件/)
  })
})

describe("loadRegistry", () => {
  it("真实 registry 可加载且 items 齐备", async () => {
    const r = await loadRegistry()
    expect(r.items.map((i) => i.name)).toEqual(
      expect.arrayContaining([
        "button",
        "icon-placeholder",
        "utils",
      ])
    )
  })
})
