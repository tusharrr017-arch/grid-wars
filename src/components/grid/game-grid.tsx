import { memo, useMemo } from "react"
import { GridTile } from "./grid-tile"

export const TILE_SIZE = 36
export const TILE_GAP = 2

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
  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)`,
      gap: TILE_GAP,
      width: gridSize * (TILE_SIZE + TILE_GAP) - TILE_GAP,
      height: gridSize * (TILE_SIZE + TILE_GAP) - TILE_GAP,
    }),
    [gridSize]
  )

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto px-6 py-8 sm:px-10">
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
          {tiles.map((tile) => {
            const key = `${tile.x}-${tile.y}`
            return (
              <GridTile
                key={key}
                x={tile.x}
                y={tile.y}
                ownerId={tile.ownerId}
                ownerName={tile.ownerName}
                color={tile.color}
                size={TILE_SIZE}
                isMine={tile.ownerId === currentUserId}
                pulseVersion={pulseVersions[key] ?? 0}
                onClaim={onClaim}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})
