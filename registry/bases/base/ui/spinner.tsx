// 复刻 shadcn/ui registry/bases/base/ui/spinner.tsx（源 commit a85299a），
// 框架层 actview：toRefs + JSX 自动解包 Ref；IconPlaceholder 直接渲染 svg
import { type HTMLAttributes } from "@actview/jsx"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"
import { IconPlaceholder } from "@/registry/bases/base/components/icon-placeholder"

function Spinner(props: HTMLAttributes) {
  const { class: className, className: legacyClassName, key, ...rest } =
    toRefs(props)
  void key
  const spinnerClassName = computed(() =>
    cn("size-4 animate-spin", className?.value, legacyClassName?.value)
  )

  return (
    <IconPlaceholder
      lucide="Loader2Icon"
      tabler="IconLoader"
      hugeicons="Loading03Icon"
      phosphor="SpinnerIcon"
      remixicon="RiLoaderLine"
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={spinnerClassName}
      {...rest}
    />
  )
}

export { Spinner }
