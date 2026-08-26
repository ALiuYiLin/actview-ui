// L3 集成测试：buildRegistry / buildSemanticRegistry 两条构建管线
import { describe, it, expect } from "vitest"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  ALLOWLIST,
  buildRegistry,
  buildSemanticRegistry,
} from "../../scripts/lib/build-registry.mjs"

const STYLES_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "styles"
)

describe("buildRegistry（路径①：展开产物）", () => {
  it("产物 = 8 style × registry items、无 cn-* 残留（白名单除外）", async () => {
    const written = await buildRegistry({ silent: true })
    const registry = JSON.parse(
      await readFile(
        path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          "..",
          "..",
          "registry",
          "bases",
          "base",
          "registry.json"
        ),
        "utf8"
      )
    )
    expect(written).toHaveLength(registry.items.length * 8)

    for (const file of written) {
      const content = await readFile(path.join(STYLES_ROOT, file), "utf8")
      const residue = (content.match(/\bcn-[a-z0-9-]+\b/g) ?? []).filter(
        (token) => !ALLOWLIST.has(token)
      )
      expect(residue).toEqual([])
    }

    // 8 套官方风格（v4 registry/styles：luma/lyra/maia/mira/nova/rhea/sera/vega）
    // 全部生成产物（风格差异由各自 .style-<name> 作用域规则承担）
    const STYLE_NAMES = [
      "luma",
      "lyra",
      "maia",
      "mira",
      "nova",
      "rhea",
      "sera",
      "vega",
    ]
    const registryStylesRoot = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "registry",
      "styles"
    )
    for (const name of STYLE_NAMES) {
      await expect(
        readFile(path.join(registryStylesRoot, `style-${name}.css`), "utf8")
      ).resolves.toContain(`.style-${name}`)
      // 展开产物：cn-* 占位符已替换为具体类字符串（cn- 残留由上文 verifyTokens 兜底）
      const expanded = await readFile(
        path.join(STYLES_ROOT, `base-${name}`, "ui", "button.tsx"),
        "utf8"
      )
      expect(expanded).toContain("inline-flex")
    }
  })

  it("产物 import 重写正确（原语库 / lib/utils）", async () => {
    await buildRegistry({ silent: true })
    const btn = await readFile(
      path.join(STYLES_ROOT, "base-luma", "ui", "button.tsx"),
      "utf8"
    )
    expect(btn).toContain('from "@actview/base-ui"')
    expect(btn).toContain("@/lib/utils")
    // 组件产物互引路径已重写为 styles 体系（无跨 ui 引用时至少 lib 生效）
    expect(btn).not.toContain("@/registry/")
  })
})

describe("buildSemanticRegistry（路径②：自由切换）", () => {
  it("组件保留 cn-* 语义类，样式表含三套作用域规则", async () => {
    const written = await buildSemanticRegistry({ silent: true })
    expect(written).toContain("styles.css")
    expect(written).toContain("ui/button.tsx")

    // 语义类保留（不展开）
    const btn = await readFile(
      path.join(STYLES_ROOT, "semantic", "ui", "button.tsx"),
      "utf8"
    )
    expect(btn).toMatch(/"cn-button/)
    expect(btn).toContain('"cn-button-variant-default"')
    expect(btn).toContain("@/lib/utils")

    // 作用域样式表：8 套 .style-<name> + .cn-* 规则
    const css = await readFile(
      path.join(STYLES_ROOT, "semantic", "styles.css"),
      "utf8"
    )
    for (const name of [
      "luma",
      "lyra",
      "maia",
      "mira",
      "nova",
      "rhea",
      "sera",
      "vega",
    ]) {
      expect(css).toContain(`.style-${name}`)
    }
    expect(css).toContain(".cn-button")
  })
})
