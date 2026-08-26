// Button 组件示例（md 页面通过 <script lang="tsx"> import 后以 <Demo /> 使用）
import { defineComponent } from "actview"
import { Button } from "@/registry/bases/base/ui/button"

export const ButtonVariantsDemo = defineComponent(function () {
  return function () {
    return (
      <div class="demo-card">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    )
  }
})

export const ButtonSizesDemo = defineComponent(function () {
  return function () {
    return (
      <div class="demo-card">
        <Button size="xs">X-Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon-sm" aria-label="搜索">
          🔍
        </Button>
        <Button size="icon" aria-label="设置">
          ⚙
        </Button>
        <Button size="icon-lg" aria-label="更多">
          ⋯
        </Button>
      </div>
    )
  }
})

export const ButtonStatesDemo = defineComponent(function () {
  return function () {
    return (
      <div class="demo-card">
        <Button disabled>Disabled</Button>
        <Button data-loading>
          <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading
        </Button>
      </div>
    )
  }
})

export const ButtonRenderDemo = defineComponent(function () {
  return function () {
    return (
      <div class="demo-card">
        <Button render={<a href="https://example.com" />}>
          As Link (render)
        </Button>
        <Button render={<button type="button" />} nativeButton={false}>
          Native Button
        </Button>
      </div>
    )
  }
})

export const ButtonWithIconDemo = defineComponent(function () {
  return function () {
    return (
      <div class="demo-card">
        <Button>
          <span aria-hidden="true">⬇</span> Download
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="刷新">
          ↻
        </Button>
      </div>
    )
  }
})
