import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface VectorProps {
  to: Vec2
  from?: Vec2
  color?: string
  width?: number
  opacity?: number
  /** Arrowhead length in pixels. */
  head?: number
}

/** Arrow from `from` to `to`, with a filled head that shrinks for very short vectors. */
export function Vector({
  to,
  from = [0, 0],
  color = vc.fg,
  width = 3,
  opacity = 1,
  head = 13,
}: VectorProps) {
  const c = useCoords()
  const [x1, y1] = c.toPx(from)
  const [x2, y2] = c.toPx(to)
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 0.5) return null
  const h = Math.min(head, len * 0.5)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const hw = h * 0.42
  return (
    <g style={{ opacity }} pointerEvents="none">
      <line
        x1={x1}
        y1={y1}
        x2={bx + ux}
        y2={by + uy}
        style={{ stroke: color }}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path
        d={`M${x2},${y2}L${bx - uy * hw},${by + ux * hw}L${bx + uy * hw},${by - ux * hw}Z`}
        style={{ fill: color, stroke: color }}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  )
}
