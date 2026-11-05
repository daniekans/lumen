import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useGrowIn } from '../anim/useGrowIn'
import { useCoords, useEmphasis } from '../stage'

/** Extra stroke width while the arrow is highlighted, and the width of its hover target. */
const EMPHASIS_WIDTH = 1.5
const HIT_WIDTH = 14

interface VectorProps {
  to: Vec2
  from?: Vec2
  color?: string
  width?: number
  opacity?: number
  /** Arrowhead length in pixels. */
  head?: number
  /** Grow from the tail when the arrow first appears. On by default. */
  grow?: boolean
  /** Highlight key: hovering the arrow lights it, its readouts and its names in code. */
  hoverKey?: string
}

/** Arrow from `from` to `to`, with a filled head that shrinks for very short vectors. */
export function Vector({
  to,
  from = [0, 0],
  color = vc.fg,
  width = 3,
  opacity = 1,
  head = 13,
  grow = true,
  hoverKey,
}: VectorProps) {
  const c = useCoords()
  const { emphasis, hover, opacity: dim } = useEmphasis(hoverKey)
  const g = useGrowIn(grow)
  const [x1, y1] = c.toPx(from)
  const [tx, ty] = c.toPx(to)
  const x2 = x1 + (tx - x1) * g
  const y2 = y1 + (ty - y1) * g
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 0.5) return null
  const h = Math.min(head, len * 0.5)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const hw = h * 0.42
  const on = emphasis === 'on'
  const w = on ? width + EMPHASIS_WIDTH : width
  return (
    <g style={{ opacity: opacity * dim, transition: 'opacity var(--dur-base) var(--ease-out)' }}>
      {on && (
        <line
          x1={x1}
          y1={y1}
          x2={bx}
          y2={by}
          style={{ stroke: color }}
          strokeWidth={w + 6}
          strokeOpacity={0.2}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      <line
        x1={x1}
        y1={y1}
        x2={bx + ux}
        y2={by + uy}
        style={{ stroke: color }}
        strokeWidth={w}
        strokeLinecap="round"
        pointerEvents="none"
      />
      <path
        d={`M${x2},${y2}L${bx - uy * hw},${by + ux * hw}L${bx + uy * hw},${by - ux * hw}Z`}
        style={{ fill: color, stroke: color }}
        strokeWidth={on ? 2 : 1}
        strokeLinejoin="round"
        pointerEvents="none"
      />
      {hover && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth={HIT_WIDTH}
          pointerEvents="stroke"
          {...hover}
        />
      )}
    </g>
  )
}
