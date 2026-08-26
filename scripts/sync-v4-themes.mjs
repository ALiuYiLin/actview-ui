// scripts/sync-v4-themes.mjs —— 从 v4 主项目提取官方主题定义生成 themes.json
// 输入：E:\code3\ui\apps\v4\registry\themes.ts（shadcn v4 THEMES：24 色板）
//       E:\code3\ui\apps\v4\lib\font-definitions.ts（26 种字体）
// 输出：registry/bases/base/themes.json
//   - baseColors：7 个中性基色（全键：background..ring + chart-1~5 + radius + sidebar 全家）
//   - themes：24 个色板（中性 7 个为 18 键子集、彩色 17 个为 9 键叠加层，
//     与 v4 buildTheme(baseColor, theme) 的合并语义一致：基色全量 + 色板覆盖）
//   - fonts：26 种字体（name/title/type/family/import，用于 --font-sans/--font-heading）
//   - radii：5 档圆角（default/none/small/medium/large，v4 RADII）
// 用法：node scripts/sync-v4-themes.mjs（v4 更新后重跑即可）
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const V4_THEMES_TS = "E:/code3/ui/apps/v4/registry/themes.ts"
const V4_FONTS_TS = "E:/code3/ui/apps/v4/lib/font-definitions.ts"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

if (!existsSync(V4_THEMES_TS)) {
  console.error(`❌ 找不到 v4 主题源：${V4_THEMES_TS}`)
  process.exit(1)
}

const src = readFileSync(V4_THEMES_TS, "utf8")

/** 解析一个色板块：name + cssVars.light/dark 的键值对 */
function parsePalette(block) {
  const name = block.match(/name: "([a-z-]+)"/)?.[1]
  if (!name) return null
  const vars = {}
  for (const mode of ["light", "dark"]) {
    const m = block.match(new RegExp(`${mode}: \\{([\\s\\S]*?)\\},?\\s*(dark: \\{|\\})`))
    if (!m) continue
    const entries = {}
    for (const kv of m[1].matchAll(/"?([a-z0-9-]+)"?:\s*"([^"]*)"/g)) {
      entries[kv[1]] = kv[2]
    }
    vars[mode] = entries
  }
  return { name, vars }
}

// 按 `  name: "` 位置切块
const nameRe = /name: "([a-z-]+)",/g
const anchors = []
let m
while ((m = nameRe.exec(src)) !== null) anchors.push({ name: m[1], idx: m.index })

const palettes = []
for (let i = 0; i < anchors.length; i++) {
  const start = anchors[i].idx
  const end = i + 1 < anchors.length ? anchors[i + 1].idx : src.length
  const p = parsePalette(src.slice(start, end))
  if (p) palettes.push(p)
}

const BASE_COLOR_NAMES = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"]

const themes = {}
const baseColors = {}
for (const p of palettes) {
  themes[p.name] = p.vars
  if (BASE_COLOR_NAMES.includes(p.name)) {
    baseColors[p.name] = p.vars
  }
}

// v4 RADII（registry/config.ts）
const radii = {
  default: null,
  none: "0",
  small: "0.45rem",
  medium: "0.625rem",
  large: "0.875rem",
}

// 26 种字体（font-definitions.ts）：name/title/type/family/import
const fonts = []
if (existsSync(V4_FONTS_TS)) {
  const fontSrc = readFileSync(V4_FONTS_TS, "utf8")
  const fontNameRe = /name: "([a-z0-9-]+)",/g
  const fontAnchors = []
  let fm
  while ((fm = fontNameRe.exec(fontSrc)) !== null) {
    fontAnchors.push({ name: fm[1], idx: fm.index })
  }
  for (let i = 0; i < fontAnchors.length; i++) {
    const start = fontAnchors[i].idx
    const end =
      i + 1 < fontAnchors.length ? fontAnchors[i + 1].idx : fontSrc.length
    const fb = fontSrc.slice(start, end)
    const title = fb.match(/title: "([^"]+)"/)?.[1]
    const type = fb.match(/type: "(sans|mono|serif)"/)?.[1]
    const family = fb.match(/family: "([^"]+)"/)?.[1]
    const importName = fb.match(/import: "([^"]+)"/)?.[1]
    if (family && importName) {
      fonts.push({
        name: fontAnchors[i].name,
        title: title ?? fontAnchors[i].name,
        type: type ?? "sans",
        family,
        import: importName,
      })
    }
  }
}

const out = { baseColors, themes, fonts, radii }
const outFile = join(ROOT, "registry", "bases", "base", "themes.json")
writeFileSync(outFile, JSON.stringify(out, null, 2) + "\n", "utf8")

const keys = (o) => Object.keys(o).length
console.log(
  `✅ themes.json 已生成：baseColors ${Object.keys(baseColors).length}（每色 light ${keys(baseColors.neutral?.light ?? {})} 键）、` +
    `themes ${Object.keys(themes).length}、fonts ${fonts.length}、radii ${Object.keys(radii).length} 档`
)
console.log(`   → ${outFile.replace(ROOT + "/", "")}`)
