import type { Vec2 } from '@/lib/math'

/** Axis-aligned box described by its center, in stage units. */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export type Side = 'left' | 'right' | 'top' | 'bottom'

export const anchorOf = (b: Box, side: Side): Vec2 => {
  switch (side) {
    case 'left':
      return [b.x - b.w / 2, b.y]
    case 'right':
      return [b.x + b.w / 2, b.y]
    case 'top':
      return [b.x, b.y - b.h / 2]
    case 'bottom':
      return [b.x, b.y + b.h / 2]
  }
}

const sideDir: Record<Side, Vec2> = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] }

/** Cubic Bezier curve with point and tangent evaluation. */
export interface Curve {
  p0: Vec2
  p1: Vec2
  p2: Vec2
  p3: Vec2
}

export const curveAt = ({ p0, p1, p2, p3 }: Curve, t: number): Vec2 => {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ]
}

export const curveTangent = ({ p0, p1, p2, p3 }: Curve, t: number): Vec2 => {
  const u = 1 - t
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ]
}

interface ConnectOptions {
  from?: Side
  to?: Side
  /** How far the control points reach, as a fraction of the distance between anchors. */
  bend?: number
  /** Gap left between the curve end and the target box, for the arrowhead. */
  gap?: number
}

/** Smooth connector leaving `a` from one side and entering `b` from another. */
export const connect = (
  a: Box,
  b: Box,
  { from = 'right', to = 'left', bend = 0.5, gap = 4 }: ConnectOptions = {},
): Curve => {
  const s = anchorOf(a, from)
  const eRaw = anchorOf(b, to)
  const dIn = sideDir[to]
  const e: Vec2 = [eRaw[0] + dIn[0] * gap, eRaw[1] + dIn[1] * gap]
  const dist = Math.hypot(e[0] - s[0], e[1] - s[1])
  const k = dist * bend
  const dOut = sideDir[from]
  return {
    p0: s,
    p1: [s[0] + dOut[0] * k, s[1] + dOut[1] * k],
    p2: [e[0] + dIn[0] * k, e[1] + dIn[1] * k],
    p3: e,
  }
}
