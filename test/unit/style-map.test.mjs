// L1 单元测试：build 侧纯函数（createStyleMap / transformStyleMap /
// rewriteRegistryImports / verifyTokens）
import { describe, it, expect } from "vitest"
import {
  createStyleMap,
  transformStyleMap,
  rewriteRegistryImports,
  verifyTokens,
} from "../../scripts/lib/build-registry.mjs"

describe("createStyleMap", () => {
  it("提取 .cn-* 规则块内 @apply 的值", () => {
    const map = createStyleMap(`
      /* 注释应被忽略 */
      .cn-button { @apply inline-flex items-center; }
      .cn-button-variant-default { @apply bg-emerald-500 text-white; }
    `)
    expect(map["cn-button"]).toBe("inline-flex items-center")
    expect(map["cn-button-variant-default"]).toBe("bg-emerald-500 text-white")
  })

  it("多个 @apply 合并，无 @apply 回退到普通声明", () => {
    const map = createStyleMap(`
      .cn-a { @apply x-1; @apply y-2; }
      .cn-b { color: red; }
    `)
    expect(map["cn-a"]).toBe("x-1 y-2")
    expect(map["cn-b"]).toBe("color: red;")
  })
})

describe("transformStyleMap", () => {
  it("贪婪匹配替换全部 token（cn-button-variant 不被 cn-button 截断）", () => {
    const source = 'cva("cn-button cn-button-variant-default")'
    const map = {
      "cn-button": "base-cls",
      "cn-button-variant-default": "solid-cls",
    }
    expect(transformStyleMap(source, map)).toBe('cva("base-cls solid-cls")')
  })

  it("未定义 token：与源 transform-style-map 一致——移除；白名单保留", () => {
    // 语义对齐源 shadcn（build-registry.mjs ALLOWLIST）：
    //   非白名单未定义 token → 移除（样式已内联在组件类字符串里）
    //   白名单（CSS 选择器/应用级 token）→ 保留原样
    expect(transformStyleMap('"cn-missing"', {})).toBe('""')
    expect(transformStyleMap('"cn-font-heading"', {})).toBe('"cn-font-heading"')
    expect(transformStyleMap('"cn-rtl-flip"', {})).toBe('"cn-rtl-flip"')
  })
})

describe("rewriteRegistryImports", () => {
  it("ui 互引 / lib/utils / icon-placeholder 三类路径重写", () => {
    const source = [
      'from "@/registry/bases/base/ui/separator"',
      'from "@/registry/bases/base/lib/utils"',
      'from "@/app/(create)/components/icon-placeholder"',
    ].join("\n")
    const out = rewriteRegistryImports(source, "base-luma")
    expect(out).toContain("@/styles/base-luma/ui/separator")
    expect(out).toContain("@/lib/utils")
    expect(out).toContain("@/styles/base-luma/components/icon-placeholder")
  })
})

describe("verifyTokens", () => {
  it("无残留不抛错；残留 cn-* 抛错", () => {
    expect(() => verifyTokens("f.tsx", "clean content")).not.toThrow()
    expect(() => verifyTokens("f.tsx", '"cn-button" 残留')).toThrow(/残留/)
  })
})
