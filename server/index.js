import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import express from "express"

const GRID_SIZE = 25
const PORT = 3001
const PLAYER_TTL_MS = 30 * 60 * 1000

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#ef4444", "#f97316", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
]

function colorFromId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getTakenColors(exceptPlayerId = null) {
  const taken = new Set()
  for (const [id, player] of players) {
    if (id !== exceptPlayerId && player.color) {
      taken.add(player.color.toLowerCase())
    }
  }
  return taken
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Prefer `preferred`; if taken by another player, pick the next free color. */
function pickUniqueColor(preferred, playerId) {
  const taken = getTakenColors(playerId)
  const normalized = typeof preferred === "string" ? preferred.toLowerCase() : null

  if (normalized && !taken.has(normalized)) {
    return preferred
  }

  const seed = colorFromId(playerId)
  const ordered = [seed, ...COLORS.filter((c) => c.toLowerCase() !== seed.toLowerCase())]

  for (const c of ordered) {
    if (!taken.has(c.toLowerCase())) return c
  }

  for (let i = 0; i < 360; i++) {
    const hue = (Math.abs(hashCode(playerId)) + i * 47) % 360
    const candidate = hslToHex(hue, 72, 54)
    if (!taken.has(candidate.toLowerCase())) return candidate
  }

  return seed
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function syncPlayerColorToTiles(playerId, color) {
  for (const tile of tiles) {
    if (tile.ownerId === playerId) tile.color = color
  }
}

function createInitialTiles() {
  const tiles = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles.push({ x, y, ownerId: null, ownerName: null, color: null, updatedAt: null })
    }
  }
  return tiles
}

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
})

let tiles = createInitialTiles()
const captures = []

/** playerId -> player record */
const players = new Map()
/** socket.id -> playerId */
const socketToPlayer = new Map()
/** playerId -> Set<socket.id> — multiple tabs = one online player */
const playerSockets = new Map()

function getTileIndex(x, y) {
  return y * GRID_SIZE + x
}

function getTotalClaimed() {
  return tiles.filter((t) => t.ownerId !== null).length
}

function syncOnlineStatus(playerId) {
  const player = players.get(playerId)
  if (!player) return
  const sockets = playerSockets.get(playerId)
  player.online = !!(sockets && sockets.size > 0)
  if (player.online) player.lastSeen = Date.now()
}

function getOnlineCount() {
  let count = 0
  for (const player of players.values()) {
    if (player.online) count++
  }
  return count
}

function addPlayerSocket(playerId, socketId) {
  if (!playerSockets.has(playerId)) playerSockets.set(playerId, new Set())
  playerSockets.get(playerId).add(socketId)
  syncOnlineStatus(playerId)
}

function removePlayerSocket(playerId, socketId) {
  const sockets = playerSockets.get(playerId)
  if (!sockets) return
  sockets.delete(socketId)
  if (sockets.size === 0) playerSockets.delete(playerId)
  syncOnlineStatus(playerId)
}

function playerToUser(player) {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    tilesOwned: player.tilesOwned ?? 0,
    online: player.online,
  }
}

function getLeaderboardUsers() {
  const byOwner = new Map()

  for (const player of players.values()) {
    byOwner.set(player.id, { ...playerToUser(player), tilesOwned: 0 })
  }

  for (const tile of tiles) {
    if (!tile.ownerId) continue
    const existing = byOwner.get(tile.ownerId)
    if (existing) {
      existing.tilesOwned++
      if (tile.ownerName) existing.name = tile.ownerName
      if (tile.color) existing.color = tile.color
    } else {
      byOwner.set(tile.ownerId, {
        id: tile.ownerId,
        name: tile.ownerName ?? "Unknown",
        color: tile.color ?? "#6366f1",
        tilesOwned: 1,
        online: false,
      })
    }
  }

  for (const entry of byOwner.values()) {
    const player = players.get(entry.id)
    if (player) player.tilesOwned = entry.tilesOwned
  }

  return Array.from(byOwner.values())
}

function getGameState() {
  return {
    tiles,
    users: getLeaderboardUsers(),
    captures: captures.slice(0, 50),
    gridSize: GRID_SIZE,
    totalClaimed: getTotalClaimed(),
    onlineCount: getOnlineCount(),
  }
}

function broadcastPlayersUpdated() {
  io.emit("players-updated", {
    users: getLeaderboardUsers(),
    onlineCount: getOnlineCount(),
    totalClaimed: getTotalClaimed(),
  })
}

function resolvePlayer(auth) {
  const { playerId, name, color } = auth ?? {}
  if (!playerId || typeof playerId !== "string") return null

  let player = players.get(playerId)

  if (!player) {
    const requested =
      typeof color === "string" ? color : colorFromId(playerId)
    const assigned = pickUniqueColor(requested, playerId)

    player = {
      id: playerId,
      name: typeof name === "string" && name.trim() ? name.trim().slice(0, 20) : `Player${Math.floor(Math.random() * 9000) + 1000}`,
      color: assigned,
      online: false,
      lastSeen: Date.now(),
      tilesOwned: 0,
    }
    players.set(playerId, player)
    return { player, isNew: true, colorChanged: assigned.toLowerCase() !== requested.toLowerCase() }
  }

  if (typeof name === "string" && name.trim()) player.name = name.trim().slice(0, 20)

  const requested =
    typeof color === "string" ? color : player.color
  const assigned = pickUniqueColor(requested, playerId)
  const colorChanged = assigned.toLowerCase() !== player.color.toLowerCase()
  player.color = assigned
  if (colorChanged) syncPlayerColorToTiles(playerId, assigned)

  player.lastSeen = Date.now()

  return { player, isNew: false, colorChanged }
}

function releasePlayerTiles(playerId) {
  for (const tile of tiles) {
    if (tile.ownerId === playerId) {
      tile.ownerId = null
      tile.ownerName = null
      tile.color = null
      tile.updatedAt = null
    }
  }
}

function cleanupStalePlayers() {
  const now = Date.now()
  let changed = false

  for (const [playerId, player] of players) {
    if (player.online) continue
    if (now - player.lastSeen < PLAYER_TTL_MS) continue

    releasePlayerTiles(playerId)
    players.delete(playerId)
    playerSockets.delete(playerId)
    changed = true
  }

  if (changed) broadcastPlayersUpdated()
}

setInterval(cleanupStalePlayers, 60_000)

io.on("connection", (socket) => {
  const resolved = resolvePlayer(socket.handshake.auth)

  if (!resolved) {
    socket.emit("error", { message: "Missing player identity" })
    socket.disconnect(true)
    return
  }

  const { player, isNew, colorChanged } = resolved
  const playerId = player.id

  socketToPlayer.set(socket.id, playerId)
  addPlayerSocket(playerId, socket.id)

  socket.emit("init", { user: playerToUser(player), state: getGameState() })

  if (colorChanged) {
    io.emit("user-updated", {
      user: playerToUser(player),
      users: getLeaderboardUsers(),
      onlineCount: getOnlineCount(),
      tiles: tiles.filter((t) => t.ownerId === playerId),
    })
  }

  if (isNew) {
    socket.broadcast.emit("player-joined", playerToUser(player))
  }
  broadcastPlayersUpdated()

  socket.on("claim-tile", ({ x, y }) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return

    const index = getTileIndex(x, y)
    const tile = tiles[index]
    const previousOwner = tile.ownerName

    tile.ownerId = playerId
    tile.ownerName = player.name
    tile.color = player.color
    tile.updatedAt = Date.now()

    const capture = {
      id: `${Date.now()}-${x}-${y}`,
      x, y,
      userId: playerId,
      userName: player.name,
      color: player.color,
      timestamp: Date.now(),
      previousOwner,
    }

    captures.unshift(capture)
    if (captures.length > 100) captures.pop()

    io.emit("tile-updated", {
      tile,
      capture,
      users: getLeaderboardUsers(),
      onlineCount: getOnlineCount(),
      totalClaimed: getTotalClaimed(),
    })
  })

  socket.on("update-profile", ({ name, color }) => {
    if (typeof name === "string") {
      const trimmed = name.trim().slice(0, 20)
      if (trimmed) {
        player.name = trimmed
        for (const tile of tiles) {
          if (tile.ownerId === playerId) tile.ownerName = trimmed
        }
      }
    }
    if (typeof color === "string") {
      const assigned = pickUniqueColor(color, playerId)
      player.color = assigned
      syncPlayerColorToTiles(playerId, assigned)
    }

    io.emit("user-updated", {
      user: playerToUser(player),
      users: getLeaderboardUsers(),
      onlineCount: getOnlineCount(),
      tiles: tiles.filter((t) => t.ownerId === playerId),
    })
  })

  socket.on("disconnect", () => {
    socketToPlayer.delete(socket.id)
    removePlayerSocket(playerId, socket.id)
    broadcastPlayersUpdated()
  })
})

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    players: players.size,
    online: getOnlineCount(),
    claimed: getTotalClaimed(),
  })
})

httpServer.listen(PORT, () => {
  console.log(`Grid server running on http://localhost:${PORT}`)
})

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use.`)
    console.error(`Stop it: netstat -ano | findstr :${PORT} then taskkill /PID <pid> /F\n`)
    process.exit(1)
  }
  throw err
})
