import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface ChipProps {
  /** Top-left corner in stage units. */
  x: number
  y: number
  width: number
  height: number
  /** Monospace text centered in the chip. */
  text: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  textColor?: string
  opacity?: number
}

/**
 * A rounded box with a short monospace text: a key, a value, a cell of a table. Position and size
 * are in stage units, so chips can be moved by animating their coordinates; colors and opacity
 * cross-fade through CSS transitions.
 */
export function Chip({
  x,
  y,
  width,
  height,
  text,
  fill = 'var(--bg-elevated)',
  stroke = vc.gridStrong,
  strokeWidth = 1,
  textColor = vc.fg,
  opacity = 1,
}: ChipProps) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([x, y])
  if (opacity < 0.01) return null
  return (
    <g style={{ opacity, transition: 'opacity var(--dur-slow) var(--ease-out)' }}>
      <rect
        x={px}
        y={py}
        width={width * u}
        height={height * u}
        rx={3 * u}
        style={{ fill, stroke, transition: 'fill var(--dur-slow), stroke var(--dur-slow)' }}
        strokeWidth={strokeWidth}
      />
      <text
        x={px + (width / 2) * u}
        y={py + (height / 2) * u}
        textAnchor="middle"
        dominantBaseline="central"
        pointerEvents="none"
        style={{ fill: textColor, fontSize: 11 * u, fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}
