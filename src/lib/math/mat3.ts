import { matVec, type MatN } from './matN'
import type { Vec3 } from './vec3'

/** A coordinate axis of space. */
export type Axis3 = 'x' | 'y' | 'z'

/**
 * The rotation of space by `theta` about a coordinate axis, counterclockwise when seen from the
 * positive end of the axis looking toward the origin (the right-hand rule). Rows of a 3 x 3 matrix.
 */
export const rotationAbout = (axis: Axis3, theta: number): number[][] => {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  if (axis === 'x')
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ]
  if (axis === 'y')
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c],
    ]
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ]
}

/** A 3 x n matrix applied to a vector of R^n, as a point of space. */
export const apply3 = (a: MatN, x: readonly number[]): Vec3 => {
  const [p, q, r] = matVec(a, x)
  return [p ?? 0, q ?? 0, r ?? 0]
}

/** Entry by entry from a to b (same shape), for a map that moves smoothly from one to the other. */
export const lerpMatN = (a: MatN, b: MatN, t: number): number[][] =>
  a.map((row, i) => row.map((v, j) => v + (b[i]![j]! - v) * t))
