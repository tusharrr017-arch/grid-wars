"use client"

import { useMemo, useState } from "react"
import { Grid3x3, Sun, Moon, Pencil, Check, X, Users, MapPin, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlayerAvatar } from "@/components/ui/player-avatar"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { User } from "@/types"

interface TopNavProps {
  users: User[]
  currentUser: User | null
  status: "connecting" | "connected" | "disconnected"
  theme: "light" | "dark"
  totalClaimed: number
  gridSize: number
  onlineCount: number
  onToggleTheme: () => void
  onUpdateUsername: (name: string) => void
}

export function TopNav({
  users,
  currentUser,
  status,
  theme,
  totalClaimed,
  gridSize,
  onlineCount,
  onToggleTheme,
  onUpdateUsername,
}: TopNavProps) {
  const isCompact = useMediaQuery("(max-width: 1023px)")
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState("")

  const totalTiles = gridSize * gridSize
  const coverage = useMemo(
    () => (totalTiles > 0 ? ((totalClaimed / totalTiles) * 100).toFixed(1) : "0.0"),
    [totalClaimed, totalTiles]
  )

  const onlineUsers = useMemo(() => users.filter((u) => u.online), [users])

  const saveName = () => {
    if (nameInput.trim()) onUpdateUsername(nameInput.trim())
    setEditing(false)
  }

  return (
    <header className="nav-bar">
      <div className="mx-auto flex h-[64px] max-w-[1920px] items-center gap-5 px-5 sm:px-8">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="logo-mark" aria-hidden>
            <Grid3x3 className="h-[18px] w-[18px] text-foreground" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">Grid</h1>
            <p className="hidden text-[11px] tracking-wide text-muted-foreground sm:block">
              Territory control
            </p>
          </div>
        </div>

        {/* Center stats pills */}
        <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          <StatPill icon={MapPin} label="Claimed" value={`${totalClaimed}`} sub={`/ ${totalTiles}`} />
          <StatPill icon={Percent} label="Coverage" value={`${coverage}%`} />
          <StatPill icon={Users} label="Online" value={`${onlineCount}`} />
        </div>

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <div className="hidden items-center -space-x-2 md:flex" aria-label="Online players">
            {onlineUsers.slice(0, 4).map((user) => (
              <PlayerAvatar key={user.id} name={user.name} color={user.color} size="sm" />
            ))}
            {onlineCount > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-[10px] font-medium text-muted-foreground">
                +{onlineCount - 4}
              </div>
            )}
          </div>

          <ConnectionStatus status={status} playerCount={onlineCount} compact={isCompact} />

          <div className="player-badge">
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName()
                    if (e.key === "Escape") setEditing(false)
                  }}
                  className="w-24 bg-transparent text-sm outline-none focus-ring rounded sm:w-28"
                  maxLength={20}
                  aria-label="Username"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveName} aria-label="Save">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)} aria-label="Cancel">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameInput(currentUser?.name ?? "")
                  setEditing(true)
                }}
                className="flex max-w-[140px] items-center gap-2.5 group focus-ring rounded-lg sm:max-w-none"
                aria-label="Edit username"
              >
                {currentUser && (
                  <PlayerAvatar
                    name={currentUser.name}
                    color={currentUser.color}
                    size="sm"
                    showTooltip={false}
                  />
                )}
                <span className="truncate text-sm font-medium tracking-[-0.01em]">
                  {currentUser?.name ?? "…"}
                </span>
                <Pencil className="hidden h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-9 w-9 shrink-0 rounded-[10px] border border-transparent hover:border-border hover:bg-card focus-ring"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}

function StatPill({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="stat-pill">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/80" strokeWidth={2} />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-semibold tabular-nums tracking-tight text-foreground">
          {value}
          {sub && <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">{sub}</span>}
        </p>
      </div>
    </div>
  )
}
