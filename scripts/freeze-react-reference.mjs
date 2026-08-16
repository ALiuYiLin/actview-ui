// freeze-react-reference：从源仓库增量冻结组件副本到 React 参考 harness，
// 并更新 MANIFEST.json 的 frozenFiles 清单（docs/MIGRATION.md §5.1.3）。
// 用法（相对路径以源 base 目录为基准）：
//   node scripts/freeze-react-reference.mjs ui/card.tsx ui/card-group.tsx lib/utils.ts
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_REPO = "E:\\code3\\ui"
const BASE_SRC = path.join(SOURCE_REPO, "apps", "v4", "registry", "bases", "base")
const HARNESS_SRC = path.join(
  ROOT,
  "test",
  "fixtures",
  "react-reference",
  "src",
  "registry",
  "bases",
  "base"
)
const MANIFEST = path.join(
  ROOT,
  "test",
  "fixtures",
  "react-reference",
  "MANIFEST.json"
)

const rels = process.argv.slice(2)
if (rels.length === 0) {
  console.error("用法：node scripts/freeze-react-reference.mjs <相对路径...>")
  console.error(`  相对路径以源 base 目录（${BASE_SRC}）为基准，如 ui/card.tsx`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"))
const existing = new Set(manifest.frozenFiles.map((f) => f.to))

for (const rel of rels) {
  const from = path.join(BASE_SRC, rel)
  const to = path.join(HARNESS_SRC, rel)
  mkdirSync(path.dirname(to), { recursive: true })
  copyFileSync(from, to)
  if (!existing.has(to)) {
    manifest.frozenFiles.push({
      from: path.join("apps/v4/registry/bases/base", rel).split(path.sep).join("/"),
      to: path.relative(path.join(ROOT, "test", "fixtures", "react-reference"), to)
        .split(path.sep)
        .join("/"),
    })
    existing.add(to)
  }
  console.log(`冻结：${rel}`)
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8")
console.log(`MANIFEST.json 已更新（${manifest.frozenFiles.length} 个文件）`)
