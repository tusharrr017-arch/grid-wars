"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Shuffle } from "lucide-react"
import { PlayerAvatar } from "@/components/ui/player-avatar"
import {
  completeOnboarding,
  generatePlayerName,
  getOrCreatePlayerIdentity,
  pickColorForPlayer,
  PLAYER_PALETTE,
  randomColor,
  updatePlayerIdentity,
} from "@/lib/player-identity"

const EASE = [0.22, 1, 0.36, 1] as const

/** Curated subset for quick selection — full palette still available via shuffle */
const PICKER_COLORS = [
  PLAYER_PALETTE[0],
  PLAYER_PALETTE[2],
  PLAYER_PALETTE[4],
  PLAYER_PALETTE[6],
  PLAYER_PALETTE[8],
  PLAYER_PALETTE[10],
  PLAYER_PALETTE[12],
  PLAYER_PALETTE[14],
  PLAYER_PALETTE[1],
  PLAYER_PALETTE[9],
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

interface OnboardingProps {
  onComplete: (name: string, color: string) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const identity = useMemo(() => getOrCreatePlayerIdentity(), [])
  const [name, setName] = useState(() => identity.name || generatePlayerName())
  const [color, setColor] = useState(
    () => identity.color || pickColorForPlayer(identity.playerId)
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const finish = (displayName: string, playerColor: string) => {
    const finalName = displayName.trim() || generatePlayerName()
    updatePlayerIdentity({ name: finalName, color: playerColor })
    completeOnboarding()
    onComplete(finalName, playerColor)
  }

  const shuffleColor = () => {
    setColor(randomColor([color]))
  }

  if (!mounted) return null

  const previewName = name.trim() || "You"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="onboarding-scrim"
      role="dialog"
      aria-modal
      aria-label="Join Grid Wars"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.06 }}
        className="onboarding-popover"
      >
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h1 variants={item} className="onboarding-popover-title">
            Grid Wars
          </motion.h1>

          <motion.p variants={item} className="onboarding-popover-desc">
            Everyone shares one grid. Pick a name and color to join.
          </motion.p>

          <motion.div variants={item} className="onboarding-popover-field">
            <label htmlFor="display-name" className="onboarding-popover-label">
              Name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="How you appear to others"
              className="onboarding-popover-input focus-ring"
              autoComplete="off"
              spellCheck={false}
            />
          </motion.div>

          <motion.div variants={item} className="onboarding-popover-field">
            <span className="onboarding-popover-label">Color</span>

            <div className="onboarding-color-picker">
              <div className="onboarding-color-grid" role="listbox" aria-label="Territory color">
                {PICKER_COLORS.map((c) => {
                  const selected = c.toLowerCase() === color.toLowerCase()
                  return (
                    <button
                      key={c}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setColor(c)}
                      className="onboarding-color-option focus-ring"
                      style={{ backgroundColor: c }}
                    >
                      {selected && <span className="onboarding-color-option-ring" aria-hidden />}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={shuffleColor}
                  className="onboarding-color-shuffle focus-ring"
                  aria-label="Random color"
                >
                  <Shuffle strokeWidth={2} />
                </button>
              </div>

              <div className="onboarding-preview">
                <PlayerAvatar
                  name={previewName}
                  color={color}
                  size="xl"
                  showTooltip={false}
                />
                <div className="onboarding-preview-text">
                  <span className="onboarding-preview-name">{previewName}</span>
                  <span className="onboarding-preview-hint">Shown on tiles you claim</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="onboarding-popover-actions">
            <button
              type="button"
              onClick={() => finish(name, color)}
              className="onboarding-popover-btn onboarding-popover-btn--primary focus-ring"
            >
              Join grid
            </button>
            <button
              type="button"
              onClick={() => finish(name, color)}
              className="onboarding-popover-btn onboarding-popover-btn--secondary focus-ring"
            >
              Use defaults
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
