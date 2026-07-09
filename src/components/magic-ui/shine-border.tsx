"use client"

import { cn } from "@/lib/utils"

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string | string[]
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
  children,
}: ShineBorderProps) {
  const gradient = Array.isArray(color) ? color.join(", ") : color

  return (
    <div
      className={cn("relative rounded-lg p-px", className)}
      style={{
        borderRadius: `${borderRadius}px`,
        background: `linear-gradient(90deg, ${gradient})`,
        backgroundSize: "200% 100%",
        animation: `shine-border ${duration}s linear infinite`,
      }}
    >
      <div
        className="relative h-full w-full rounded-[inherit] bg-background"
        style={{ borderRadius: `${borderRadius - borderWidth}px` }}
      >
        {children}
      </div>
      <style>{`
        @keyframes shine-border {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  )
}
