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
  /** Sample points per grid line; by default it grows with `reach`. The lines are drawn as smooth curves through them. */
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
  samples,
}: WarpedGridProps) {
  const c = useCoords()
  const step = zoomedStep(base, c.zoom)
  const [x0, x1] = c.view.x
  const [y0, y1] = c.view.y
  const r = reach * Math.max(...[x0, x1].flatMap((x) => [y0, y1].map((y) => Math.hypot(x, y))))
  const count = Math.ceil(r / step)
  const n = samples ?? Math.round(32 * reach)

  const line = (at: (s: number) => Vec2) =>
    Array.from({ length: n + 1 }, (_, i) => f(at(-r + (2 * r * i) / n)))

  // Only the pieces of each line that cross the view are drawn: a map that shrinks the plane needs
  // a large reach, and drawing every off-screen sample made morphs stutter.
  const pad = 0.1 * Math.max(x1 - x0, y1 - y0)
  const visible = (a: Vec2, b: Vec2) =>
    Math.max(a[0], b[0]) >= x0 - pad &&
    Math.min(a[0], b[0]) <= x1 + pad &&
    Math.max(a[1], b[1]) >= y0 - pad &&
    Math.min(a[1], b[1]) <= y1 + pad
  const pieces = (pts: Vec2[]) => {
    const out: Vec2[][] = []
    let run: Vec2[] = []
    for (let i = 1; i < pts.length; i++) {
      if (visible(pts[i - 1]!, pts[i]!)) {
        if (!run.length) run.push(pts[i - 1]!)
        run.push(pts[i]!)
      } else if (run.length) {
        out.push(run)
        run = []
      }
    }
    if (run.length) out.push(run)
    return out
  }

  const lines: Vec2[][] = []
  for (let k = -count; k <= count; k++) {
    if (k === 0) continue
    lines.push(...pieces(line((s) => [k * step, s])))
    lines.push(...pieces(line((s) => [s, k * step])))
  }
  const axes = [...pieces(line((s) => [s, 0])), ...pieces(line((s) => [0, s]))]

  return (
    <g pointerEvents="none">
      {lines.map((pts, k) => (
        <Path key={k} points={pts} smooth color={color} width={1} opacity={opacity} />
      ))}
      {axes.map((pts, k) => (
        <Path key={k} points={pts} smooth color={color} width={1.5} opacity={axisOpacity} />
      ))}
    </g>
  )
}
