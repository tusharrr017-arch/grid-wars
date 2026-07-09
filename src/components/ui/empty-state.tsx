import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-10 text-center", className)} role="status">
      <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-secondary/60">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
