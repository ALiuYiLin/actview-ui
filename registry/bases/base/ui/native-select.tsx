// 复刻 shadcn/ui registry/bases/base/ui/native-select.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；size 默认值用 computed；
// IconPlaceholder 直接渲染 svg（pointer-events-none 图标）
import {
  type HTMLAttributes,
  type OptionHTMLAttributes,
  type OptgroupHTMLAttributes,
  type SelectHTMLAttributes,
} from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"
import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"

type NativeSelectProps = Omit<SelectHTMLAttributes, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect(props: NativeSelectProps) {
  const { class: className, className: legacyClassName, size, key, ...rest } =
    toRefs(props)
  void key
  const sizeValue = computed(() => size?.value ?? "default")
  const wrapperClassName = computed(() =>
    cn(
      "cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50",
      className?.value,
      legacyClassName?.value
    )
  )

  return (
    <div
      className={wrapperClassName}
      data-slot="native-select-wrapper"
      data-size={sizeValue}
    >
      <select
        data-slot="native-select"
        data-size={sizeValue}
        className="cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
        {...rest}
      />
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconSelector"
        hugeicons="UnfoldMoreIcon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        className="cn-native-select-icon pointer-events-none absolute select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption(props: OptionHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const optionClassName = computed(() =>
    cn("bg-[Canvas] text-[CanvasText]", className?.value, legacyClassName?.value)
  )

  return (
    <option data-slot="native-select-option" className={optionClassName} {...rest} />
  )
}

function NativeSelectOptGroup(props: OptgroupHTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const optGroupClassName = computed(() =>
    cn("bg-[Canvas] text-[CanvasText]", className?.value, legacyClassName?.value)
  )

  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={optGroupClassName}
      {...rest}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
