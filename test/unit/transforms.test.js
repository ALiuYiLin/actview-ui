// L1 单元测试：CLI 侧转换器（import 重写 / 图标替换 / 路径解析）
import { describe, it, expect } from "vitest"
import path from "node:path"
import {
  updateImportAliases,
  transformImports,
  transformIcons,
  restoreRegistryImports,
  resolveFilePath,
  resolveNestedFilePath,
} from "../../src/lib/transforms.js"

const config = {
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
}

describe("updateImportAliases", () => {
  it("registry ui → aliases.ui", () => {
    expect(
      updateImportAliases("@/registry/base-mist/ui/separator", config)
    ).toBe("@/components/ui/separator")
  })

  it("registry lib/utils → aliases.utils", () => {
    expect(updateImportAliases("@/registry/base-mist/lib/utils", config)).toBe(
      "@/lib/utils"
    )
  })

  it("registry components → aliases.components", () => {
    expect(
      updateImportAliases(
        "@/registry/base-mist/components/icon-placeholder",
        config
      )
    ).toBe("@/components/icon-placeholder")
  })

  it("外部包路径不改动", () => {
    expect(updateImportAliases("@actview/lucide", config)).toBe(
      "@actview/lucide"
    )
  })
})

describe("transformImports", () => {
  it("重写 import 并记录变更", () => {
    const { transformed, rewrites } = transformImports(
      'import { X } from "@/registry/base-mist/ui/separator"',
      config
    )
    expect(transformed).toContain('from "@/components/ui/separator"')
    expect(rewrites).toEqual([
      {
        from: "@/registry/base-mist/ui/separator",
        to: "@/components/ui/separator",
      },
    ])
  })
})

describe("transformIcons", () => {
  it("IconPlaceholder → 图标组件 + import 注入 + 移除占位 import", () => {
    const source = [
      'import { IconPlaceholder } from "@/registry/base-mist/components/icon-placeholder"',
      '<IconPlaceholder lucide="ChevronDown" tabler="IconChevronDown" />',
    ].join("\n")
    const { transformed, icons } = transformIcons(source, {
      iconLibrary: "lucide",
    })
    expect(icons).toEqual(["ChevronDown"])
    expect(transformed).toContain(
      'import { ChevronDown } from "@actview/lucide"'
    )
    expect(transformed).toContain("<ChevronDown />")
    expect(transformed).not.toContain("IconPlaceholder")
  })

  it("无占位符时原样返回", () => {
    const { transformed, icons } = transformIcons("no icons here", {})
    expect(transformed).toBe("no icons here")
    expect(icons).toEqual([])
  })

  it("缺少 lucide 属性抛错", () => {
    expect(() =>
      transformIcons("<IconPlaceholder foo=\"bar\" />", {})
    ).toThrow(/缺少 lucide 属性/)
  })
})

describe("restoreRegistryImports", () => {
  it("styles 形态 → registry 形态（content 还原）", () => {
    const source = [
      'from "@/styles/base-aurora/ui/separator"',
      'from "@/styles/base-aurora/components/icon-placeholder"',
      'from "@/lib/utils"',
    ].join("\n")
    const out = restoreRegistryImports(source, "base-aurora")
    expect(out).toContain("@/registry/base-aurora/ui/separator")
    expect(out).toContain("@/registry/base-aurora/components/icon-placeholder")
    expect(out).toContain("@/registry/base-aurora/lib/utils")
  })
})

describe("resolveFilePath / resolveNestedFilePath", () => {
  it("registry:ui → aliases.ui 目录，path 中 ui 段截出文件名", () => {
    const { filePath } = resolveFilePath(
      "registry/base-mist/ui/button.tsx",
      "registry:ui",
      config,
      "C:\\proj"
    )
    expect(filePath).toBe(path.join("C:\\proj", "components", "ui", "button.tsx"))
  })

  it("registry:component → aliases.components 目录", () => {
    const { filePath } = resolveFilePath(
      "registry/base-mist/components/icon-placeholder.tsx",
      "registry:component",
      config,
      "C:\\proj"
    )
    expect(filePath).toBe(
      path.join("C:\\proj", "components", "icon-placeholder.tsx")
    )
  })

  it("resolveNestedFilePath：找不到公共段时退回文件名", () => {
    expect(resolveNestedFilePath("registry/x/foo.tsx", "@/components/ui")).toBe(
      "foo.tsx"
    )
  })
})
