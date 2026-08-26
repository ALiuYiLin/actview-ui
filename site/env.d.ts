// 站点全局类型声明（.vitepress 下 ts/tsx 使用）：
//   - *.css 直接 import（press 构建时解析，TS 侧声明为任意模块）
//   - themes.json 由 resolveJsonModule 提供类型（registry/bases/base/themes.json）
declare module "*.css"
