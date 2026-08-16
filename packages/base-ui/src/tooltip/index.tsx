// @actview/base-ui Tooltip：复刻 Base UI tooltip（1.6.0）的 DOM 契约（M0 范围）。
// DOM 契约（React golden 验证，test/fixtures/golden/tooltip.*.html）：
//   Provider/Root     — 不渲染 DOM（仅上下文；shadcn 的 data-slot 被丢弃）
//   Trigger           — <button type="button" id="base-ui-_r_3_"
//                        data-base-ui-tooltip-trigger="" [data-popup-open=""]>
//                        disabled → data-trigger-disabled=""
//   Portal            — Teleport 到 body：<div data-base-ui-portal="" id="_r_4_">
//   Positioner        — <div role="presentation" data-open data-side data-align
//                        style="position:absolute; left;top;transform; opacity(starting)">
//   Popup             — <div tabindex="-1" data-base-ui-focusable data-open data-side data-align>
//   Arrow             — <div aria-hidden="true" data-open data-side data-align data-uncentered
//                        style="position: absolute;">
// 行为（M0）：hover（enter/leave 延迟）、focus 开关、Escape/外部点击关闭、受控 open。
// 定位（M0）：固定输出 position:absolute（happy-dom 两栈 rect 均为 0，数值经
//   golden 归一化不参与对比；真实浏览器定位随视觉里程碑补齐）。
// 规范：函数组件 + useProps；上下文经 provide/useInjects；props 合成用 computed
//   （惰性追踪解决 setup 快照问题，最终 return 必须为 JSX 供插件包装）。
import {
  computed,
  nextTick,
  onUnmounted,
  onWatcherCleanup,
  provide,
  reactive,
  Teleport,
  useInjects,
  useProps,
  watchEffect,
} from "@actview/core"
import { Fragment, jsx } from "@actview/jsx"
import type { HTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { useBaseUiId, usePortalId } from "../internals/use-base-ui-id"
import { mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

const TOOLTIP_ROOT_KEY = "actview-tooltip-root"
const TOOLTIP_PROVIDER_KEY = "actview-tooltip-provider"
const TOOLTIP_POSITIONER_KEY = "actview-tooltip-positioner"

type TooltipStore = {
  open: boolean
  mounted: boolean
  disabled: boolean
  transitionStatus: "" | "starting" | "open" | "closed"
  triggerEl: Element | null
  popupEl: Element | null
  _setOpen: (v: boolean) => void
}

function Provider(props: HTMLAttributes & { delay?: number }) {
  const { delay, rest } = useProps(props, { delay: (v) => v ?? 0 })
  provide(TOOLTIP_PROVIDER_KEY, { delay: delay.value })
  // Fragment 用 jsx() 显式调用：@actview/jsx 的 JSX.ElementType 不含 symbol，
  // <Fragment> 语法过不了 TS；插件同样把 jsx 调用包装为 render 闭包
  return jsx(Fragment, { children: rest.value.children })
}

function Root(
  props: HTMLAttributes & {
    open?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    onOpenChange?: (open: boolean) => void
  }
) {
  const { open, defaultOpen, disabled, onOpenChange, rest } = useProps(props, {
    open: undefined,
    defaultOpen: (v) => v ?? false,
    disabled: (v) => v ?? false,
    onOpenChange: undefined,
  })

  const initialOpen =
    open.value !== undefined ? !!open.value : !!defaultOpen.value

  const store = reactive<TooltipStore>({
    open: initialOpen,
    mounted: initialOpen,
    disabled: disabled.value,
    transitionStatus: "",
    triggerEl: null,
    popupEl: null,
    _setOpen: () => {},
  })

  // 初始即打开：同样走 starting → open 两阶段（与 Base UI 首帧一致）
  if (store.open) {
    store.transitionStatus = "starting"
    nextTick(() => {
      store.transitionStatus = "open"
    })
  }

  function setOpen(v: boolean) {
    if (store.open === v) return
    store.open = v
    if (v) {
      store.mounted = true
      // 与 Base UI 一致：打开首帧为 starting 阶段（内联 opacity 0），
      // 下一帧进入 open 阶段（交给 CSS transition 呈现）
      store.transitionStatus = "starting"
      nextTick(() => {
        store.transitionStatus = "open"
      })
    } else {
      store.transitionStatus = "closed"
      store.mounted = false
    }
    onOpenChange.value?.(v)
  }
  store._setOpen = setOpen

  // 受控 open / disabled 同步
  watchEffect(() => {
    store.disabled = disabled.value
    if (store.disabled && store.open) {
      setOpen(false)
      return
    }
    if (open.value !== undefined && store.open !== !!open.value) {
      setOpen(!!open.value)
    }
  })

  // 打开期间的全局 dismiss：Escape / 外部 pointerdown
  watchEffect(() => {
    if (!store.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onDown = (e: Event) => {
      const target = e.target as Element | null
      if (!target) return
      if (store.triggerEl && store.triggerEl.contains(target)) return
      if (store.popupEl && store.popupEl.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("keydown", onKey, true)
    document.addEventListener("pointerdown", onDown, true)
    onWatcherCleanup(() => {
      document.removeEventListener("keydown", onKey, true)
      document.removeEventListener("pointerdown", onDown, true)
    })
  })

  provide(TOOLTIP_ROOT_KEY, store)
  return jsx(Fragment, { children: rest.value.children })
}

function Trigger(
  props: HTMLAttributes & { render?: any; disabled?: boolean; id?: string }
) {
  const { render, disabled, id, rest } = useProps(props, {
    render: undefined,
    disabled: undefined,
    id: undefined,
  })
  const store = useInjects(TOOLTIP_ROOT_KEY) as TooltipStore | undefined
  const providerCtx = useInjects(TOOLTIP_PROVIDER_KEY) as
    | { delay: number }
    | undefined
  const triggerId = useBaseUiId(id.value)

  const openDelay = providerCtx?.delay ?? 0
  const closeDelay = 0

  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null
  const clearTimers = () => {
    if (openTimer) clearTimeout(openTimer)
    if (closeTimer) clearTimeout(closeTimer)
    openTimer = null
    closeTimer = null
  }
  const open = () => {
    clearTimers()
    if (!(disabled.value ?? store?.disabled ?? false)) store?._setOpen(true)
  }
  const close = () => {
    clearTimers()
    store?._setOpen(false)
  }
  onUnmounted(clearTimers)

  const merged = computed(() => {
    const isDisabled = disabled.value ?? store?.disabled ?? false
    const external = rest.value as Record<string, any>
    const {
      className,
      class: legacyClassName,
      style,
      ...elementProps
    } = external

    const handlers = {
      onMouseEnter: () => {
        clearTimers()
        openTimer = setTimeout(open, openDelay)
      },
      onMouseLeave: () => {
        clearTimers()
        closeTimer = setTimeout(close, closeDelay)
      },
      onFocus: open,
      onBlur: close,
    }

    return mergeProps(
      { type: "button", id: triggerId },
      isDisabled
        ? { "data-trigger-disabled": "" }
        : { "data-base-ui-tooltip-trigger": "" },
      handlers,
      store?.open ? { "data-popup-open": "" } : null,
      {
        ref: (el: Element | null) => {
          if (store) store.triggerEl = el
        },
      },
      { className, class: legacyClassName, style },
      elementProps
    )
  })

  return render.value == null ? (
    <button {...merged.value} />
  ) : (
    mergeRenderProps(
      render.value,
      "button",
      merged.value,
      rest.value.children
    )
  )
}

function Portal(props: HTMLAttributes & { keepMounted?: boolean }) {
  const { keepMounted, rest } = useProps(props, {
    keepMounted: (v) => v ?? false,
  })
  const store = useInjects(TOOLTIP_ROOT_KEY) as TooltipStore | undefined
  const portalId = usePortalId()
  const mounted = computed(() => store?.mounted || keepMounted.value)

  return (
    <Teleport to="body">
      {mounted.value ? (
        <div data-base-ui-portal="" id={portalId}>
          {rest.value.children}
        </div>
      ) : null}
    </Teleport>
  )
}

function Positioner(
  props: HTMLAttributes & {
    render?: any
    side?: string
    sideOffset?: number
    align?: string
    alignOffset?: number
  }
) {
  const { render, side, sideOffset, align, alignOffset, rest } = useProps(
    props,
    {
      render: undefined,
      side: (v) => v ?? "top",
      sideOffset: (v) => v ?? 0,
      align: (v) => v ?? "center",
      alignOffset: (v) => v ?? 0,
    }
  )
  const store = useInjects(TOOLTIP_ROOT_KEY) as TooltipStore | undefined
  provide(TOOLTIP_POSITIONER_KEY, {
    side: side.value,
    align: align.value,
  })

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const {
      className,
      class: legacyClassName,
      style,
      ...elementProps
    } = external

    // M0：固定定位输出（happy-dom 两栈 rect=0；真实定位随视觉里程碑）
    // starting 阶段带 opacity: 0（Base UI 过渡首帧），键集合与 golden 一致
    const positionStyle =
      store?.transitionStatus === "starting"
        ? "left: 0px; opacity: 0; position: absolute; top: 0px; transform: translate(0px, 0px);"
        : "left: 0px; position: absolute; top: 0px; transform: translate(0px, 0px);"
    const mergedStyle =
      style != null ? `${positionStyle} ${String(style)}` : positionStyle

    return mergeProps(
      { role: "presentation", style: mergedStyle },
      getStateAttributesProps({
        open: store?.open ?? false,
        side: side.value,
        align: align.value,
      }),
      { className, class: legacyClassName },
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Popup(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const store = useInjects(TOOLTIP_ROOT_KEY) as TooltipStore | undefined
  const pos = useInjects(TOOLTIP_POSITIONER_KEY) as
    | { side: string; align: string }
    | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const {
      className,
      class: legacyClassName,
      style,
      ...elementProps
    } = external

    return mergeProps(
      { tabindex: -1, "data-base-ui-focusable": "" },
      getStateAttributesProps({
        open: store?.open ?? false,
        side: pos?.side,
        align: pos?.align,
      }),
      {
        // 悬浮 popup 保持打开（Base UI hoverable popup 语义的简化版）
        onMouseEnter: () => undefined,
        ref: (el: Element | null) => {
          if (store) store.popupEl = el
        },
      },
      { className, class: legacyClassName, style },
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

function Arrow(props: HTMLAttributes & { render?: any }) {
  const { render, rest } = useProps(props, { render: undefined })
  const store = useInjects(TOOLTIP_ROOT_KEY) as TooltipStore | undefined
  const pos = useInjects(TOOLTIP_POSITIONER_KEY) as
    | { side: string; align: string }
    | undefined

  const merged = computed(() => {
    const external = rest.value as Record<string, any>
    const {
      className,
      class: legacyClassName,
      style,
      ...elementProps
    } = external
    const baseStyle = "position: absolute;"
    const mergedStyle =
      style != null ? `${baseStyle} ${String(style)}` : baseStyle

    return mergeProps(
      { "aria-hidden": "true", style: mergedStyle },
      getStateAttributesProps({
        open: store?.open ?? false,
        side: pos?.side,
        align: pos?.align,
        // Base UI floating-ui uncentered 中间件输出：happy-dom rect=0 恒为 true
        uncentered: true,
      }),
      { className, class: legacyClassName },
      elementProps
    )
  })

  return render.value == null ? (
    <div {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "div", merged.value, rest.value.children)
  )
}

// Base UI 同款命名空间形态：Tooltip.Root / Tooltip.Trigger / ...（纯对象容器）
const Tooltip = {
  Provider,
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow,
}

export {
  Arrow,
  Popup,
  Portal,
  Positioner,
  Provider,
  Root,
  Tooltip,
  Trigger,
  type TooltipStore,
}
