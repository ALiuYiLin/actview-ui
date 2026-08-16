// 效果呈现页：三套 style 构建物并排对比 + CLI 落盘组件 + actview 响应式演示
//
// - @/styles/** 直接引用仓库根 styles 构建物（等价 @actview/ui/styles/* exports）
// - @/components/** 是 CLI 落盘组件（当前 components.json style）
// - actview 特色：ref 响应式计数器（createApp + 函数组件 + 原生事件）
import { ref } from "actview"
import { Download, Plus, Trash2 } from "@actview/lucide"

import { Button as AuroraButton } from "@/styles/base-aurora/ui/button"
import {
  ButtonGroup as AuroraGroup,
  ButtonGroupText as AuroraGroupText,
} from "@/styles/base-aurora/ui/button-group"
import { Button as EmberButton } from "@/styles/base-ember/ui/button"
import {
  ButtonGroup as EmberGroup,
  ButtonGroupText as EmberGroupText,
} from "@/styles/base-ember/ui/button-group"
import { Button as MistButton } from "@/styles/base-mist/ui/button"
import {
  ButtonGroup as MistGroup,
  ButtonGroupText as MistGroupText,
} from "@/styles/base-mist/ui/button-group"

// CLI 落盘组件（components/ui，style = components.json 配置的 base-mist）
import { Button as InstalledButton } from "@/components/ui/button"

function Counter() {
  const count = ref(0)
  return (
    <div class="flex items-center gap-3">
      <InstalledButton onClick={() => count.value++}>
        点击 +1（actview ref 响应式）
      </InstalledButton>
      <span class="text-2xl font-bold tabular-nums">count = {count.value}</span>
    </div>
  )
}

function AuroraSection() {
  return (
    <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-neutral-900">aurora · 绿色玻璃拟态</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <AuroraButton>Default</AuroraButton>
        <AuroraButton variant="outline">Outline</AuroraButton>
        <AuroraButton variant="secondary">Secondary</AuroraButton>
        <AuroraButton variant="ghost">Ghost</AuroraButton>
        <AuroraButton variant="destructive">Destructive</AuroraButton>
        <AuroraButton variant="link">Link</AuroraButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <AuroraButton size="sm">Small</AuroraButton>
        <AuroraButton size="default">Default</AuroraButton>
        <AuroraButton size="lg">Large</AuroraButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <AuroraButton size="icon">
          <Plus />
        </AuroraButton>
        <AuroraButton size="icon" variant="outline">
          <Trash2 />
        </AuroraButton>
        <AuroraButton>
          <Plus /> 新建项目
        </AuroraButton>
        <AuroraButton variant="outline">
          <Download /> 下载
        </AuroraButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <AuroraGroup>
          <AuroraButton>编辑</AuroraButton>
          <AuroraButton variant="outline">复制</AuroraButton>
          <AuroraGroupText>更多</AuroraGroupText>
        </AuroraGroup>
        <AuroraGroup orientation="vertical">
          <AuroraButton>上</AuroraButton>
          <AuroraButton variant="outline">下</AuroraButton>
        </AuroraGroup>
      </div>
    </section>
  )
}

function EmberSection() {
  return (
    <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-neutral-900">ember · 红色硬朗直角</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <EmberButton>Default</EmberButton>
        <EmberButton variant="outline">Outline</EmberButton>
        <EmberButton variant="secondary">Secondary</EmberButton>
        <EmberButton variant="ghost">Ghost</EmberButton>
        <EmberButton variant="destructive">Destructive</EmberButton>
        <EmberButton variant="link">Link</EmberButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <EmberButton size="sm">Small</EmberButton>
        <EmberButton size="default">Default</EmberButton>
        <EmberButton size="lg">Large</EmberButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <EmberButton size="icon">
          <Plus />
        </EmberButton>
        <EmberButton size="icon" variant="outline">
          <Trash2 />
        </EmberButton>
        <EmberButton>
          <Plus /> 新建项目
        </EmberButton>
        <EmberButton variant="outline">
          <Download /> 下载
        </EmberButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <EmberGroup>
          <EmberButton>编辑</EmberButton>
          <EmberButton variant="outline">复制</EmberButton>
          <EmberGroupText>更多</EmberGroupText>
        </EmberGroup>
        <EmberGroup orientation="vertical">
          <EmberButton>上</EmberButton>
          <EmberButton variant="outline">下</EmberButton>
        </EmberGroup>
      </div>
    </section>
  )
}

function MistSection() {
  return (
    <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-neutral-900">mist · 紫色胶囊柔和</h2>
      <div class="mt-4 flex flex-wrap gap-2">
        <MistButton>Default</MistButton>
        <MistButton variant="outline">Outline</MistButton>
        <MistButton variant="secondary">Secondary</MistButton>
        <MistButton variant="ghost">Ghost</MistButton>
        <MistButton variant="destructive">Destructive</MistButton>
        <MistButton variant="link">Link</MistButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <MistButton size="sm">Small</MistButton>
        <MistButton size="default">Default</MistButton>
        <MistButton size="lg">Large</MistButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <MistButton size="icon">
          <Plus />
        </MistButton>
        <MistButton size="icon" variant="outline">
          <Trash2 />
        </MistButton>
        <MistButton>
          <Plus /> 新建项目
        </MistButton>
        <MistButton variant="outline">
          <Download /> 下载
        </MistButton>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <MistGroup>
          <MistButton>编辑</MistButton>
          <MistButton variant="outline">复制</MistButton>
          <MistGroupText>更多</MistGroupText>
        </MistGroup>
        <MistGroup orientation="vertical">
          <MistButton>上</MistButton>
          <MistButton variant="outline">下</MistButton>
        </MistGroup>
      </div>
    </section>
  )
}

export function App() {
  return (
    <div class="min-h-screen bg-neutral-50 py-10 text-neutral-800">
      <div class="mx-auto flex max-w-4xl flex-col gap-6 px-6">
        <header>
          <h1 class="text-2xl font-bold text-neutral-900">
            actview-ui 组件呈现页
          </h1>
          <p class="mt-1 text-sm text-neutral-500">
            三套 style 构建物（@/styles/**）并排对比 · CLI 落盘组件
            （@/components/ui，style = base-mist）· actview ref 响应式
          </p>
        </header>
        <AuroraSection />
        <EmberSection />
        <MistSection />
        <section class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-neutral-900">响应式演示</h2>
          <div class="mt-4">
            <Counter />
          </div>
        </section>
      </div>
    </div>
  )
}
