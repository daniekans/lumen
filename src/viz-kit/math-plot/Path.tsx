import type { SVGProps } from 'react'
import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

export interface StrokeStyle {
  color?: string
  width?: number
  opacity?: number
  dash?: string
}

type PathProps = StrokeStyle & {
  points: readonly Vec2[]
  closed?: boolean
  /** Draws a smooth curve through the points (Catmull-Rom) instead of straight segments. */
  smooth?: boolean
  fill?: string
  fillOpacity?: number
} & Omit<SVGProps<SVGPathElement>, 'points' | 'fill' | 'opacity' | 'width'>

/** Polyline or polygon through points given in stage units. */
export function Path({
  points,
  closed = false,
  smooth = false,
  color = vc.fg,
  width = 2,
  opacity = 1,
  dash,
  fill,
  fillOpacity = 1,
  ...rest
}: PathProps) {
  const c = useCoords()
  if (points.length === 0) return null
  const px = points.map((p): Vec2 => [c.x(p[0]), c.y(p[1])])
  const at = ([x, y]: Vec2) => `${x.toFixed(2)},${y.toFixed(2)}`
  const d =
    (smooth && px.length > 2
      ? `M${at(px[0]!)}` +
        px
          .slice(1)
          .map((p, k) => `C${curveControls(px, k)}${at(p)}`)
          .join('')
      : px.map((p, i) => `${i ? 'L' : 'M'}${at(p)}`).join('')) + (closed ? 'Z' : '')
  return (
    <path
      d={d}
      style={{ stroke: color, fill: fill ?? 'none', fillOpacity, opacity }}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...rest}
    />
  )
}

/** The two Bezier control points of the Catmull-Rom segment from point k to point k + 1. */
function curveControls(px: Vec2[], k: number) {
  const p0 = px[Math.max(k - 1, 0)]!
  const p1 = px[k]!
  const p2 = px[k + 1]!
  const p3 = px[Math.min(k + 2, px.length - 1)]!
  const c1: Vec2 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
  const c2: Vec2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
  return `${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} `
}
