import { memo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PlayerAvatarProps {
  name: string
  color: string
  size?: "sm" | "md" | "lg" | "xl"
  showTooltip?: boolean
  className?: string
}

const sizes = {
  sm: "h-7 w-7 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-10 w-10 text-xs",
  xl: "h-14 w-14 text-sm",
}

export const PlayerAvatar = memo(function PlayerAvatar({
  name,
  color,
  size = "md",
  showTooltip = true,
  className,
}: PlayerAvatarProps) {
  const initials = name.slice(0, 2).toUpperCase()

  const avatar = (
    <div
      className={cn("rounded-full p-px", className)}
      style={{ backgroundColor: `${color}99` }}
      aria-hidden={showTooltip}
    >
      <Avatar className={cn(sizes[size], "ring-2 ring-card")}>
        <AvatarFallback
          style={{ backgroundColor: color }}
          className="font-semibold text-white"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )

  if (!showTooltip) return avatar

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="rounded-full focus-ring" aria-label={name}>
          {avatar}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{name}</TooltipContent>
    </Tooltip>
  )
})
