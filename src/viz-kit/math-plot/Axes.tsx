import { clamp, fmt, stepDigits, ticks, zoomedStep } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface AxesProps {
  step?: number
  labels?: boolean
  color?: string
  /** Hide tick labels whose absolute value exceeds this. */
  labelLimit?: number
}

/** x and y axes through the origin with small ticks and mono labels. */
export function Axes({
  step: base = 1,
  labels = true,
  color = vc.axis,
  labelLimit = Infinity,
}: AxesProps) {
  const c = useCoords()
  const step = zoomedStep(base, c.zoom)
  const ox = c.x(0)
  const oy = c.y(0)
  const digits = stepDigits(step)
  // When the origin is panned out of view, tick labels stay along the nearest edge.
  const lx = clamp(ox, 36, c.width - 4)
  const ly = clamp(oy, 0, c.height - 24)
  const xs = ticks(c.view.x[0], c.view.x[1], step).filter(
    (v) => v !== 0 && Math.abs(v) <= labelLimit,
  )
  const ys = ticks(c.view.y[0], c.view.y[1], step).filter(
    (v) => v !== 0 && Math.abs(v) <= labelLimit,
  )
  return (
    <g pointerEvents="none" style={{ stroke: color }}>
      <line x1={0} x2={c.width} y1={oy} y2={oy} strokeWidth={1.25} />
      <line y1={0} y2={c.height} x1={ox} x2={ox} strokeWidth={1.25} />
      {xs.map((v) => (
        <line key={`tx${v}`} x1={c.x(v)} x2={c.x(v)} y1={oy - 4} y2={oy + 4} strokeWidth={1} />
      ))}
      {ys.map((v) => (
        <line key={`ty${v}`} y1={c.y(v)} y2={c.y(v)} x1={ox - 4} x2={ox + 4} strokeWidth={1} />
      ))}
      {labels && (
        <g style={{ fill: color, stroke: 'none', fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
          {xs.map((v) => (
            <text key={`lx${v}`} x={c.x(v)} y={ly + 18} textAnchor="middle">
              {fmt(v, digits)}
            </text>
          ))}
          {ys.map((v) => (
            <text key={`ly${v}`} x={lx - 9} y={c.y(v) + 3.5} textAnchor="end">
              {fmt(v, digits)}
            </text>
          ))}
        </g>
      )}
    </g>
  )
}
