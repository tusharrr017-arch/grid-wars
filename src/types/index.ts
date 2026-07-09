export interface Tile {
  x: number
  y: number
  ownerId: string | null
  ownerName: string | null
  color: string | null
  updatedAt: number | null
}

export interface User {
  id: string
  name: string
  color: string
  tilesOwned: number
  online?: boolean
}

export interface CaptureEvent {
  id: string
  x: number
  y: number
  userId: string
  userName: string
  color: string
  timestamp: number
  previousOwner: string | null
}

export interface GameState {
  tiles: Tile[]
  users: User[]
  captures: CaptureEvent[]
  gridSize: number
  totalClaimed: number
  onlineCount?: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  color: string
  tilesOwned: number
  rank: number
}
