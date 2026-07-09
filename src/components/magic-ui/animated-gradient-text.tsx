"use client"

import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-gradient bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        "bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40]",
        className
      )}
      style={{
        // @ts-expect-error css variable
        "--bg-size": "300%",
        animation: "gradient-shift 8s ease infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </span>
  )
}
