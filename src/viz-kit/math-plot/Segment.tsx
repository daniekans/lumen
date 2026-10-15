import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import type { StrokeStyle } from './Path'

interface SegmentProps extends StrokeStyle {
  from: Vec2
  to: Vec2
  /** Extend into a full line across the visible stage. */
  extend?: boolean
}

export function Segment({
  from,
  to,
  extend = false,
  color = vc.fg,
  width = 2,
  opacity = 1,
  dash,
}: SegmentProps) {
  const c = useCoords()
  let a = from
  let b = to
  if (extend) {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const len = Math.hypot(dx, dy) || 1
    const far = Math.hypot(c.view.x[1] - c.view.x[0], c.view.y[1] - c.view.y[0])
    a = [from[0] - (dx / len) * far, from[1] - (dy / len) * far]
    b = [from[0] + (dx / len) * far, from[1] + (dy / len) * far]
  }
  return (
    <line
      x1={c.x(a[0])}
      y1={c.y(a[1])}
      x2={c.x(b[0])}
      y2={c.y(b[1])}
      style={{ stroke: color, opacity }}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      pointerEvents="none"
    />
  )
}
