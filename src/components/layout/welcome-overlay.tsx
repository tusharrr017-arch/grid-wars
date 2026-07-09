"use client"

import { motion } from "framer-motion"
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect"
import { LampEffect } from "@/components/aceternity/lamp-effect"

export function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div className="text-center px-6" onClick={(e) => e.stopPropagation()}>
        <LampEffect>
          <TextGenerateEffect
            words="Claim Your Territory"
            className="text-4xl md:text-5xl tracking-tight mb-4"
          />
        </LampEffect>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
        >
          Click tiles to claim them. Compete with others in real-time on a shared 25×25 grid.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDismiss}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
        >
          Enter the Grid
        </motion.button>
      </div>
    </motion.div>
  )
}
