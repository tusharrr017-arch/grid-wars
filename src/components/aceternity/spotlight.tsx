"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      container.style.setProperty("--spotlight-x", `${x}px`)
      container.style.setProperty("--spotlight-y", `${y}px`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        // @ts-expect-error css vars
        "--spotlight-x": "50%",
        "--spotlight-y": "50%",
      }}
    >
      <div
        className="absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl transition-transform duration-75 ease-out"
        style={{
          left: "var(--spotlight-x)",
          top: "var(--spotlight-y)",
          background: `radial-gradient(circle, ${fill} 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}
