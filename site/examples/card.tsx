// Card 组件示例
import { defineComponent } from "actview"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/registry/bases/base/ui/card"
import { Button } from "@/registry/bases/base/ui/button"

export const CardSimpleDemo = defineComponent(function () {
  return function () {
    return (
      <div class="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>项目概览</CardTitle>
            <CardDescription>本月数据一览</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm">
              卡片内容区域 —— 放表单、图表或任意内容。
            </p>
          </CardContent>
          <CardFooter class="justify-between">
            <Button variant="ghost" size="sm">
              取消
            </Button>
            <Button size="sm">保存</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
})

export const CardWithActionDemo = defineComponent(function () {
  return function () {
    return (
      <div class="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>通知设置</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm" aria-label="更多">
                ⋯
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent class="text-sm">CardAction 位于标题行右侧。</CardContent>
        </Card>
      </div>
    )
  }
})
