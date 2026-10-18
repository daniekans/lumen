import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface BandProps {
  /** `y` for a horizontal strip between two heights, `x` for a vertical strip between two x values. */
  axis: 'x' | 'y'
  from: number
  to: number
  color?: string
  /** Fill opacity; the edges are drawn dashed at full strength. */
  opacity?: number
  /** Draw the dashed edges. */
  edges?: boolean
}

/**
 * A strip across the whole visible view, such as the band L ± ε or the window a ± δ of the
 * epsilon-delta definition. It follows pan and zoom.
 */
export function Band({ axis, from, to, color = vc.teal, opacity = 0.14, edges = true }: BandProps) {
  const c = useCoords()
  const [lo, hi] = [Math.min(from, to), Math.max(from, to)]
  const [x0, x1] = axis === 'x' ? [c.x(lo), c.x(hi)] : [c.x(c.view.x[0]), c.x(c.view.x[1])]
  const [y0, y1] = axis === 'y' ? [c.y(hi), c.y(lo)] : [c.y(c.view.y[1]), c.y(c.view.y[0])]
  const edge = (k: string, a: [number, number], b: [number, number]) => (
    <line
      key={k}
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      style={{ stroke: color }}
      strokeWidth={1.25}
      strokeDasharray="4 5"
    />
  )
  return (
    <g pointerEvents="none">
      <rect
        x={Math.min(x0, x1)}
        y={Math.min(y0, y1)}
        width={Math.abs(x1 - x0)}
        height={Math.abs(y1 - y0)}
        style={{ fill: color }}
        opacity={opacity}
      />
      {edges &&
        (axis === 'x'
          ? [edge('a', [x0, y0], [x0, y1]), edge('b', [x1, y0], [x1, y1])]
          : [edge('a', [x0, y0], [x1, y0]), edge('b', [x0, y1], [x1, y1])])}
    </g>
  )
}
