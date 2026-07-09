import { useEffect, useState } from "react"

/** Viewports below this width use the compact (mobile/tablet) layout */
export const DESKTOP_MIN_WIDTH = 1000

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}

/** Phone — bottom sheet stats, minimal nav */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)")
}

/** Compact layout — dynamic grid, condensed chrome (< 1000px) */
export function useIsCompactLayout() {
  return useMediaQuery(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`)
}

/** Desktop layout — fixed grid, full sidebar (≥ 1000px) */
export function useIsDesktopLayout() {
  return useMediaQuery(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
}

/** Tablet within compact range */
export function useIsTablet() {
  return useMediaQuery(`(min-width: 768px) and (max-width: ${DESKTOP_MIN_WIDTH - 1}px)`)
}
