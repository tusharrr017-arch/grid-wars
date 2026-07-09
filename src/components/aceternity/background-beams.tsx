"use client"

import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface BackgroundBeamsProps {
  className?: string
}

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  const paths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5} -${189 + i * 6}C-${380 - i * 5} -${189 + i * 6} -${312 - i * 5} ${216 - i * 6} ${152 - i * 5} ${343 - i * 6}C${616 - i * 5} ${470 - i * 6} ${684 - i * 5} ${875 - i * 6} ${684 - i * 5} ${875 - i * 6}`,
        opacity: 0.15 + i * 0.03,
        duration: 10 + i * 2,
      })),
    []
  )

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute h-full w-full"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke={`url(#gradient-beam-${path.id})`}
            strokeOpacity={path.opacity}
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {paths.map((path) => (
            <linearGradient
              key={path.id}
              id={`gradient-beam-${path.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="32.5%" stopColor="#6344F5" />
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  )
}
