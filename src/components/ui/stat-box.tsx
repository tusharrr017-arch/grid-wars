import { memo } from "react"

interface StatBoxProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export const StatBox = memo(function StatBox({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
}: StatBoxProps) {
  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()

  return (
    <div className="rounded-xl border border-border/80 bg-secondary/50 px-3.5 py-3">
      <p className="text-label">{label}</p>
      <p className="mt-1.5 text-value-lg leading-none">
        {prefix}
        <span className="tabular-nums">{formatted}</span>
        {suffix && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
        )}
      </p>
    </div>
  )
})
