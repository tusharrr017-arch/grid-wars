import { memo } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PanelSectionProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  className?: string
}

export const PanelSection = memo(function PanelSection({
  icon: Icon,
  title,
  children,
  className,
}: PanelSectionProps) {
  return (
    <section className={cn("panel panel-interactive p-5", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-label">
        <Icon className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
        {title}
      </h2>
      {children}
    </section>
  )
})
