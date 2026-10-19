import { fmtShort } from './scalar'

/** A point or vector in space, for drawing. `vector.ts` has helpers for any number of components. */
export type Vec3 = readonly [number, number, number]

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
export const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const length3 = (a: Vec3) => Math.hypot(a[0], a[1], a[2])
export const normalize3 = (a: Vec3): Vec3 => {
  const l = length3(a)
  return l === 0 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l]
}
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]
/** The combination a u + b v, the point of a plane spanned by u and v. */
export const combo3 = (a: number, u: Vec3, b: number, v: Vec3): Vec3 =>
  add3(scale3(u, a), scale3(v, b))

/** A point as "(x, y, z)" in the short form of `fmtShort`. */
export const fmtPoint3 = (p: Vec3, digits = 2) =>
  `(${fmtShort(p[0], digits)}, ${fmtShort(p[1], digits)}, ${fmtShort(p[2], digits)})`

/**
 * The dimension of the span of vectors in space: 0 (only the origin), 1 (a line),
 * 2 (a plane) or 3 (all of space). `tol` absorbs rounding in dragged values.
 */
export const spanDimension3 = (vs: readonly Vec3[], tol = 1e-9): 0 | 1 | 2 | 3 => {
  const nonzero = vs.filter((v) => length3(v) > tol)
  if (nonzero.length === 0) return 0
  const normals = nonzero.flatMap((a, i) => nonzero.slice(i + 1).map((b) => cross3(a, b)))
  const n = normals.find((c) => length3(c) > tol)
  if (!n) return 1
  return nonzero.some((v) => Math.abs(dot3(n, v)) > tol * length3(n)) ? 3 : 2
}

/** The determinant of the matrix with columns a, b, c: the signed volume a · (b × c). */
export const det3 = (a: Vec3, b: Vec3, c: Vec3) => dot3(a, cross3(b, c))

/**
 * The coordinates of x in the basis b1, b2, b3: the weights with c1 b1 + c2 b2 + c3 b3 = x
 * (Cramer's rule). Null when the three vectors are not a basis (|det| at most `tol`).
 */
export const basisCoords3 = (
  [b1, b2, b3]: readonly [Vec3, Vec3, Vec3],
  x: Vec3,
  tol = 1e-9,
): Vec3 | null => {
  const d = det3(b1, b2, b3)
  if (Math.abs(d) <= tol) return null
  return [det3(x, b2, b3) / d, det3(b1, x, b3) / d, det3(b1, b2, x) / d]
}
