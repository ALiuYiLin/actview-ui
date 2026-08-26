// 复刻 shadcn/ui registry/bases/base/ui/progress.tsx（源 commit a85299a），
// 框架层 actview：原语 Progress（命名空间 Root/Track/Indicator/Label/Value）
import { Progress as ProgressPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Progress(props: ProgressPrimitive.Root.Props) {
  const { class: className, className: legacyClassName, value, children, key, ...rest } =
    toRefs(props)
  void key
  const progressClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-progress-root flex flex-wrap gap-3",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={progressClassName}
      {...rest}
    >
      {children?.value as any}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack(props: ProgressPrimitive.Track.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const trackClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-progress-track relative flex w-full items-center overflow-x-hidden",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <ProgressPrimitive.Track
      className={trackClassName}
      data-slot="progress-track"
      {...rest}
    />
  )
}

function ProgressIndicator(props: ProgressPrimitive.Indicator.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const indicatorClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-progress-indicator h-full transition-all",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={indicatorClassName}
      {...rest}
    />
  )
}

function ProgressLabel(props: ProgressPrimitive.Label.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const labelClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-progress-label",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <ProgressPrimitive.Label
      className={labelClassName}
      data-slot="progress-label"
      {...rest}
    />
  )
}

function ProgressValue(props: ProgressPrimitive.Value.Props) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const valueClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-progress-value",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <ProgressPrimitive.Value
      className={valueClassName}
      data-slot="progress-value"
      {...rest}
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
