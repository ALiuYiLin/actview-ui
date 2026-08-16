// sync-style-tokens：把源 style css 的 .cn-* token 全量同步进目标 styles css
// （docs/MIGRATION.md §3.8：canonical token 源 = 源仓库 style-luma.css，
//  3 套目标 style 共用同一 token 体，只保留各自 .style-<name> 壳与自定义属性）。
//   - 保留目标文件头注释与 .style-<name> 壳内的自定义属性（--radius 等）
//   - .cn-* 规则全量替换为源 luma 的 token 体（含 MARK 注释）
// 用法：
//   node scripts/sync-style-tokens.mjs             # 写入
//   node scripts/sync-style-tokens.mjs --check     # 只校验（CI/测试用）
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_CSS = path.join(
  "E:\\code3\\ui\\apps\\v4\\registry\\styles",
  "style-luma.css"
)
const TARGET_DIR = path.join(ROOT, "registry", "styles")

/** 提取 .cn-* token 块：返回 { name, raw } 列表（raw 含缩进后的规则体 + 前置 MARK 注释） */
export function extractCnTokens(css) {
  const tokens = []
  const re = /^(\s*)(\.cn-[\w-]+)\s*\{/gm
  let match
  while ((match = re.exec(css)) !== null) {
    const indent = match[1]
    const name = match[2].slice(1)
    const openAt = match.index + match[0].length
    // 括号计数找配对闭括号（token 体内可能有嵌套规则）
    let depth = 1
    let i = openAt
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth++
      else if (css[i] === "}") depth--
      i++
    }
    const body = css.slice(openAt, i - 1).trimEnd()
    // 前置的 /* MARK: X */ 注释一并带走
    let comment = ""
    const before = css.slice(0, match.index)
    const m = before.match(/\n(\s*\/\* MARK:[^\n]*)\s*$/m)
    if (m) comment = m[1] + "\n"
    tokens.push({ name, raw: comment + `${indent}.${name} {\n${body}\n${indent}}` })
  }
  return tokens
}

/** 重建目标 style css：壳 + 自定义属性 + 同步后的 token 集 */
export function rebuildStyleCss(targetCss, tokens) {
  const shellMatch = targetCss.match(/^([\s\S]*?)(\n(\s*)\.style-[\w-]+\s*\{)([\s\S]*)$/)
  if (!shellMatch) {
    throw new Error("目标 style css 找不到 .style-* 作用域壳")
  }
  const header = shellMatch[1].trimEnd()
  const shellOpen = shellMatch[2].replace(/^\n/, "")
  const shellBody = shellMatch[4]
  // 取壳内自定义属性（--x: ...;）与闭括号
  const customProps = []
  for (const line of shellBody.split("\n")) {
    if (/^\s*--[\w-]+\s*:/.test(line)) customProps.push(line)
  }
  const closing = shellBody.match(/\n\}/) ? "\n}" : ""
  const lines = [header]
  lines.push(shellOpen)
  lines.push(...customProps)
  lines.push("")
  for (const token of tokens) {
    lines.push(token.raw)
    lines.push("")
  }
  lines.push("}")
  return lines.join("\n").trimEnd() + "\n"
}

export function syncStyleTokens({ check = false } = {}) {
  if (!readFileSync(SOURCE_CSS, "utf8")) {
    throw new Error(`源 style css 不存在：${SOURCE_CSS}`)
  }
  const sourceCss = readFileSync(SOURCE_CSS, "utf8")
  const tokens = extractCnTokens(sourceCss)
  const report = []
  for (const file of readdirSync(TARGET_DIR).filter((f) => f.endsWith(".css"))) {
    const filePath = path.join(TARGET_DIR, file)
    const current = readFileSync(filePath, "utf8")
    const rebuilt = rebuildStyleCss(current, tokens)
    if (check) {
      if (rebuilt !== current) report.push(`差异：${file}`)
    } else {
      writeFileSync(filePath, rebuilt, "utf8")
      report.push(`同步：${file}（${tokens.length} 个 token）`)
    }
  }
  return { tokens: tokens.length, report }
}

// CLI 入口
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check")
  const { tokens, report } = syncStyleTokens({ check })
  for (const line of report) console.log(line)
  console.log(`${check ? "校验" : "同步"}完成：${tokens} 个 cn-* token`)
  if (check && report.some((r) => r.startsWith("差异"))) {
    process.exitCode = 1
  }
}
