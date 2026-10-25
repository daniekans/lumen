import { zoomedStep, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { Path } from './Path'

interface WarpedGridProps {
  /** Any map of the plane, linear or not. Grid lines are sampled, so curves stay smooth. */
  f: (p: Vec2) => Vec2
  step?: number
  color?: string
  opacity?: number
  /** Opacity of the images of the two axes. */
  axisOpacity?: number
  /**
   * How far the input grid reaches, as a multiple of the farthest visible point from the origin.
   * Raise it for maps that shrink the plane, so the image still covers the view.
   */
  reach?: number
  /** Sample points per grid line. */
  samples?: number
}

/**
 * The grid of the plane after a map that need not be linear: the images of the lines x = k and
 * y = k, each sampled as a polyline. Bent lines show a map that is not linear; for a linear map,
 * `TransformedGrid` draws straight lines exactly and covers the view at any zoom.
 */
export function WarpedGrid({
  f,
  step: base = 1,
  color = vc.fg,
  opacity = 0.22,
  axisOpacity = 0.7,
  reach = 2.5,
  samples = 80,
}: WarpedGridProps) {
  const c = useCoords()
  const step = zoomedStep(base, c.zoom)
  const [x0, x1] = c.view.x
  const [y0, y1] = c.view.y
  const r = reach * Math.max(...[x0, x1].flatMap((x) => [y0, y1].map((y) => Math.hypot(x, y))))
  const count = Math.ceil(r / step)

  const line = (at: (s: number) => Vec2) =>
    Array.from({ length: samples + 1 }, (_, i) => f(at(-r + (2 * r * i) / samples)))

  const lines: Vec2[][] = []
  for (let k = -count; k <= count; k++) {
    if (k === 0) continue
    lines.push(line((s) => [k * step, s]))
    lines.push(line((s) => [s, k * step]))
  }

  return (
    <g pointerEvents="none">
      {lines.map((pts, k) => (
        <Path key={k} points={pts} color={color} width={1} opacity={opacity} />
      ))}
      <Path points={line((s) => [s, 0])} color={color} width={1.5} opacity={axisOpacity} />
      <Path points={line((s) => [0, s])} color={color} width={1.5} opacity={axisOpacity} />
    </g>
  )
}
