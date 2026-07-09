import { useCallback, useEffect, useState, type RefObject } from "react"

export const TILE_GAP = 2
export const TILE_SIZE_MAX = 36
export const TILE_SIZE_MIN = 8

const NAV_HEIGHT_MOBILE = 56
const NAV_HEIGHT_DESKTOP = 64
const VIEWPORT_INSET_MOBILE = 16
const VIEWPORT_INSET_DESKTOP = 48

function estimateTileSize(gridSize: number): number {
  if (typeof window === "undefined") return TILE_SIZE_MAX
  const nav = window.innerWidth < 768 ? NAV_HEIGHT_MOBILE : NAV_HEIGHT_DESKTOP
  const inset = window.innerWidth < 768 ? VIEWPORT_INSET_MOBILE : VIEWPORT_INSET_DESKTOP
  const w = window.innerWidth - inset
  const h = window.innerHeight - nav - inset
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
  gridSize: number
): number {
  const [tileSize, setTileSize] = useState(() => estimateTileSize(gridSize))

  const measure = useCallback(() => {
    const el = slotRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setTileSize(computeTileSize(width, height, gridSize))
  }, [slotRef, gridSize])

  useEffect(() => {
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
  }, [slotRef, gridSize, measure])

  return tileSize
}
