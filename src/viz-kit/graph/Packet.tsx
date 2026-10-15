import { alpha, vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { curveAt, type Curve } from './geometry'

interface PacketProps {
  curve: Curve
  /** Position along the curve, 0 to 1. */
  t: number
  color?: string
  r?: number
}

/** A small glowing dot travelling along a connector, representing data in motion. */
export function Packet({ curve, t, color = vc.yellow, r = 5 }: PacketProps) {
  const c = useCoords()
  const [x, y] = c.toPx(curveAt(curve, Math.min(1, Math.max(0, t))))
  const fade = Math.min(1, t * 8, (1 - t) * 8)
  return (
    <g pointerEvents="none" style={{ opacity: fade }}>
      <circle cx={x} cy={y} r={r * 2.4} style={{ fill: alpha(color, 0.18) }} />
      <circle cx={x} cy={y} r={r} style={{ fill: color }} />
    </g>
  )
}
