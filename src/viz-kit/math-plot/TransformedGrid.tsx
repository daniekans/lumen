import { apply, det, length, zoomedStep, type Mat2, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { Path } from './Path'

interface TransformedGridProps {
  /** The matrix applied to the grid of the plane. */
  m: Mat2
  step?: number
  color?: string
  opacity?: number
  /** Opacity of the images of the two axes. */
  axisOpacity?: number
}

/** Lines drawn on each side of the origin at most, for a matrix that squeezes the plane flat. */
const MAX_LINES = 60
/** Longest half length of a line in stage units, for a basis vector close to zero. */
const MAX_REACH = 1e4
const EPS = 1e-9

/**
 * The grid of the plane after a linear map: the images of the lines x = k and y = k. Only the
 * lines that reach the visible view are drawn, and each one spans the whole view, so the grid
 * fills the stage at any zoom and pan.
 */
export function TransformedGrid({
  m,
  step: base = 1,
  color = vc.fg,
  opacity = 0.22,
  axisOpacity = 0.7,
}: TransformedGridProps) {
  const c = useCoords()
  const step = zoomedStep(base, c.zoom)
  const [x0, x1] = c.view.x
  const [y0, y1] = c.view.y
  // Radius of a disc around the origin that covers the view.
  const r = Math.max(...[x0, x1].flatMap((x) => [y0, y1].map((y) => Math.hypot(x, y))))
  const d = Math.abs(det(m))
  const li = length(m.i)
  const lj = length(m.j)

  // The image of x = k is the line k i + t j, at distance |k| |det| / |j| from the origin; it is
  // visible when that is at most r, and it crosses the view for |t| up to (r + |k| |i|) / |j|.
  // The lines y = k are the same with i and j swapped.
  const family = (offset: number, along: number) => {
    const count = Math.min(MAX_LINES, d > EPS ? Math.ceil((r * along) / (d * step)) : MAX_LINES)
    const reach = along > EPS ? Math.min(MAX_REACH, (r + count * step * offset) / along) : MAX_REACH
    return { count, reach }
  }
  const xs = family(li, lj)
  const ys = family(lj, li)

  const image = (p: Vec2) => apply(m, p)

  const lines: Vec2[][] = []
  for (let k = -xs.count; k <= xs.count; k++) {
    if (k === 0) continue
    lines.push([image([k * step, -xs.reach]), image([k * step, xs.reach])])
  }
  for (let k = -ys.count; k <= ys.count; k++) {
    if (k === 0) continue
    lines.push([image([-ys.reach, k * step]), image([ys.reach, k * step])])
  }

  return (
    <g pointerEvents="none">
      {lines.map((pts, k) => (
        <Path key={k} points={pts} color={color} width={1} opacity={opacity} />
      ))}
      <Path
        points={[image([-ys.reach, 0]), image([ys.reach, 0])]}
        color={color}
        width={1.5}
        opacity={axisOpacity}
      />
      <Path
        points={[image([0, -xs.reach]), image([0, xs.reach])]}
        color={color}
        width={1.5}
        opacity={axisOpacity}
      />
    </g>
  )
}
