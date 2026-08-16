// scripts/build.mjs —— 薄入口：调用 scripts/lib/build-registry.mjs 的核心
// （核心逻辑已抽取供 CLI 与测试复用）
import { buildRegistry } from "./lib/build-registry.mjs"

buildRegistry().catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
