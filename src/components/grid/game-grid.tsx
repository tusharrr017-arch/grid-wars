import { memo, useMemo, useRef } from "react"
import { GridTile } from "./grid-tile"
import { TILE_GAP, TILE_SIZE_MAX, useGridTileSize } from "@/hooks/use-grid-tile-size"
import { useIsCompactLayout } from "@/hooks/use-media-query"

interface TileData {
  x: number
  y: number
  ownerId: string | null
  ownerName: string | null
  color: string | null
}

interface GameGridProps {
  tiles: TileData[]
  gridSize: number
  currentUserId: string | null
  pulseVersions: Readonly<Record<string, number>>
  onClaim: (x: number, y: number) => void
}

export const GameGrid = memo(function GameGrid({
  tiles,
  gridSize,
  currentUserId,
  pulseVersions,
  onClaim,
}: GameGridProps) {
  const isCompact = useIsCompactLayout()
  const gridSlotRef = useRef<HTMLDivElement>(null)
  const tileSize = useGridTileSize(gridSlotRef, gridSize, isCompact)

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
      gap: TILE_GAP,
      width: gridSize * (tileSize + TILE_GAP) - TILE_GAP,
      height: gridSize * (tileSize + TILE_GAP) - TILE_GAP,
    }),
    [gridSize, tileSize]
  )

  const tileElements = tiles.map((tile) => {
    const key = `${tile.x}-${tile.y}`
    return (
      <GridTile
        key={key}
        x={tile.x}
        y={tile.y}
        ownerId={tile.ownerId}
        ownerName={tile.ownerName}
        color={tile.color}
        size={tileSize}
        isMine={tile.ownerId === currentUserId}
        pulseVersion={pulseVersions[key] ?? 0}
        onClaim={onClaim}
      />
    )
  })

  if (!isCompact) {
    return (
      <div className="game-grid-viewport--desktop">
        <div className="grid-panel">
          <p className="grid-panel-label">Territory map</p>
          <div
            className="grid gpu"
            style={gridStyle}
            role="grid"
            aria-label={`${gridSize} by ${gridSize} territory grid`}
            aria-rowcount={gridSize}
            aria-colcount={gridSize}
          >
            {tileElements}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-grid-viewport">
      <div className="grid-panel grid-panel--fit">
        <p className="grid-panel-label grid-panel-label--compact">Territory map</p>
        <div ref={gridSlotRef} className="grid-slot">
          <div
            className="grid gpu"
            style={gridStyle}
            role="grid"
            aria-label={`${gridSize} by ${gridSize} territory grid`}
            aria-rowcount={gridSize}
            aria-colcount={gridSize}
          >
            {tileElements}
          </div>
        </div>
      </div>
    </div>
  )
})

export const TILE_SIZE = TILE_SIZE_MAX
