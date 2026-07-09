const STORAGE_KEY = "grid-player"
const ONBOARDING_KEY = "grid-onboarding-complete"

export interface PlayerIdentity {
  playerId: string
  name: string
  color: string
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true"
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true")
}

export function getOrCreatePlayerIdentity(): PlayerIdentity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerIdentity
      if (parsed.playerId && parsed.name && parsed.color) return parsed
    }
  } catch {
    // corrupt storage — regenerate below
  }

  const playerId = crypto.randomUUID()
  const identity: PlayerIdentity = {
    playerId,
    name: generatePlayerName(),
    color: pickColorForPlayer(playerId),
  }

  savePlayerIdentity(identity)
  return identity
}

export function savePlayerIdentity(identity: PlayerIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
}

export function updatePlayerIdentity(
  updates: Partial<Pick<PlayerIdentity, "name" | "color">>
): PlayerIdentity {
  const current = getOrCreatePlayerIdentity()
  const next = { ...current, ...updates }
  savePlayerIdentity(next)
  return next
}

export function generatePlayerName(): string {
  const adj = ["Neon", "Cosmic", "Velvet", "Shadow", "Crystal", "Aurora", "Pixel", "Nova"]
  const noun = ["Fox", "Wolf", "Hawk", "Tiger", "Raven", "Phoenix", "Lynx", "Comet"]
  const a = adj[Math.floor(Math.random() * adj.length)]
  const n = noun[Math.floor(Math.random() * noun.length)]
  return `${a}${n}${Math.floor(Math.random() * 900) + 100}`
}

export const PLAYER_PALETTE = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#ef4444", "#f97316", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
] as const

const PALETTE = PLAYER_PALETTE

export function randomColor(exclude: string[] = []): string {
  const taken = new Set(exclude.map((c) => c.toLowerCase()))
  const available = PALETTE.filter((c) => !taken.has(c.toLowerCase()))
  const pool = available.length > 0 ? available : PALETTE
  return pool[Math.floor(Math.random() * pool.length)]
}

export function pickColorForPlayer(playerId: string, exclude: string[] = []): string {
  const preferred = colorFromId(playerId)
  const taken = new Set(exclude.map((c) => c.toLowerCase()))
  if (!taken.has(preferred.toLowerCase())) return preferred
  return randomColor(exclude)
}

export function colorFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
