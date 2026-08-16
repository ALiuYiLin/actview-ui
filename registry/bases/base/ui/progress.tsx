// 复刻 shadcn/ui registry/bases/base/ui/progress.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/progress（data-progressing/data-complete/data-indeterminate）
//   - 函数组件 + useProps + computed
import { Progress as ProgressPrimitive } from "@actview/base-ui/progress"
import { computed, useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Progress(
  props: HTMLAttributes & { value?: number | null; min?: number; max?: number }
) {
  const { class: className, className: legacyClassName, children, rest } =
    useProps(props, {
      class: undefined,
      className: undefined,
      children: undefined,
    })

  const mergedClass = computed(() =>
    cn("cn-progress-root flex flex-wrap gap-3", className.value, legacyClassName.value)
  )

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={mergedClass.value}
      {...rest.value}
    >
      {children.value}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "cn-progress-track relative flex w-full items-center overflow-x-hidden",
      className.value,
      legacyClassName.value
    )
  )
  return (
    <ProgressPrimitive.Track
      className={mergedClass.value}
      data-slot="progress-track"
      {...rest.value}
    />
  )
}

function ProgressIndicator(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn(
      "cn-progress-indicator h-full transition-all",
      className.value,
      legacyClassName.value
    )
  )
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={mergedClass.value}
      {...rest.value}
    />
  )
}

function ProgressLabel(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn("cn-progress-label", className.value, legacyClassName.value)
  )
  return (
    <ProgressPrimitive.Label
      className={mergedClass.value}
      data-slot="progress-label"
      {...rest.value}
    />
  )
}

function ProgressValue(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(
    props,
    { class: undefined, className: undefined }
  )
  const mergedClass = computed(() =>
    cn("cn-progress-value", className.value, legacyClassName.value)
  )
  return (
    <ProgressPrimitive.Value
      className={mergedClass.value}
      data-slot="progress-value"
      {...rest.value}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
