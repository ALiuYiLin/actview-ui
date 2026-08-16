// 复刻 shadcn/ui registry/bases/base/ui/native-select.tsx（源 commit a85299a），框架层 actview：
//   - 函数组件 + useProps（class/className 双写，解构后不进 rest 透传）
//   - IconPlaceholder 走 registry 组件（用户端 transform-icons 替换为 @actview/lucide 图标）
import { useProps } from "@actview/core"
import type {
  HTMLAttributes,
  OptionHTMLAttributes,
  SelectHTMLAttributes,
} from "@actview/jsx"

import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"
import { cn } from "@/registry/bases/base/lib/utils"

type NativeSelectProps = Omit<SelectHTMLAttributes, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect(props: NativeSelectProps) {
  const { size, class: className, className: legacyClassName, rest } = useProps(
    props,
    {
      size: (v) => v ?? "default",
      class: undefined,
      className: undefined,
    }
  )

  return (
    <div
      class={cn(
        "cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className.value,
        legacyClassName.value
      )}
      data-slot="native-select-wrapper"
      data-size={size.value}
    >
      <select
        data-slot="native-select"
        data-size={size.value}
        class="cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
        {...rest.value}
      />
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconSelector"
        hugeicons="UnfoldMoreIcon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        class="cn-native-select-icon pointer-events-none absolute select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption(props: OptionHTMLAttributes) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <option
      data-slot="native-select-option"
      class={cn("bg-[Canvas] text-[CanvasText]", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

function NativeSelectOptGroup(
  props: HTMLAttributes & { label?: string; disabled?: boolean }
) {
  const { class: className, className: legacyClassName, rest } = useProps(props, {
    class: undefined,
    className: undefined,
  })

  return (
    <optgroup
      data-slot="native-select-optgroup"
      class={cn("bg-[Canvas] text-[CanvasText]", className.value, legacyClassName.value)}
      {...rest.value}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
