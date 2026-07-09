"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TopNav } from "@/components/layout/top-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { GameGrid } from "@/components/grid/game-grid"
import { Onboarding } from "@/components/layout/onboarding"
import { useSocket } from "@/hooks/use-socket"
import { useTheme } from "@/hooks/use-theme"
import { useIsMobile, useIsTablet } from "@/hooks/use-media-query"
import { useOnboardingDemo } from "@/hooks/use-onboarding-demo"
import { isOnboardingComplete } from "@/lib/player-identity"
import { cn } from "@/lib/utils"

const DEMO_GRID_SIZE = 25

export default function App() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const { theme, toggleTheme } = useTheme()
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete())

  const {
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
    pulsingTiles,
  } = useSocket()

  const demo = useOnboardingDemo(showOnboarding, gridSize || DEMO_GRID_SIZE)

  const displayTiles = showOnboarding && demo ? demo.tiles : tiles
  const displayUsers = showOnboarding && demo ? demo.users : users
  const displayCaptures = showOnboarding && demo ? demo.captures : captures
  const displayTotalClaimed = showOnboarding && demo ? demo.totalClaimed : totalClaimed
  const displayOnlineCount = showOnboarding && demo ? demo.onlineCount : onlineCount
  const displayPulsing = showOnboarding && demo ? demo.pulsingTiles : pulsingTiles
  const displayGridSize = showOnboarding ? DEMO_GRID_SIZE : gridSize
  const gridReady = showOnboarding ? !!demo : tiles.length > 0

  const sidebarWidth = isTablet ? "md:pr-[272px]" : "md:pr-[300px]"

  const handleOnboardingComplete = (name: string, color: string) => {
    updateProfile(name, color)
    setShowOnboarding(false)
  }

  return (
    <TooltipProvider delayDuration={250}>
      <a href="#main-content" className="skip-link">
        Skip to grid
      </a>

      <div className="relative flex h-full w-full flex-col bg-app">
        <div className="pointer-events-none absolute inset-0 bg-noise" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-dot-grid" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden />

        <TopNav
          users={displayUsers}
          currentUser={showOnboarding ? null : currentUser}
          status={status}
          theme={theme}
          totalClaimed={displayTotalClaimed}
          gridSize={displayGridSize}
          onlineCount={displayOnlineCount}
          onToggleTheme={toggleTheme}
          onUpdateUsername={updateUsername}
        />

        <main
          id="main-content"
          className={cn(
            "relative z-10 flex min-h-0 flex-1 pt-[64px]",
            !isMobile && sidebarWidth
          )}
          aria-label="Game board"
        >
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {gridReady ? (
              <GameGrid
                tiles={displayTiles}
                gridSize={displayGridSize}
                currentUserId={showOnboarding ? null : currentUser?.id ?? null}
                pulseVersions={displayPulsing}
                onClaim={showOnboarding ? () => {} : claimTile}
              />
            ) : (
              <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
                <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                <p className="text-sm text-muted-foreground">Connecting to server…</p>
              </div>
            )}
          </div>
        </main>

        <Sidebar
          users={displayUsers}
          tiles={displayTiles}
          captures={displayCaptures}
          totalClaimed={displayTotalClaimed}
          gridSize={displayGridSize}
          currentUserId={showOnboarding ? null : currentUser?.id ?? null}
        />

        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
