"use client"

import { cn } from "@/lib/utils"
import { type ReactNode, useEffect, useState } from "react"

interface RippleProps {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
  className?: string
}

export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70
        const opacity = mainCircleOpacity - i * 0.03
        return (
          <div
            key={i}
            className="absolute rounded-full border bg-foreground/5"
            style={{
              width: size,
              height: size,
              opacity: Math.max(opacity, 0),
              animation: `ripple-pulse ${3 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes ripple-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

interface RippleContainerProps {
  children: ReactNode
  className?: string
}

export function RippleContainer({ children, className }: RippleContainerProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    const timers = ripples.map((r) =>
      setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== r.id)), 600)
    )
    return () => timers.forEach(clearTimeout)
  }, [ripples])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipples((prev) => [
      ...prev,
      { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() },
    ])
  }

  return (
    <div className={cn("relative overflow-hidden", className)} onClick={handleClick}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: "translate(-50%, -50%)",
            animation: "click-ripple 0.6s ease-out forwards",
          }}
        />
      ))}
      {children}
      <style>{`
        @keyframes click-ripple {
          to { width: 200px; height: 200px; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
