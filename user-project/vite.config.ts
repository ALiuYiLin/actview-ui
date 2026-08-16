// user-project 的 vite 配置（复刻 actview 官方 demo 的最小集）：
//   - actviewPlugin()：函数组件经 Babel defineComponent 转换成 { __setup } 形态
//     （不配置则裸函数组件进运行时崩溃，见 @actview/plugin-vite 说明）
//   - tailwindcss()：Tailwind v4 vite 插件
//   - alias：@/ → 项目根；@/styles → 仓库根 styles 构建物（三套 style 对比区）
import { defineConfig } from "vite"
import { actviewPlugin } from "@actview/plugin-vite"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [actviewPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@/styles": path.resolve(ROOT, "../styles"),
      "@": ROOT,
    },
  },
  server: {
    port: 5990,
    strictPort: true,
  },
})
