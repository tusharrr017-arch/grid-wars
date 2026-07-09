"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Trophy, Activity, BarChart3, ChevronLeft, ChevronRight, X } from "lucide-react"
import { PanelSection } from "@/components/ui/panel-section"
import { StatBox } from "@/components/ui/stat-box"
import { PlayerAvatar } from "@/components/ui/player-avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatTimeAgo } from "@/lib/utils"
import { computeLeaderboard, getPlayerRank } from "@/lib/leaderboard"
import { useIsMobile, useIsTablet } from "@/hooks/use-media-query"
import type { CaptureEvent, Tile, User } from "@/types"

interface SidebarProps {
  users: User[]
  tiles: Tile[]
  captures: CaptureEvent[]
  totalClaimed: number
  gridSize: number
  currentUserId: string | null
}

export function Sidebar({
  users,
  tiles,
  captures,
  totalClaimed,
  gridSize,
  currentUserId,
}: SidebarProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const totalTiles = gridSize * gridSize
  const claimPercent = totalTiles > 0 ? (totalClaimed / totalTiles) * 100 : 0

  const leaderboard = useMemo(
    () => computeLeaderboard(tiles, users).map((u, i) => ({ ...u, rank: i + 1 })),
    [tiles, users]
  )

  const maxTiles = useMemo(
    () => Math.max(...leaderboard.map((u) => u.tilesOwned), 1),
    [leaderboard]
  )

  const currentUserRank = getPlayerRank(leaderboard, currentUserId)

  const content = (
    <div className="flex flex-col gap-3 p-4">
      <PanelSection icon={BarChart3} title="Statistics">
        <div className="grid grid-cols-2 gap-2.5">
          <StatBox label="Claimed" value={totalClaimed} suffix={`/${totalTiles}`} />
          <StatBox label="Coverage" value={claimPercent} suffix="%" decimals={1} />
          <StatBox label="Players" value={users.length} />
          <StatBox label="Your rank" value={currentUserRank} prefix="#" />
        </div>
      </PanelSection>

      <Leaderboard entries={leaderboard} maxTiles={maxTiles} currentUserId={currentUserId} />
      <ActivityFeed captures={captures} />
    </div>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-lg focus-ring md:hidden"
          aria-label="Open stats panel"
        >
          <BarChart3 className="h-4 w-4" strokeWidth={2} />
          Stats
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal aria-label="Stats panel">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-hidden />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background feed-enter">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3.5">
                <span className="text-sm font-semibold tracking-tight">Overview</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card focus-ring"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {content}
            </div>
          </div>
        )}
      </>
    )
  }

  if (isTablet && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-xl border border-r-0 border-border bg-card px-2 py-3 shadow-md focus-ring"
        aria-label="Expand sidebar"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    )
  }

  return (
    <aside
      className={cn(
        "fixed right-0 top-[64px] z-40 flex h-[calc(100%-64px)] flex-col border-l border-border bg-background",
        isTablet ? "w-[272px]" : "w-[300px]"
      )}
      aria-label="Game statistics"
    >
      {isTablet && (
        <button
          onClick={() => setCollapsed(true)}
          className="absolute -left-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm focus-ring"
          aria-label="Collapse sidebar"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
      <div className="flex-1 overflow-y-auto">{content}</div>
    </aside>
  )
}

const Leaderboard = memo(function Leaderboard({
  entries,
  maxTiles,
  currentUserId,
}: {
  entries: (User & { rank: number })[]
  maxTiles: number
  currentUserId: string | null
}) {
  return (
    <PanelSection icon={Trophy} title="Leaderboard">
      {entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No rankings yet"
          description="Claim tiles to appear on the board."
        />
      ) : (
        <ol className="space-y-2" aria-label="Player rankings">
          {entries.slice(0, 8).map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              maxTiles={maxTiles}
              isCurrentUser={entry.id === currentUserId}
            />
          ))}
        </ol>
      )}
    </PanelSection>
  )
})

const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  maxTiles,
  isCurrentUser,
}: {
  entry: User & { rank: number; online?: boolean }
  maxTiles: number
  isCurrentUser: boolean
}) {
  const barWidth = (entry.tilesOwned / maxTiles) * 100

  return (
    <li
      className={cn(
        "rounded-xl px-3 py-2.5 transition-colors",
        isCurrentUser && "bg-accent ring-1 ring-border"
      )}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <RankBadge rank={entry.rank} />
        <PlayerAvatar name={entry.name} color={entry.color} size="sm" showTooltip={false} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {entry.name}
          {!entry.online && (
            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">away</span>
          )}
        </span>
        <span className="text-sm font-semibold tabular-nums text-muted-foreground">
          {entry.tilesOwned}
        </span>
      </div>
      <div
        className="h-[3px] overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={entry.tilesOwned}
        aria-valuemin={0}
        aria-valuemax={maxTiles}
        aria-label={`${entry.name} territory`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${barWidth}%`, backgroundColor: entry.color }}
        />
      </div>
    </li>
  )
})

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: "rank-gold",
    2: "rank-silver",
    3: "rank-bronze",
  }

  return (
    <span
      className={`rank-badge ${styles[rank] ?? "rank-default"}`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  )
}

const ActivityFeed = memo(function ActivityFeed({ captures }: { captures: CaptureEvent[] }) {
  const prevTopId = useRef<string | null>(null)
  const newestId = captures[0]?.id ?? null
  const shouldAnimate = newestId !== null && newestId !== prevTopId.current

  useEffect(() => {
    prevTopId.current = newestId
  }, [newestId])

  return (
    <PanelSection icon={Activity} title="Activity">
      {captures.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No captures yet"
          description="Territory changes will stream here live."
        />
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto" aria-label="Recent captures" aria-live="polite">
          {captures.slice(0, 20).map((capture) => (
            <li
              key={capture.id}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5",
                capture.id === newestId && shouldAnimate && "feed-enter"
              )}
            >
              <PlayerAvatar
                name={capture.userName}
                color={capture.color}
                size="sm"
                showTooltip={false}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed">
                  <span className="font-semibold" style={{ color: capture.color }}>
                    {capture.userName}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}captured{" "}
                    <span className="font-mono text-[11px]">
                      {capture.x},{capture.y}
                    </span>
                  </span>
                </p>
                <time className="mt-0.5 block text-[10px] text-muted-foreground">
                  {formatTimeAgo(capture.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  )
})
