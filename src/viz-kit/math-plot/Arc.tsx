import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import type { StrokeStyle } from './Path'

interface ArcProps extends StrokeStyle {
  center?: Vec2
  /** Radius in stage units. */
  r: number
  /** Angles in radians, counter-clockwise in math convention. */
  from: number
  to: number
  fill?: string
  fillOpacity?: number
}

/** Circular arc, optionally filled as a sector (useful for marking angles). */
export function Arc({
  center = [0, 0],
  r,
  from,
  to,
  color = vc.fg,
  width = 2,
  opacity = 1,
  dash,
  fill,
  fillOpacity = 0.15,
}: ArcProps) {
  const c = useCoords()
  const steps = Math.max(2, Math.ceil((Math.abs(to - from) / Math.PI) * 48))
  const pts = Array.from({ length: steps + 1 }, (_, k) => {
    const t = from + ((to - from) * k) / steps
    return c.toPx([center[0] + r * Math.cos(t), center[1] + r * Math.sin(t)])
  })
  const [cx, cy] = c.toPx(center)
  const arc = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('')
  return (
    <g pointerEvents="none" style={{ opacity }}>
      {fill && (
        <path d={`M${cx},${cy}L${arc.slice(1)}Z`} style={{ fill, fillOpacity, stroke: 'none' }} />
      )}
      <path
        d={arc}
        style={{ stroke: color, fill: 'none' }}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </g>
  )
}
