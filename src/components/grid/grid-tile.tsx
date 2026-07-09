import { memo, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface GridTileProps {
  x: number
  y: number
  ownerId: string | null
  ownerName: string | null
  color: string | null
  size: number
  isMine: boolean
  pulseVersion: number
  onClaim: (x: number, y: number) => void
}

export const GridTile = memo(
  function GridTile({
    x,
    y,
    ownerId,
    ownerName,
    color,
    size,
    isMine,
    pulseVersion,
    onClaim,
  }: GridTileProps) {
    const isClaimed = ownerId !== null
    const overlayRef = useRef<HTMLSpanElement>(null)
    const prevPulse = useRef(pulseVersion)

    const handleClick = useCallback(() => {
      const overlay = overlayRef.current
      if (overlay) {
        overlay.classList.remove("tile-overlay--click", "tile-overlay--remote")
        void overlay.offsetWidth
        overlay.classList.add("tile-overlay--click")
      }
      onClaim(x, y)
    }, [onClaim, x, y])

    useEffect(() => {
      if (pulseVersion > prevPulse.current) {
        const overlay = overlayRef.current
        if (overlay) {
          overlay.classList.remove("tile-overlay--click", "tile-overlay--remote")
          void overlay.offsetWidth
          overlay.classList.add("tile-overlay--remote")
        }
      }
      prevPulse.current = pulseVersion
    }, [pulseVersion])

    const label = isClaimed
      ? `Tile ${x + 1}, ${y + 1}. Owned by ${ownerName}`
      : `Tile ${x + 1}, ${y + 1}. Unclaimed`

    return (
      <button
        type="button"
        role="gridcell"
        aria-label={label}
        aria-selected={isMine}
        onClick={handleClick}
        className={cn(
          "tile-base focus-ring",
          isClaimed ? "tile-owned" : "tile-unclaimed",
          isClaimed && isMine && "tile-owned-mine"
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: isClaimed ? color ?? undefined : undefined,
        }}
      >
        <span ref={overlayRef} className="tile-overlay" aria-hidden />
      </button>
    )
  },
  (prev, next) =>
    prev.ownerId === next.ownerId &&
    prev.color === next.color &&
    prev.ownerName === next.ownerName &&
    prev.isMine === next.isMine &&
    prev.pulseVersion === next.pulseVersion &&
    prev.size === next.size
)
