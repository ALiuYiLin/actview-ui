"use client"

import type { HTMLAttributes } from "react"

import { cn } from "@/utilities/cn"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      role="separator"
      data-slot="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cn(
        "bg-red-600 shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
