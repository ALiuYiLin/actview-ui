// 站点主题：默认主题 + 主题切换器（风格/色板/明暗）
import DefaultTheme from "@actview/press/theme"
import { initThemeSwitcher } from "./theme-switcher"
// 用 @ 别名解析（actpress build 对 theme 目录相对 css import 解析失败）
import "@/site/.vitepress/style.css"

export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (typeof document !== "undefined") {
      initThemeSwitcher()
    }
  },
}
