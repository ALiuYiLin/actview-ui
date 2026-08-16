// scripts/build.mjs —— 薄入口：调用 scripts/lib/build-registry.mjs 的核心
// （核心逻辑已抽取供 CLI 与测试复用）
// 产出两套：
//   ① styles/base-<style>/**   路径①：cn-* 展开写死（CLI add 分发）
//   ② styles/semantic/**       路径②：cn-* 保留 + 作用域样式表（自由切换预览）
import { buildRegistry, buildSemanticRegistry } from "./lib/build-registry.mjs"

Promise.all([buildRegistry(), buildSemanticRegistry()]).catch((error) => {
  console.error("❌", error.message)
  process.exit(1)
})
