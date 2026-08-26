// 复刻 shadcn/ui registry/bases/base/ui/switch.tsx（源 commit a85299a），
// 框架层 actview：原语 Switch（命名空间 Root/Thumb）；size 默认值 computed
import { Switch as SwitchPrimitive } from "@actview/base-ui"
import { computed, toRefs } from "@actview/core"

import { cn } from "@/registry/bases/base/lib/utils"

function Switch(props: SwitchPrimitive.Root.Props & { size?: "sm" | "default" }) {
  const { class: className, className: legacyClassName, size, key, ...rest } =
    toRefs(props)
  void key
  const sizeValue = computed(() => size?.value ?? "default")
  const switchClassName = computed(() => {
    const cls = className?.value
    const legacy = legacyClassName?.value
    return cn(
      "cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
      typeof cls === "string" ? cls : undefined,
      typeof legacy === "string" ? legacy : undefined
    )
  })

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={sizeValue}
      className={switchClassName}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="cn-switch-thumb pointer-events-none block ring-0 transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
