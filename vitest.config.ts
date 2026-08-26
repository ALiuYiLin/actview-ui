// vitest 配置（actview 主仓库同款做法）：
//   - actviewPlugin()：测试文件与被测的 styles 产物 TSX 经 Babel defineComponent
//     转换（否则裸函数组件进运行时崩溃）
//   - alias @ → 仓库根：解析产物互引（@/lib/utils、@/styles/...）
//   - actview 生态 + @actview/base-ui 全部为 npm 安装（dist 构建产物），
//     无需 fs.allow/deps.inline/源码别名改写等 hack
//   - environment: happy-dom（@actview/testing 的 render 需要真实 DOM 环境）
import { defineConfig } from "vitest/config"
import { actviewPlugin } from "@actview/plugin-vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [actviewPlugin()],
  resolve: {
    alias: {
      "@": ROOT,
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.{ts,tsx,mjs,js}"],
    // React 参考 harness 用独立配置跑（vitest.react.config.ts，alias 不同）
    exclude: ["test/fixtures/react-reference/**"],
  },
})
