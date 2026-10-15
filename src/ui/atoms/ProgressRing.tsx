interface ProgressRingProps {
  /** 0 to 1. */
  value: number
  size?: number
  label?: string
}

/** Small circular progress indicator. A full ring gets a filled center. */
export function ProgressRing({ value, size = 14, label }: ProgressRingProps) {
  const v = Math.max(0, Math.min(1, value))
  const r = size / 2 - 1.5
  const c = 2 * Math.PI * r
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `${Math.round(v * 100)}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        style={{ stroke: 'var(--border-strong)' }}
        strokeWidth={1.5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill={v >= 1 ? 'var(--fg)' : 'none'}
        style={{
          stroke: 'var(--fg)',
          transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)',
        }}
        strokeWidth={1.5}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - v)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
