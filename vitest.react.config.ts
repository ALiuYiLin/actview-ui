// React 参考 harness 的 vitest 配置（独立于主配置运行：pnpm test:react-ref）：
//   - alias @ → harness 冻结副本根（test/fixtures/react-reference/src）
//   - 不加 actviewPlugin（React 侧不需要）
import { defineConfig } from "vitest/config"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(ROOT, "test/fixtures/react-reference/src"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/fixtures/react-reference/tests/**/*.test.tsx"],
  },
})
