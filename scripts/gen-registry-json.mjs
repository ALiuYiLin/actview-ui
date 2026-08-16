// gen-registry-json：从源 _registry.ts 解析 item 清单（name/type/files/registryDependencies），
// 按跳过清单过滤 + import 扫描推导 dependencies，合并进目标 registry.json。
// 默认只收录"目标文件已存在"的 item（增量构建）；--all 输出全部（inventory 核对用，
// 不直接覆盖 registry.json）。
// 用法：
//   node scripts/gen-registry-json.mjs            # 增量合并写 registry.json（保留既有扩展字段）
//   node scripts/gen-registry-json.mjs --check    # 校验目标 registry.json 与源清单一致（跳过清单除外）
//   node scripts/gen-registry-json.mjs --all      # 打印全部 item 清单（含未迁移）
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_REPO = "E:\\code3\\ui"
const BASE_SRC = path.join(SOURCE_REPO, "apps", "v4", "registry", "bases", "base")
const TARGET_ROOT = path.join(ROOT, "registry", "bases", "base")
const REGISTRY_JSON = path.join(TARGET_ROOT, "registry.json")

// 跳过清单（docs/MIGRATION.md §1 跳过规则）：recharts/ai-sdk/@dnd-kit 涉及项
const SKIP_ITEMS = new Set([
  // ui：chart（recharts）
  "chart",
  // examples：图表 + AI 应用耦合
  "chart-example",
  "message-example",
  "message-scroller-example",
  // blocks：dashboard-01 整块（recharts + @dnd-kit）+ 11 个图表卡片
  "dashboard-01",
  "analytics-card",
  "bar-chart-card",
  "pie-chart-card",
  "sleep-report",
  "visitors",
  "card-overview",
  "contribution-history",
  "dividend-income",
  "power-usage",
  "savings-progress",
  "stock-performance",
])

const SKIP_FILES = new Set([
  // preview-02/index 与 preview/index 保留但删引用（块级文件，不按 item 名过滤）
])

/** 解析源 _registry.ts：返回 [{ name, type, files, registryDependencies }]。
 *  按 `name: "..."` 锚点切块，每块内取 files/type/registryDependencies。 */
function parseSourceRegistry(file) {
  const source = readFileSync(file, "utf8")
  const items = []
  const nameRe = /name:\s*"([\w-]+)"/g
  const anchors = []
  let m
  while ((m = nameRe.exec(source)) !== null) {
    anchors.push({ name: m[1], index: m.index })
  }
  for (let i = 0; i < anchors.length; i++) {
    const start = anchors[i].index
    const end = i + 1 < anchors.length ? anchors[i + 1].index : source.length
    const block = source.slice(start, end)
    const typeM = block.match(/type:\s*"(registry:[a-z]+)"/)
    const filesM = block.match(/files:\s*\[\s*([\s\S]*?)\s*\]/)
    const depM = block.match(/registryDependencies:\s*\[([^\]]*)\]/)
    items.push({
      name: anchors[i].name,
      type: typeM?.[1] ?? "registry:ui",
      files: filesM
        ? [...filesM[1].matchAll(/path:\s*"([^"]+)"/g)].map((x) => x[1])
        : [],
      registryDependencies: depM
        ? [...depM[1].matchAll(/"([\w-]+)"/g)].map((x) => x[1])
        : [],
    })
  }
  return items
}

/** import 扫描推导 item dependencies（包名白名单） */
function deriveDeps(files) {
  const deps = new Set()
  for (const f of files) {
    const p = path.join(TARGET_ROOT, f)
    if (!existsSync(p)) continue
    const src = readFileSync(p, "utf8")
    for (const line of src.split("\n")) {
      const m = line.match(/from\s+["']([^"']+)["']/)
      if (!m) continue
      const mod = m[1]
      if (mod.startsWith("@actview/base-ui")) deps.add("@actview/base-ui")
      else if (mod === "class-variance-authority") deps.add("class-variance-authority")
      else if (mod === "@actview/lucide") deps.add("@actview/lucide")
    }
  }
  return [...deps].sort()
}

function collectAll() {
  const all = []
  for (const dir of ["ui", "lib", "hooks", "components", "examples", "blocks"]) {
    const reg = path.join(BASE_SRC, dir, "_registry.ts")
    if (!existsSync(reg)) continue
    for (const item of parseSourceRegistry(reg)) {
      if (SKIP_ITEMS.has(item.name)) continue
      all.push(item)
    }
  }
  return all
}

// CLI
const args = process.argv.slice(2)
const mode = args.includes("--check") ? "check" : args.includes("--all") ? "all" : "merge"

if (mode === "all") {
  for (const item of collectAll()) {
    console.log(`${item.name}\t${item.type}\t${item.files.join(",")}\tdeps=${item.registryDependencies.join(",")}`)
  }
  process.exit(0)
}

const all = collectAll()
const registry = JSON.parse(readFileSync(REGISTRY_JSON, "utf8"))
const existingByName = new Map(registry.items.map((it) => [it.name, it]))

if (mode === "check") {
  const missing = all.filter((it) => !existingByName.has(it.name))
  const extra = registry.items.filter((it) => !all.some((s) => s.name === it.name))
  if (missing.length) console.log(`源清单缺失（未迁移）：${missing.map((i) => i.name).join(", ")}`)
  if (extra.length) console.log(`目标多出（源清单外）：${extra.map((i) => i.name).join(", ")}`)
  if (!missing.length && !extra.length) console.log("registry.json 与源清单一致（跳过清单除外）✓")
  process.exit(missing.length || extra.length ? 1 : 0)
}

// merge：保留既有条目原样（含 actview 扩展项 icon-placeholder 与
// semanticDependencies 等扩展字段），追加"源清单有 + 目标文件已存在"的新条目；
// files 为空的别名类条目（如 form）跳过。
const merged = [...registry.items]
const existingNames = new Set(merged.map((it) => it.name))
for (const item of all) {
  if (existingNames.has(item.name)) continue
  if (item.files.length === 0) continue
  if (!item.files.every((f) => existsSync(path.join(TARGET_ROOT, f)))) continue
  const entry = {
    name: item.name,
    type: item.type,
    ...(deriveDeps(item.files).length ? { dependencies: deriveDeps(item.files) } : {}),
    ...(item.registryDependencies.length
      ? { registryDependencies: item.registryDependencies }
      : {}),
    files: item.files.map((f) => ({ path: f, type: item.type })),
  }
  merged.push(entry)
  existingNames.add(item.name)
}
registry.items = merged
writeFileSync(REGISTRY_JSON, JSON.stringify(registry, null, 2) + "\n", "utf8")
console.log(`registry.json 已生成：${merged.length} items（${all.length - merged.length} 个待迁移）`)
