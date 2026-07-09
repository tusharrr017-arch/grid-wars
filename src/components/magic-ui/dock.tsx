"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DockProps {
  className?: string
  children: React.ReactNode
}

export function Dock({ className, children }: DockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex items-end gap-2 rounded-2xl glass-strong px-3 py-2",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

interface DockIconProps {
  className?: string
  children: React.ReactNode
  label?: string
  onClick?: () => void
}

export function DockIcon({ className, children, label, onClick }: DockIconProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 text-foreground transition-colors hover:bg-secondary",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
