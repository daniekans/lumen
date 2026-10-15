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
  fill?: string
  fillOpacity?: number
} & Omit<SVGProps<SVGPathElement>, 'points' | 'fill' | 'opacity' | 'width'>

/** Polyline or polygon through points given in stage units. */
export function Path({
  points,
  closed = false,
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
  const d =
    points
      .map((p, i) => `${i ? 'L' : 'M'}${c.x(p[0]).toFixed(2)},${c.y(p[1]).toFixed(2)}`)
      .join('') + (closed ? 'Z' : '')
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
