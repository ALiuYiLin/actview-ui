// 复刻 shadcn/ui registry/bases/base/ui/slider.tsx（源 commit a85299a），
// 框架层 actview：原语 Slider（命名空间 Root/Control/Track/Indicator/Thumb）；
// _values（thumb 数量）由 value/defaultValue/min/max 计算
import { Slider as SliderPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Slider(props: SliderPrimitive.Root.Props) {
  const {
    class: className,
    className: legacyClassName,
    defaultValue,
    value,
    min,
    max,
    key,
    ...rest
  } = toRefs(props)
  void key

  const values = computed(() => {
    const v = value?.value
    if (Array.isArray(v)) return v
    const dv = defaultValue?.value
    if (Array.isArray(dv)) return dv
    return [min?.value ?? 0, max?.value ?? 100]
  })

  const sliderClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "data-horizontal:w-full data-vertical:h-full",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <SliderPrimitive.Root
      className={sliderClassName}
      data-slot="slider"
      defaultValue={defaultValue?.value}
      value={value?.value}
      min={min?.value ?? 0}
      max={max?.value ?? 100}
      thumbAlignment="edge"
      {...rest}
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
