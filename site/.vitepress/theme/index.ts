// 站点主题：默认主题 + 主题切换器（风格/色板/图表色/字体/明暗等 13 组定制）。
// 参考 C:\code\vitepress\docs\.vitepress\theme\index.ts 的结构：
//   - 展开默认主题，用 floatingChildrens 挂载常驻浮层组件（body 下 .floating-comps）
//   - 切换器为 ActView 函数组件（ThemeSwitcher.tsx，直接返回 JSX，无 defineComponent）
// 用 @ 别名解析（actpress build 对 theme 目录相对 css import 解析失败）
import "@/site/.vitepress/style.css"
import Theme from "@actview/press/theme"
import { ThemeSwitcher } from "./ThemeSwitcher"

export default {
  ...Theme,
  floatingChildrens: [ThemeSwitcher],
}
