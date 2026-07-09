import { memo } from "react"
import { Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected"
  playerCount: number
  compact?: boolean
  minimal?: boolean
}

export const ConnectionStatus = memo(function ConnectionStatus({
  status,
  playerCount,
  compact = false,
  minimal = false,
}: ConnectionStatusProps) {
  if (status === "connecting") {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground sm:px-3"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {!minimal && <span>Connecting</span>}
        {minimal && <span className="sr-only">Connecting</span>}
      </div>
    )
  }

  if (status === "disconnected") {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/8 px-2.5 py-1.5 text-xs text-destructive sm:px-3"
        role="status"
        aria-live="polite"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />
        {!minimal && <span>Offline</span>}
        {minimal && <span className="sr-only">Offline</span>}
      </div>
    )
  }

  if (minimal) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/8"
        role="status"
        aria-live="polite"
        aria-label={`Connected, ${playerCount} online`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-xs sm:px-3"
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
