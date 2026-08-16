// 简化版 IconPlaceholder（复刻 shadcn 文档站 app/(create)/components/icon-placeholder）。
// 构建产物在用户端会被 transform-icons 替换为真实图标库组件
// （按 config.iconLibrary 选择 lucide/tabler/hugeicons/phosphor/remixicon 属性）。
export function IconPlaceholder(props: {
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
}) {
  return null
}
