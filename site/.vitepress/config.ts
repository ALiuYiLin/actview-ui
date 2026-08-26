// ActPress 站点配置（@actview/press —— vitepress 的 ActView 移植版）
// 文档站展示 @actview/ui registry 组件（M1：L0a + L1 共 24 个）
import { defineConfig } from "@actview/press"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from "node:url"

// registry 根（@/ 别名目标，与 vitest/tsconfig 一致）
const registryRoot = fileURLToPath(new URL("../../", import.meta.url))

export default defineConfig({
  lang: "zh-CN",
  title: "ActView UI",
  description: "shadcn/ui 风格的 ActView 组件库 —— registry + 文档",

  vite: {
    resolve: {
      alias: {
        "@": registryRoot,
      },
    },
    // vite 双版本并存（press 依赖 vite 7、@tailwindcss/vite 解析到 vite 8），
    // Plugin 类型不互通，断言为 any[] 绕开（运行期无影响）
    plugins: [tailwindcss()] as any[],
  },

  themeConfig: {
    logo: "⛰",
    nav: [
      { text: "首页", link: "/" },
      { text: "组件", link: "/components/button" },
      { text: "指南", link: "/guide/getting-started" },
      { text: "ActPress", link: "https://aliuyilin.github.io/actpress/" },
    ],

    sidebar: {
      "/components/": [
        {
          text: "基础 (L0)",
          collapsed: false,
          items: [
            { text: "Button 按钮", link: "/components/button" },
            { text: "Card 卡片", link: "/components/card" },
            { text: "Alert 提示", link: "/components/alert" },
            { text: "Input 输入框", link: "/components/input" },
            { text: "InputGroup 输入组", link: "/components/input-group" },
            { text: "Textarea 文本域", link: "/components/textarea" },
            { text: "NativeSelect 原生选择", link: "/components/native-select" },
            { text: "Field 表单域", link: "/components/field" },
            { text: "Label 标签", link: "/components/label" },
            { text: "Pagination 分页", link: "/components/pagination" },
            { text: "Table 表格", link: "/components/table" },
            { text: "Separator 分割线", link: "/components/separator" },
            { text: "Skeleton 骨架屏", link: "/components/skeleton" },
            { text: "Spinner 加载", link: "/components/spinner" },
            { text: "Empty 空状态", link: "/components/empty" },
            { text: "Message 消息", link: "/components/message" },
            { text: "AspectRatio 比例", link: "/components/aspect-ratio" },
            { text: "Kbd 按键", link: "/components/kbd" },
          ],
        },
        {
          text: "表单 (L1)",
          collapsed: false,
          items: [
            { text: "Checkbox 复选框", link: "/components/checkbox" },
            { text: "Switch 开关", link: "/components/switch" },
            { text: "RadioGroup 单选框", link: "/components/radio-group" },
            { text: "Slider 滑块", link: "/components/slider" },
            { text: "Progress 进度条", link: "/components/progress" },
            { text: "Toggle 切换", link: "/components/toggle" },
            { text: "ToggleGroup 切换组", link: "/components/toggle-group" },
            { text: "Direction 方向", link: "/components/direction" },
          ],
        },
      ],
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "样式与主题", link: "/guide/styles" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/ALiuYiLin/actpress" }],

    footer: {
      message: "ActView UI —— shadcn/ui 风格 ActView 组件库",
      copyright: "MIT Licensed",
    },
  },
})
