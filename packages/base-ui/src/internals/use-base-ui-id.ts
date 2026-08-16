// 复刻 Base UI useBaseUiId：未传 id 时生成 `base-ui-_r_3_`（React 19 useId «r3»
// 去括号形态，golden 归一化后为 base-ui-{id}）；显式传入则原样使用。
let counter = 0

export function useBaseUiId(idProp?: string): string {
  return idProp ?? `base-ui-_r_${++counter}_`
}

/** 浮层 portal 容器 id（Base UI 直接使用 useId 形态：_r_4_） */
export function usePortalId(idProp?: string): string {
  return idProp ?? `_r_${++counter}_`
}
