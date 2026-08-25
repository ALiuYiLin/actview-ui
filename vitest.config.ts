// vitest 配置（actview 主仓库同款做法）：
//   - actviewPlugin()：测试文件与被测的 styles 产物 TSX 经 Babel defineComponent
//     转换（否则裸函数组件进运行时崩溃）
//   - alias @ → 仓库根：解析产物互引（@/lib/utils、@/styles/...）
//   - 本地链接源码包（@base-ui/actview 及 actview 生态）：
//       * server.fs.allow 放行 E:/code3/{base-ui,actview,floating-ui}（链接包真实路径）
//       * 自定义插件：@base-ui/actview 源码内部用 @/ 别名指向自身 src，必须按
//         importer 区分解析（本仓库的 @ → ROOT 不受影响）
//   - environment: happy-dom（@actview/testing 的 render 需要真实 DOM 环境）
import { defineConfig } from "vitest/config"
import { actviewPlugin } from "@actview/plugin-vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(fileURLToPath(import.meta.url))

// @base-ui/actview 移植库源码目录（真实路径，链接包会解析到此处）
const BASE_UI_ACTVIEW_SRC = path.resolve("E:/code3/base-ui/packages/actview/src")

/** @base-ui/actview 源码内部的 @/ 别名：vite 的全局 alias（@ → ROOT）会先于
 *  resolveId 拦截并替换成错误路径，因此只能在 transform 阶段把 @/ 导入改写为
 *  指向移植库 src 的绝对路径（仅对移植库源码文件生效）。 */
function baseUiActviewImportRewrite() {
  return {
    name: "base-ui-actview-import-rewrite",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!id.replace(/\\/g, "/").includes("base-ui/packages/actview/src")) return null
      const rewritten = code.replace(
        /(from\s*["']|import\s*\(\s*["'])@\/([^"')]+)(["'])/g,
        (_m, prefix: string, rest: string, quote: string) =>
          `${prefix}${path.join(BASE_UI_ACTVIEW_SRC, rest).replace(/\\/g, "/")}${quote}`,
      )
      return rewritten === code ? null : { code: rewritten, map: null }
    },
  }
}

export default defineConfig({
  plugins: [actviewPlugin(), baseUiActviewImportRewrite()],
  resolve: {
    alias: {
      "@": ROOT,
    },
  },
  server: {
    fs: {
      // 链接包真实路径在仓库外，放行转译（actview 生态源码 + 移植库）
      allow: [
        ROOT,
        "E:/code3/base-ui",
        "E:/code3/actview",
        "E:/code3/floating-ui",
      ],
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.{ts,tsx,mjs,js}"],
    // React 参考 harness 用独立配置跑（vitest.react.config.ts，alias 不同）
    exclude: ["test/fixtures/react-reference/**"],
    server: {
      // 源码 TS 包需要经 vite 转译（默认 node_modules 不转译）
      deps: {
        inline: [/@base-ui\/actview/, /@actview\/(core|jsx|testing)/, /^actview$/],
      },
    },
  },
})
