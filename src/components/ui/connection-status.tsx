import { memo } from "react"
import { Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected"
  playerCount: number
  compact?: boolean
}

export const ConnectionStatus = memo(function ConnectionStatus({
  status,
  playerCount,
  compact = false,
}: ConnectionStatusProps) {
  if (status === "connecting") {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Connecting
      </div>
    )
  }

  if (status === "disconnected") {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/8 px-3 py-1.5 text-xs text-destructive"
        role="status"
        aria-live="polite"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
        Offline
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-xs"
      role="status"
      aria-live="polite"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
      <span className="font-medium text-emerald-400">Connected</span>
      {!compact && (
        <>
          <span className="text-muted-foreground/50" aria-hidden>·</span>
          <span className="text-muted-foreground">
            {playerCount} Online
          </span>
        </>
      )}
    </div>
  )
})
