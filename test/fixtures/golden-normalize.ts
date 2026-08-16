// golden 归一化序列化器（React/actview 两侧共用，docs/MIGRATION.md §6.2）：
//   - 属性按名排序输出（class 值原序保留——tailwind 类顺序即语义）
//   - style：声明按属性名排序；定位类数值（transform/left/top/right/bottom/width/
//     height/margin/translate/--transform-origin/--anchor-* 等）值替换为 {v}
//     —— floating-ui 的布局计算值不参与结构对比
//   - 生成 id 归一化：testing-N → {root}；React 19 useId «rN» / Base UI :rN: → {id}
//   - 文本原样输出（HTML 转义）；注释节点忽略
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
])

// 布局计算类样式属性：值不参与对比（只比属性名存在与顺序）
const POS_STYLE_PROPS = new Set([
  "transform", "left", "top", "right", "bottom", "width", "height",
  "margin", "margin-top", "margin-left", "translate", "inset",
  "--transform-origin", "--anchor-width", "--anchor-height",
])

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function normalizeId(value: string): string {
  return value
    .replace(/^testing-\d+$/, "{root}")
    .replace(/«r\d+»/g, "{id}")
    .replace(/:r\d+:/g, "{id}")
    // Base UI 的 useBaseUiId 形态：base-ui-_r_3_（React 19 useId «r3» 去括号）
    .replace(/_r_\d+_/g, "{id}")
}

function normalizeStyleValue(value: string): string {
  const decls: [string, string][] = []
  for (const decl of value.split(";")) {
    const trimmed = decl.trim()
    if (!trimmed) continue
    const sep = trimmed.indexOf(":")
    if (sep === -1) continue
    const prop = trimmed.slice(0, sep).trim()
    let val = trimmed.slice(sep + 1).trim()
    if (POS_STYLE_PROPS.has(prop)) val = "{v}"
    decls.push([prop, val])
  }
  decls.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  return decls.map(([p, v]) => `${p}: ${v};`).join(" ")
}

function normalizeAttrValue(name: string, value: string): string {
  if (name === "style") return normalizeStyleValue(value)
  if (name === "id") return normalizeId(value)
  // aria-labelledby/aria-describedby 等引用生成 id 的属性值
  if (value.includes("«r") || value.includes(":r")) {
    return normalizeId(value)
  }
  return value
}

function appendNode(node: Node, parts: string[]): void {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const text = node.textContent ?? ""
    if (text) parts.push(escapeHtml(text))
    return
  }
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return
  const el = node as Element
  const tag = el.tagName.toLowerCase()
  parts.push("<" + tag)
  const attrs: [string, string][] = []
  for (const attr of Array.from(el.attributes)) {
    attrs.push([attr.name, normalizeAttrValue(attr.name, attr.value)])
  }
  attrs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  for (const [name, value] of attrs) {
    parts.push(` ${name}="${escapeHtml(value)}"`)
  }
  if (VOID_TAGS.has(tag)) {
    parts.push("/>")
    return
  }
  parts.push(">")
  for (const child of Array.from(el.childNodes)) {
    appendNode(child, parts)
  }
  parts.push(`</${tag}>`)
}

/** 归一化序列化（两侧共用入口） */
export function serializeNormalized(root: Node): string {
  const parts: string[] = []
  if (root.nodeType === 1) {
    // 从容器自身开始（不含容器），走子节点
    for (const child of Array.from((root as Element).childNodes)) {
      appendNode(child, parts)
    }
  } else {
    appendNode(root, parts)
  }
  return parts.join("")
}

/** 归一化整个 body（Portal/Teleport 内容挂在 body 下时使用） */
export function serializeNormalizedBody(): string {
  return serializeNormalized(document.body)
}
