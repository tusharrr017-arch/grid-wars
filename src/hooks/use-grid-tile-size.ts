import { useCallback, useEffect, useState, type RefObject } from "react"
import { DESKTOP_MIN_WIDTH } from "@/hooks/use-media-query"

export const TILE_GAP = 2
export const TILE_SIZE_MAX = 36
export const TILE_SIZE_MIN = 8

const NAV_HEIGHT_COMPACT = 56
const VIEWPORT_INSET_COMPACT = 16

function estimateTileSize(gridSize: number): number {
  if (typeof window === "undefined") return TILE_SIZE_MAX
  if (window.innerWidth >= DESKTOP_MIN_WIDTH) return TILE_SIZE_MAX
  const w = window.innerWidth - VIEWPORT_INSET_COMPACT
  const h = window.innerHeight - NAV_HEIGHT_COMPACT - VIEWPORT_INSET_COMPACT
  return computeTileSize(w, h, gridSize)
}

export function computeTileSize(
  availableWidth: number,
  availableHeight: number,
  gridSize: number
): number {
  if (availableWidth <= 0 || availableHeight <= 0 || gridSize <= 0) {
    return TILE_SIZE_MAX
  }

  const fromW = (availableWidth - (gridSize - 1) * TILE_GAP) / gridSize
  const fromH = (availableHeight - (gridSize - 1) * TILE_GAP) / gridSize
  const size = Math.min(TILE_SIZE_MAX, fromW, fromH)

  return Math.max(TILE_SIZE_MIN, Math.floor(size))
}

export function useGridTileSize(
  slotRef: RefObject<HTMLElement | null>,
  gridSize: number,
  enabled: boolean
): number {
  const [tileSize, setTileSize] = useState(() =>
    enabled ? estimateTileSize(gridSize) : TILE_SIZE_MAX
  )

  const measure = useCallback(() => {
    if (!enabled) {
      setTileSize(TILE_SIZE_MAX)
      return
    }
    const el = slotRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setTileSize(computeTileSize(width, height, gridSize))
  }, [slotRef, gridSize, enabled])

  useEffect(() => {
    if (!enabled) {
      setTileSize(TILE_SIZE_MAX)
      return
    }

    setTileSize(estimateTileSize(gridSize))
    measure()

    const el = slotRef.current
    if (!el) return

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("orientationchange", measure)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("orientationchange", measure)
      window.removeEventListener("resize", measure)
    }
  }, [slotRef, gridSize, measure, enabled])

  return tileSize
}
