import { useCallback, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { getOrCreatePlayerIdentity, updatePlayerIdentity } from "@/lib/player-identity"
import type { CaptureEvent, GameState, Tile, User } from "@/types"

type ConnectionStatus = "connecting" | "connected" | "disconnected"

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:3001"
  : window.location.origin

interface UseSocketReturn {
  status: ConnectionStatus
  currentUser: User | null
  tiles: Tile[]
  users: User[]
  captures: CaptureEvent[]
  gridSize: number
  totalClaimed: number
  onlineCount: number
  claimTile: (x: number, y: number) => void
  updateProfile: (name: string, color: string) => void
  updateUsername: (name: string) => void
  pulsingTiles: Readonly<Record<string, number>>
}

export function useSocket(): UseSocketReturn {
  const identityRef = useRef(getOrCreatePlayerIdentity())
  const playerIdRef = useRef(identityRef.current.playerId)
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const gridSizeRef = useRef(25)
  const currentUserRef = useRef<User | null>(null)
  const pulseTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [captures, setCaptures] = useState<CaptureEvent[]>([])
  const [gridSize, setGridSize] = useState(25)
  const [totalClaimed, setTotalClaimed] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  const [pulseVersions, setPulseVersions] = useState<Record<string, number>>({})

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  const addPulse = useCallback((x: number, y: number) => {
    const key = `${x}-${y}`
    const existing = pulseTimers.current.get(key)
    if (existing) clearTimeout(existing)

    setPulseVersions((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }))

    const timer = setTimeout(() => {
      pulseTimers.current.delete(key)
    }, 600)

    pulseTimers.current.set(key, timer)
  }, [])

  useEffect(() => {
    const identity = identityRef.current

    const socket = io(SOCKET_URL, {
      auth: {
        playerId: identity.playerId,
        name: identity.name,
        color: identity.color,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
    })

    socketRef.current = socket
    playerIdRef.current = identity.playerId

    socket.on("connect", () => setStatus("connected"))
    socket.on("disconnect", () => setStatus("disconnected"))
    socket.on("connect_error", () => setStatus("disconnected"))

    socket.on("init", ({ user, state }: { user: User; state: GameState & { onlineCount?: number } }) => {
      gridSizeRef.current = state.gridSize
      setCurrentUser(user)
      setTiles(state.tiles)
      setUsers(state.users)
      setCaptures(state.captures)
      setGridSize(state.gridSize)
      setTotalClaimed(state.totalClaimed)
      setOnlineCount(state.onlineCount ?? countOnline(state.users))

      if (user.color !== identityRef.current.color || user.name !== identityRef.current.name) {
        updatePlayerIdentity({ name: user.name, color: user.color })
        identityRef.current = {
          ...identityRef.current,
          name: user.name,
          color: user.color,
        }
      }
    })

    socket.on("tile-updated", (data: {
      tile: Tile
      capture: CaptureEvent
      users: User[]
      totalClaimed: number
      onlineCount?: number
    }) => {
      const size = gridSizeRef.current
      setTiles((prev) => {
        const next = [...prev]
        next[data.tile.y * size + data.tile.x] = data.tile
        return next
      })
      setCaptures((prev) => [data.capture, ...prev].slice(0, 30))
      setUsers(data.users)
      setTotalClaimed(data.totalClaimed)
      setOnlineCount(data.onlineCount ?? countOnline(data.users))

      if (data.tile.ownerId !== playerIdRef.current) {
        addPulse(data.tile.x, data.tile.y)
      }
    })

    socket.on("players-updated", (data: {
      users: User[]
      onlineCount?: number
      totalClaimed?: number
    }) => {
      setUsers(data.users)
      setOnlineCount(data.onlineCount ?? countOnline(data.users))
      if (data.totalClaimed !== undefined) setTotalClaimed(data.totalClaimed)
    })

    socket.on("player-joined", (user: User) => {
      setUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== user.id)
        return [...filtered, { ...user, online: true }]
      })
    })

    socket.on("user-updated", (data: {
      user: User
      users: User[]
      tiles: Tile[]
      onlineCount?: number
    }) => {
      const size = gridSizeRef.current
      setCurrentUser(data.user)
      setUsers(data.users)
      setOnlineCount(data.onlineCount ?? countOnline(data.users))
      updatePlayerIdentity({ name: data.user.name, color: data.user.color })
      identityRef.current = {
        ...identityRef.current,
        name: data.user.name,
        color: data.user.color,
      }
      setTiles((prev) => {
        const next = [...prev]
        for (const tile of data.tiles) {
          next[tile.y * size + tile.x] = tile
        }
        return next
      })
    })

    return () => {
      pulseTimers.current.forEach(clearTimeout)
      socket.disconnect()
      socketRef.current = null
    }
  }, [addPulse])

  const claimTile = useCallback((x: number, y: number) => {
    const socket = socketRef.current
    const playerId = playerIdRef.current
    if (!socket) return

    const me = currentUserRef.current

    setTiles((prev) => {
      const size = gridSizeRef.current
      const index = y * size + x
      const existing = prev[index]
      if (!existing) return prev

      const next = [...prev]
      next[index] = {
        ...existing,
        ownerId: playerId,
        ownerName: me?.name ?? identityRef.current.name,
        color: me?.color ?? identityRef.current.color,
        updatedAt: Date.now(),
      }
      return next
    })

    socket.emit("claim-tile", { x, y })
  }, [])

  const updateProfile = useCallback((name: string, color: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    updatePlayerIdentity({ name: trimmed, color })
    identityRef.current = { ...identityRef.current, name: trimmed, color }
    socketRef.current?.emit("update-profile", { name: trimmed, color })
    setCurrentUser((prev) =>
      prev ? { ...prev, name: trimmed, color, online: true } : prev
    )
  }, [])

  const updateUsername = useCallback((name: string) => {
    const me = currentUserRef.current
    updateProfile(name, me?.color ?? identityRef.current.color)
  }, [updateProfile])

  return {
    status,
    currentUser,
    tiles,
    users,
    captures,
    gridSize,
    totalClaimed,
    onlineCount,
    claimTile,
    updateProfile,
    updateUsername,
    pulsingTiles: pulseVersions,
  }
}

function countOnline(users: User[]): number {
  return users.filter((u) => u.online).length
}
