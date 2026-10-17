import { ticks, zoomedStep } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface GridProps {
  step?: number
  /** Subdivisions between major lines. 0 disables minor lines. */
  minor?: number
  color?: string
  opacity?: number
}

/** Background coordinate grid covering the whole visible stage. */
export function Grid({ step: base = 1, minor = 0, color = vc.grid, opacity = 1 }: GridProps) {
  const c = useCoords()
  const step = zoomedStep(base, c.zoom)
  const { x: vx, y: vy } = c.view
  const lines = (s: number, width: number, key: string, op: number) => (
    <g key={key} style={{ stroke: color, opacity: op }} strokeWidth={width}>
      {ticks(vx[0], vx[1], s).map((v) => (
        <line key={`x${v}`} x1={c.x(v)} x2={c.x(v)} y1={0} y2={c.height} />
      ))}
      {ticks(vy[0], vy[1], s).map((v) => (
        <line key={`y${v}`} y1={c.y(v)} y2={c.y(v)} x1={0} x2={c.width} />
      ))}
    </g>
  )
  return (
    <g opacity={opacity} pointerEvents="none">
      {minor > 0 && lines(step / minor, 1, 'minor', 0.45)}
      {lines(step, 1, 'major', 1)}
    </g>
  )
}
