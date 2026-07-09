"use client"

import { cn } from "@/lib/utils"

interface AuroraBackgroundProps {
  className?: string
  children?: React.ReactNode
  showRadialGradient?: boolean
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col h-full w-full overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "pointer-events-none absolute -inset-[10px] opacity-50",
            "[--aurora:repeating-linear-gradient(100deg,var(--primary)_10%,var(--accent)_15%,var(--primary)_20%,var(--muted)_25%,var(--primary)_30%)]",
            "[background-image:var(--aurora)]",
            "[background-size:300%_200%]",
            "[background-position:50%_50%]",
            "animate-aurora",
            "after:content-[''] after:absolute after:inset-0",
            "after:[background-image:var(--aurora)]",
            "after:[background-size:200%_100%]",
            "after:animate-aurora after:mix-blend-difference",
            "after:[background-attachment:fixed]",
            "blur-[10px] invert dark:invert-0"
          )}
        />
        {showRadialGradient && (
          <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]" />
        )}
      </div>
      {children}
      <style>{`
        @keyframes aurora {
          from { background-position: 50% 50%, 50% 50%; }
          to { background-position: 350% 50%, 350% 50%; }
        }
        .animate-aurora { animation: aurora 60s linear infinite; }
      `}</style>
    </div>
  )
}
