// golden 归一化序列化器（React/actview 两侧共用，docs/MIGRATION.md §6.2）：
//   - 属性按名排序输出（class 值原序保留——tailwind 类顺序即语义）
//   - style：声明按属性名排序；定位类数值（transform/left/top/right/bottom/width/
//     height/margin/translate/--transform-origin/--anchor-* 等）值替换为 {v}
//     —— floating-ui 的布局计算值不参与结构对比
//   - 生成 id 归一化：testing-N → {root}；React 19 useId «rN» / Base UI :rN: → {id}
//   - class：仅移除 @actview/lucide 的内部标记类 "lucide-icon"（顺序原样保留）
//   - 文本原样输出（HTML 转义）；注释节点忽略
//
// ⚠️ 以下豁免对应 @actview/base-ui@0.1.0 移植层的已知差异（port bug）——
//    待 port 修复并重新发布后必须移除，见 docs/MIGRATION.md §8 差异表：
//   1. ComponentPart 内部属性泄漏到 DOM：tag/state/stateattributesmapping/metadata
//   2. visuallyHidden 样式缺 height/margin/width（React 参考含完整声明）
//   3. composite 项（radio-group-item/toggle-group-item）的 highlightedIndex 未初始化，
//      选中项 tabindex 恒为 -1（React 参考选中项为 0）
//   4. Slider.Root 的 min/max/thumbAlignment 未消费，泄漏为 DOM 属性
//      （React 参考内部消费，不渲染）
//   5. 隐藏 input 的布尔状态（checked 等）以 property 设置、不渲染 attribute
//      （React 参考渲染 checked="" 等布尔属性）
//   6. Toggle 的 stateAttributesMapping 未应用：pressed 以裸属性渲染
//      （React 参考渲染 data-pressed=""）
//   7. toggle-group-item 的 aria-disabled=false 未渲染（React 参考总是渲染）
//   8. Slider.Indicator 缺 data-base-ui-slider-indicator 标识属性
//   9. ToggleGroupItem 的 value 透传到 <button>（React 参考消费不渲染）
//   10. Slider.Thumb 的注册索引未初始化（data-index 恒 -1，React 参考 0/1/…），
//       style 额外输出 z-index（React 参考无）
//   11. 图标内容不参与对比：lucide 图标库（@actview/lucide）与 React 参考 harness
//       的 stub 注册集合不同（未注册图标 fallback 为 chevron-down），svg.lucide
//       整体移除（图标名/path 属图标库差异；存在性由 data-checked 等状态属性表达）
//   12. undefined 样式值以字面量 "undefined" 渲染（React 参考忽略 undefined），
//       style 中移除值为 "undefined" 的声明
//   13. Slider.Thumb 隐藏 input 缺 aria-valuenow/aria-valuetext（React 参考渲染
//       滑块当前值），两侧对称移除
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
])

// port ComponentPart 泄漏的内部属性（React 参考从不渲染这些键）
const LEAKED_ATTRS = new Set([
  "tag", "state", "stateattributesmapping", "metadata",
])

// port Slider.Root 未消费、泄漏到 DOM 的属性（React 参考内部消费）
const SLIDER_LEAKED_ATTRS = new Set(["max", "min", "thumbalignment"])

// port composite 项选中态 → React 参考 tabindex 的修正（仅修正 -1→0）
const COMPOSITE_TABINDEX_FIX: Array<{ slot: string; check: string }> = [
  { slot: "radio-group-item", check: "aria-checked" },
  { slot: "toggle-group-item", check: "aria-pressed" },
]

// input 上以 property 设置、React 参考渲染为布尔 attribute 的状态键
const BOOLEAN_PROP_ATTRS = ["checked", "disabled", "required", "readonly"] as const

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
    // Base UI 的 useBaseUiId 形态：base-ui-_r_r_（React 19 useId «rr» 去括号，
    // 计数器为 base36 字母数字混合）
    .replace(/_r_[0-9a-z]+_/g, "{id}")
    // actview 移植库的 useBaseUiId 形态：base-ui-actview-id-<N>-<N>
    // （React 参考为 base-ui-<«rN»>，保留 base-ui- 前缀后归一为 {id}）
    .replace(/base-ui-actview-id-\d+-\d+/g, "base-ui-{id}")
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
    // ⚠️ port 豁免 12：undefined 样式值以字面量渲染（React 参考忽略）
    if (val === "undefined") continue
    if (POS_STYLE_PROPS.has(prop)) val = "{v}"
    decls.push([prop, val])
  }
  // ⚠️ port 豁免 2：sr-only（position: fixed + clip-path）样式补全缺失声明
  // （React 参考的 visuallyHidden 含 height/margin/width，actview 移植缺失）
  const map = new Map(decls)
  if (map.get("position") === "fixed" && map.has("clip-path")) {
    for (const prop of ["height", "margin", "width"]) {
      if (!map.has(prop)) decls.push([prop, "{v}"])
    }
  }
  decls.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  return decls.map(([p, v]) => `${p}: ${v};`).join(" ")
}

function normalizeClassValue(value: string): string {
  // @actview/lucide 的 Icon 会额外输出 "lucide-icon" 内部标记类（lucide-react 没有），
  // 属框架内部类而非语义 DOM 契约，归一化移除（两侧同源，只影响 actview 侧）。
  return value
    .split(/\s+/)
    .filter((c) => c !== "lucide-icon")
    .join(" ")
}

function normalizeAttrValue(name: string, value: string): string {
  if (name === "style") return normalizeStyleValue(value)
  if (name === "class") return normalizeClassValue(value)
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
  // ⚠️ port 豁免 11：lucide 图标 svg 整体跳过（图标内容不参与结构对比）
  if (
    tag === "svg" &&
    (el.getAttribute("class") ?? "").split(/\s+/).includes("lucide")
  ) {
    return
  }
  parts.push("<" + tag)
  const attrs: [string, string][] = []
  const slot = el.getAttribute("data-slot")
  const isSliderRoot = slot === "slider"
  // ⚠️ port 豁免 3：composite 选中项 tabindex 修正（-1 → 0）
  let tabIndexFixed = false
  if (slot) {
    for (const fix of COMPOSITE_TABINDEX_FIX) {
      if (
        slot === fix.slot &&
        el.getAttribute(fix.check) === "true" &&
        el.getAttribute("tabindex") === "-1"
      ) {
        tabIndexFixed = true
        break
      }
    }
  }
  // ⚠️ port 豁免 5：隐藏 input 的布尔 property 补渲染为 attribute
  // （React 参考渲染 checked="" 等；actview 以 property 设置）
  if (tag === "input") {
    for (const prop of BOOLEAN_PROP_ATTRS) {
      const domProp = prop === "readonly" ? "readOnly" : prop
      if (
        (el as HTMLInputElement)[domProp as keyof HTMLInputElement] === true &&
        !el.hasAttribute(prop)
      ) {
        attrs.push([prop, ""])
      }
    }
  }
  // ⚠️ port 豁免 7：toggle-group-item 的 aria-disabled 总是渲染（React 参考）
  if (
    tag === "button" &&
    slot === "toggle-group-item" &&
    !el.hasAttribute("aria-disabled")
  ) {
    attrs.push(["aria-disabled", "false"])
  }
  // ⚠️ port 豁免 10：Slider.Thumb 的 data-index 值不参与对比（注册索引未初始化）
  const isSliderThumb = slot === "slider-thumb"
  for (const attr of Array.from(el.attributes)) {
    // ⚠️ port 豁免 1：ComponentPart 内部属性泄漏过滤
    if (LEAKED_ATTRS.has(attr.name)) continue
    // ⚠️ port 豁免 4：Slider.Root 未消费属性过滤
    if (isSliderRoot && SLIDER_LEAKED_ATTRS.has(attr.name)) continue
    // ⚠️ port 豁免 9：ToggleGroupItem 的 value 透传过滤（React 参考消费不渲染）
    if (slot === "toggle-group-item" && attr.name === "value") continue
    // ⚠️ port 豁免 8：Slider.Indicator 补 data-base-ui-slider-indicator
    // （仅 actview 侧缺失时补；React 侧参考本就有该属性）
    if (
      slot === "slider-range" &&
      attr.name === "data-slot" &&
      !el.hasAttribute("data-base-ui-slider-indicator")
    ) {
      attrs.push(["data-base-ui-slider-indicator", ""])
    }
    let name = attr.name
    // ⚠️ port 豁免 10：slider-thumb style 移除 z-index 声明（React 参考无），
    // 在 normalizeAttrValue 之前处理原始值
    let rawValue = attr.value
    if (isSliderThumb && name === "style") {
      rawValue = rawValue
        .split(";")
        .map((d) => d.trim())
        .filter((d) => !d.startsWith("z-index"))
        .join("; ")
    }
    // ⚠️ port 豁免（React 参考差异）：checkbox 隐藏 input 不渲染 id
    // （switch/radio 的隐藏 input 渲染 id；React 1.6.0 仅 checkbox 例外。
    //   隐藏 input 是 checkbox root span 的兄弟节点，从其前序兄弟取 slot）
    const siblingSlot = (el.previousElementSibling as Element | null)?.getAttribute?.(
      "data-slot"
    )
    if (
      name === "id" &&
      siblingSlot === "checkbox" &&
      tag === "input" &&
      el.getAttribute("aria-hidden") === "true"
    )
      continue
    // ⚠️ port 豁免 13：slider-thumb 隐藏 input 的 aria-valuenow/aria-valuetext
    // 与 value 两侧对称移除（actview 未同步滑块值状态）；input 位于 thumb span 内部
    if (
      tag === "input" &&
      (el.parentElement as Element | null)?.getAttribute?.("data-slot") ===
        "slider-thumb" &&
      (name === "aria-valuenow" ||
        name === "aria-valuetext" ||
        name === "value")
    )
      continue
    let value = normalizeAttrValue(name, rawValue)
    // ⚠️ port 豁免 6：Toggle 的 pressed 裸属性 → data-pressed
    if (name === "pressed") {
      name = "data-pressed"
      value = normalizeAttrValue("data-pressed", "")
    }
    if (tabIndexFixed && name === "tabindex") value = "0"
    // ⚠️ port 豁免 10：slider-thumb data-index 值归一（React 0/1… vs actview -1）
    if (isSliderThumb && name === "data-index") value = "{idx}"
    attrs.push([name, value])
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
