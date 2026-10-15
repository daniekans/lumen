interface SparklineProps {
  values: readonly number[]
  width?: number
  height?: number
  color?: string
  /** Fix the lower bound of the y range, e.g. 0 for a loss curve. */
  min?: number
}

/** Tiny line chart for a value over time. The last point is marked. */
export function Sparkline({
  values,
  width = 150,
  height = 36,
  color = 'var(--fg)',
  min,
}: SparklineProps) {
  if (values.length === 0) return <svg width={width} height={height} aria-hidden />
  const lo = min ?? Math.min(...values)
  const hi = Math.max(lo + 1e-9, ...values)
  const pad = 3
  const x = (i: number) => pad + ((width - 2 * pad) * i) / Math.max(1, values.length - 1)
  const y = (v: number) => height - pad - ((height - 2 * pad) * (v - lo)) / (hi - lo)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const last = values.length - 1
  return (
    <svg width={width} height={height} aria-hidden style={{ overflow: 'visible' }}>
      <line
        x1={pad}
        x2={width - pad}
        y1={height - pad}
        y2={height - pad}
        style={{ stroke: 'var(--border-strong)' }}
      />
      <path d={d} fill="none" style={{ stroke: color }} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(values[last]!)} r={2.5} style={{ fill: color }} />
    </svg>
  )
}
