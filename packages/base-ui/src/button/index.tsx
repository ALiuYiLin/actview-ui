// @actview/base-ui Button：复刻 Base UI button（1.6.0）的 DOM 契约与行为。
// DOM 契约（React golden 验证，见 test/fixtures/golden/button.*.html）：
//   native（默认）: <button type="button" tabindex="0">
//     disabled                 → + disabled + data-disabled=""
//     focusableWhenDisabled+disabled → + data-disabled="" aria-disabled="true"（无 disabled 属性）
//   nativeButton=false: <button role="button">，disabled 时 tabindex=-1 / aria-disabled
//   render prop: 自定义元素/组件（vnode 浅克隆合并，元素自身 props 优先）
// 规范：函数组件 + useProps（defineComponentPlugin 构建期转换，不手写 defineComponent）。
// props 合成用 computed：惰性求值 + 依赖追踪，解决 setup 只跑一次的快照问题
// （props/状态更新后 computed 重算，JSX 内 .value 读取实时可达 render）。
import { computed, useProps } from "@actview/core"
import type { ButtonHTMLAttributes } from "@actview/jsx"

import { getStateAttributesProps } from "../internals/state-attributes"
import { makeEventPreventable, mergeProps } from "../merge-props"
import { mergeRenderProps } from "../use-render"

function Button(
  props: ButtonHTMLAttributes & {
    disabled?: boolean
    focusableWhenDisabled?: boolean
    nativeButton?: boolean
    render?: any
  }
) {
  const {
    disabled,
    focusableWhenDisabled,
    nativeButton,
    render,
    rest,
  } = useProps(props, {
    disabled: (v) => v ?? false,
    focusableWhenDisabled: (v) => v ?? false,
    nativeButton: (v) => v ?? true,
    render: undefined,
  })

  const merged = computed(() => {
    const isNative = nativeButton.value
    const focusable = focusableWhenDisabled.value
    const isDisabled = disabled.value
    const external = rest.value as Record<string, any>

    // 复刻 useButton.getButtonProps：条件调用用户 handler（disabled 拦截）
    const {
      onClick: userOnClick,
      onMouseDown: userOnMouseDown,
      onKeyUp: userOnKeyUp,
      onKeyDown: userOnKeyDown,
      onPointerDown: userOnPointerDown,
      ...otherExternal
    } = external

    const buttonHandlers = {
      onClick(event: any) {
        if (isDisabled) {
          event.preventDefault()
          return
        }
        userOnClick?.(event)
      },
      onMouseDown(event: any) {
        if (!isDisabled) {
          userOnMouseDown?.(event)
        }
      },
      onKeyDown(event: any) {
        if (isDisabled) return
        makeEventPreventable(event)
        userOnKeyDown?.(event)
        if (event.baseUIHandlerPrevented) return
        // composite 分支（Toolbar/Menu 场景）随 menu/toolbar 原语补充
      },
      onKeyUp(event: any) {
        if (isDisabled) return
        makeEventPreventable(event)
        userOnKeyUp?.(event)
        if (event.baseUIHandlerPrevented) return
        // 非 native 元素空格激活（Base UI 键盘可达性）
        if (
          event.target === event.currentTarget &&
          !isNative &&
          event.key === " "
        ) {
          userOnClick?.(event)
        }
      },
      onPointerDown(event: any) {
        if (isDisabled) {
          event.preventDefault()
          return
        }
        userOnPointerDown?.(event)
      },
    }

    // 复刻 useFocusableWhenDisabled（composite=false 分支）
    const focusableProps: Record<string, any> = {
      onKeyDown(event: any) {
        if (isDisabled && focusable && event.key !== "Tab") {
          event.preventDefault()
        }
      },
      tabindex: 0,
    }
    if (!isNative && isDisabled) {
      focusableProps.tabindex = focusable ? 0 : -1
    }
    if ((isNative && focusable) || (!isNative && isDisabled)) {
      // React 对 aria-* 的 false 渲染为 "false" 属性，actview false 会删属性，
      // 统一 String 化保证 DOM 一致（golden 验证）
      focusableProps["aria-disabled"] = String(isDisabled)
    }
    if (isNative && !focusable) {
      focusableProps.disabled = isDisabled
    }

    return mergeProps(
      buttonHandlers,
      isNative ? { type: "button" } : { role: "button" },
      focusableProps,
      getStateAttributesProps({ disabled: isDisabled }),
      otherExternal
    )
  })

  return render.value == null ? (
    <button {...merged.value} />
  ) : (
    mergeRenderProps(render.value, "button", merged.value, rest.value.children)
  )
}

export { Button }
