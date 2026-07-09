"use client"

import { useEffect, useRef } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  className?: string
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const spring = useSpring(value, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v
    })
  }, [display])

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {value.toLocaleString()}
    </motion.span>
  )
}
