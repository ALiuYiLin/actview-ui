// tsup 打包（esm + dts）。JSX 由 esbuild 走 @actview/jsx 自动运行时；
// 函数组件 → defineComponent 的转换在 build-base-ui.mjs（Babel）阶段完成，
// 之后 tsup 只是纯打包。
import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    button: "src/button/index.tsx",
    separator: "src/separator/index.tsx",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  esbuildOptions(options) {
    options.jsx = "automatic"
    options.jsxImportSource = "@actview/jsx"
  },
})
