import type { Tile, User } from "@/types"

export interface LeaderboardPlayer extends User {
  online: boolean
}

/** Derive accurate tile counts from the grid — not just the online users list */
export function computeLeaderboard(tiles: Tile[], onlineUsers: User[]): LeaderboardPlayer[] {
  const map = new Map<string, LeaderboardPlayer>()

  for (const user of onlineUsers) {
    map.set(user.id, { ...user, tilesOwned: 0, online: true })
  }

  for (const tile of tiles) {
    if (!tile.ownerId) continue

    const existing = map.get(tile.ownerId)
    if (existing) {
      existing.tilesOwned++
      if (tile.ownerName) existing.name = tile.ownerName
      if (tile.color) existing.color = tile.color
    } else {
      map.set(tile.ownerId, {
        id: tile.ownerId,
        name: tile.ownerName ?? "Unknown",
        color: tile.color ?? "#6366f1",
        tilesOwned: 1,
        online: false,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.tilesOwned - a.tilesOwned)
}

export function getPlayerRank(
  leaderboard: LeaderboardPlayer[],
  userId: string | null
): number {
  if (!userId) return 0
  const index = leaderboard.findIndex((p) => p.id === userId)
  return index === -1 ? 0 : index + 1
}
