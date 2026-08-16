// 复刻 shadcn/ui registry/bases/base/ui/slider.tsx（源 commit a85299a），框架层 actview：
//   - 原语层 @actview/base-ui/slider（data-horizontal/data-vertical/data-disabled）
//   - 函数组件 + useProps + computed；_values 长度决定 Thumb 数量
import { Slider as SliderPrimitive } from "@actview/base-ui/slider"
import { computed, useProps } from "@actview/core"
import type { HTMLAttributes } from "@actview/jsx"

import { cn } from "@/registry/bases/base/lib/utils"

function Slider(
  props: HTMLAttributes & {
    value?: number[]
    defaultValue?: number[]
    min?: number
    max?: number
    disabled?: boolean
    orientation?: "horizontal" | "vertical"
    onValueChange?: (value: number[]) => void
  }
) {
  const {
    class: className,
    className: legacyClassName,
    value,
    defaultValue,
    min,
    max,
    rest,
  } = useProps(props, {
    class: undefined,
    className: undefined,
    value: undefined,
    defaultValue: undefined,
    min: (v) => v ?? 0,
    max: (v) => v ?? 100,
  })

  const mergedClass = computed(() =>
    cn(
      "data-horizontal:w-full data-vertical:h-full",
      className.value,
      legacyClassName.value
    )
  )

  const values = computed<number[]>(() => {
    if (Array.isArray(value.value)) return value.value
    if (Array.isArray(defaultValue.value)) return defaultValue.value
    return [min.value, max.value]
  })

  return (
    <SliderPrimitive.Root
      className={mergedClass.value}
      data-slot="slider"
      defaultValue={defaultValue.value}
      value={value.value}
      min={min.value}
      max={max.value}
      thumbAlignment="edge"
      {...rest.value}
    >
      <SliderPrimitive.Control className="cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="cn-slider-track relative grow overflow-hidden select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="cn-slider-range select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: values.value.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
