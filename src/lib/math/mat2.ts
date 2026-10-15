import type { Vec2 } from './vec2'

/** A 2x2 matrix described by its two columns. */
export interface Mat2 {
  /** First column: where the basis vector i-hat lands. */
  readonly i: Vec2
  /** Second column: where the basis vector j-hat lands. */
  readonly j: Vec2
}

export const mat2 = (a: number, b: number, c: number, d: number): Mat2 => ({ i: [a, c], j: [b, d] })

export const identity: Mat2 = { i: [1, 0], j: [0, 1] }

export const apply = (m: Mat2, v: Vec2): Vec2 => [
  m.i[0] * v[0] + m.j[0] * v[1],
  m.i[1] * v[0] + m.j[1] * v[1],
]

export const det = (m: Mat2) => m.i[0] * m.j[1] - m.j[0] * m.i[1]

export const multiply = (a: Mat2, b: Mat2): Mat2 => ({ i: apply(a, b.i), j: apply(a, b.j) })

export const lerpMat = (a: Mat2, b: Mat2, t: number): Mat2 => ({
  i: [a.i[0] + (b.i[0] - a.i[0]) * t, a.i[1] + (b.i[1] - a.i[1]) * t],
  j: [a.j[0] + (b.j[0] - a.j[0]) * t, a.j[1] + (b.j[1] - a.j[1]) * t],
})

export const rotation = (theta: number): Mat2 =>
  mat2(Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta))

export const toRows = (m: Mat2): [[number, number], [number, number]] => [
  [m.i[0], m.j[0]],
  [m.i[1], m.j[1]],
]
