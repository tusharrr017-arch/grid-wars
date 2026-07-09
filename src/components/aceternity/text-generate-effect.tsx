"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TextGenerateEffectProps {
  words: string
  className?: string
  duration?: number
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
}: TextGenerateEffectProps) {
  const [mounted, setMounted] = useState(false)
  const wordArray = words.split(" ")

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("font-bold", className)}>
      <div className="flex flex-wrap">
        {wordArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={mounted ? { opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration, delay: idx * 0.1 }}
            className="mr-1.5"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
