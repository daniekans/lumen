import { clamp, type Interval, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { Point } from './Point'

interface AxisIntervalProps {
  /** The set to draw. Infinite ends run to the edge of the visible stage. */
  set: readonly Interval[]
  axis: 'x' | 'y'
  color?: string
  width?: number
  opacity?: number
}

/**
 * A set of intervals drawn as thick bars along an axis, with filled dots at closed ends and hollow
 * dots at open ends. Used for domains, ranges and solution sets.
 */
export function AxisInterval({
  set,
  axis,
  color = vc.yellow,
  width = 5,
  opacity = 1,
}: AxisIntervalProps) {
  const c = useCoords()
  const [lo, hi] = axis === 'x' ? c.view.x : c.view.y
  const at = (v: number): Vec2 => (axis === 'x' ? [v, 0] : [0, v])
  return (
    <g style={{ opacity }} pointerEvents="none">
      {set.map((i, k) => {
        const a = clamp(i.from, lo, hi)
        const b = clamp(i.to, lo, hi)
        if (b < a) return null
        const [x1, y1] = c.toPx(at(a))
        const [x2, y2] = c.toPx(at(b))
        return (
          <g key={k}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              style={{ stroke: color }}
              strokeWidth={width}
              strokeLinecap="round"
              opacity={0.85}
            />
            {Number.isFinite(i.from) && i.from >= lo && (
              <Point at={at(i.from)} color={color} r={5} hollow={!i.closedFrom} />
            )}
            {Number.isFinite(i.to) && i.to <= hi && i.to !== i.from && (
              <Point at={at(i.to)} color={color} r={5} hollow={!i.closedTo} />
            )}
          </g>
        )
      })}
    </g>
  )
}
