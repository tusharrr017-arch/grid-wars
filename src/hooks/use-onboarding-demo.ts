import { useCallback, useEffect, useRef, useState } from "react"
import type { CaptureEvent, Tile, User } from "@/types"

const DEMO_PLAYERS: User[] = [
  { id: "demo-violet", name: "VioletFox", color: "#8b5cf6", tilesOwned: 0, online: true },
  { id: "demo-cyan", name: "NeonWolf", color: "#06b6d4", tilesOwned: 0, online: true },
  { id: "demo-orange", name: "CrystalRaven", color: "#f97316", tilesOwned: 0, online: true },
  { id: "demo-pink", name: "ShadowLynx", color: "#ec4899", tilesOwned: 0, online: true },
]

const SEED_CLUSTERS = [
  { playerIndex: 0, cx: 6, cy: 6 },
  { playerIndex: 1, cx: 18, cy: 7 },
  { playerIndex: 2, cx: 7, cy: 18 },
  { playerIndex: 3, cx: 17, cy: 17 },
]

function createEmptyTiles(gridSize: number): Tile[] {
  const tiles: Tile[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      tiles.push({ x, y, ownerId: null, ownerName: null, color: null, updatedAt: null })
    }
  }
  return tiles
}

function tileIndex(x: number, y: number, gridSize: number) {
  return y * gridSize + x
}

function seedBoard(tiles: Tile[], gridSize: number, now: number) {
  for (const { playerIndex, cx, cy } of SEED_CLUSTERS) {
    const player = DEMO_PLAYERS[playerIndex]
    const queue: [number, number][] = [[cx, cy]]
    const visited = new Set<string>()
    let claimed = 0
    const target = 10 + playerIndex * 3

    while (queue.length > 0 && claimed < target) {
      const [x, y] = queue.shift()!
      const key = `${x}-${y}`
      if (visited.has(key)) continue
      visited.add(key)
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue

      const idx = tileIndex(x, y, gridSize)
      tiles[idx] = {
        ...tiles[idx],
        ownerId: player.id,
        ownerName: player.name,
        color: player.color,
        updatedAt: now - (target - claimed) * 4000,
      }
      claimed++

      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
  }
}

function buildUsersFromTiles(tiles: Tile[]): User[] {
  const counts = new Map<string, number>()
  for (const tile of tiles) {
    if (!tile.ownerId) continue
    counts.set(tile.ownerId, (counts.get(tile.ownerId) ?? 0) + 1)
  }

  return DEMO_PLAYERS.map((p) => ({
    ...p,
    tilesOwned: counts.get(p.id) ?? 0,
  })).sort((a, b) => b.tilesOwned - a.tilesOwned)
}

function buildSeedCaptures(tiles: Tile[]): CaptureEvent[] {
  const claimed = tiles
    .filter((t) => t.ownerId)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, 12)

  return claimed.map((tile, i) => ({
    id: `seed-${tile.x}-${tile.y}`,
    x: tile.x,
    y: tile.y,
    userId: tile.ownerId!,
    userName: tile.ownerName!,
    color: tile.color!,
    timestamp: Date.now() - i * 3200,
    previousOwner: null,
  }))
}

function createInitialState(gridSize: number) {
  const now = Date.now()
  const tiles = createEmptyTiles(gridSize)
  seedBoard(tiles, gridSize, now)
  const users = buildUsersFromTiles(tiles)
  const captures = buildSeedCaptures(tiles)
  const totalClaimed = tiles.filter((t) => t.ownerId).length

  return { tiles, users, captures, totalClaimed }
}

export interface OnboardingDemoState {
  tiles: Tile[]
  users: User[]
  captures: CaptureEvent[]
  totalClaimed: number
  onlineCount: number
  pulsingTiles: Record<string, number>
}

export function useOnboardingDemo(enabled: boolean, gridSize: number): OnboardingDemoState | null {
  const gridSizeRef = useRef(gridSize)
  gridSizeRef.current = gridSize

  const [state, setState] = useState<OnboardingDemoState | null>(() =>
    enabled ? { ...createInitialState(gridSize), onlineCount: DEMO_PLAYERS.length, pulsingTiles: {} } : null
  )

  const pulseTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const addPulse = useCallback((x: number, y: number) => {
    const key = `${x}-${y}`
    const existing = pulseTimers.current.get(key)
    if (existing) clearTimeout(existing)

    setState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pulsingTiles: { ...prev.pulsingTiles, [key]: (prev.pulsingTiles[key] ?? 0) + 1 },
      }
    })

    pulseTimers.current.set(
      key,
      setTimeout(() => pulseTimers.current.delete(key), 600)
    )
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState(null)
      return
    }

    setState({ ...createInitialState(gridSizeRef.current), onlineCount: DEMO_PLAYERS.length, pulsingTiles: {} })

    const tick = () => {
      setState((prev) => {
        if (!prev) return prev

        const tiles = [...prev.tiles]
        const empty: number[] = []
        const occupied: number[] = []

        for (let i = 0; i < tiles.length; i++) {
          if (tiles[i].ownerId) occupied.push(i)
          else empty.push(i)
        }

        if (empty.length === 0 && occupied.length === 0) return prev

        const steal = empty.length === 0 || (occupied.length > 0 && Math.random() < 0.12)
        let idx: number
        let previousOwner: string | null = null

        if (steal && occupied.length > 0) {
          idx = occupied[Math.floor(Math.random() * occupied.length)]!
          previousOwner = tiles[idx].ownerName
        } else if (empty.length > 0) {
          idx = empty[Math.floor(Math.random() * empty.length)]!
        } else {
          return prev
        }

        const player = DEMO_PLAYERS[Math.floor(Math.random() * DEMO_PLAYERS.length)]!
        const tile = tiles[idx]
        const now = Date.now()

        tiles[idx] = {
          ...tile,
          ownerId: player.id,
          ownerName: player.name,
          color: player.color,
          updatedAt: now,
        }

        const capture: CaptureEvent = {
          id: `${now}-${tile.x}-${tile.y}`,
          x: tile.x,
          y: tile.y,
          userId: player.id,
          userName: player.name,
          color: player.color,
          timestamp: now,
          previousOwner,
        }

        const users = buildUsersFromTiles(tiles)
        const totalClaimed = tiles.filter((t) => t.ownerId).length

        queueMicrotask(() => addPulse(tile.x, tile.y))

        return {
          ...prev,
          tiles,
          users,
          captures: [capture, ...prev.captures].slice(0, 30),
          totalClaimed,
        }
      })
    }

    const schedule = () => {
      const delay = 900 + Math.random() * 1400
      return window.setTimeout(() => {
        tick()
        timerId = schedule()
      }, delay)
    }

    let timerId = schedule()
    return () => {
      clearTimeout(timerId)
      pulseTimers.current.forEach(clearTimeout)
      pulseTimers.current.clear()
    }
  }, [enabled, addPulse])

  return enabled ? state : null
}
