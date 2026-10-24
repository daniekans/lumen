import type { Vec2 } from './vec2'

export type Fn = (x: number) => number

/** Slope of the secant line through (x, f(x)) and (x + h, f(x + h)). */
export const secantSlope = (f: Fn, x: number, h: number) => (f(x + h) - f(x)) / h

/** Central-difference derivative estimate. */
export const derivative = (f: Fn, x: number, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h)

export type RiemannRule = 'left' | 'right' | 'midpoint' | 'trapezoid'

export interface RiemannPiece {
  x0: number
  x1: number
  /** Height at the left edge and right edge. Equal for rectangle rules. */
  y0: number
  y1: number
}

export const riemannPieces = (f: Fn, a: number, b: number, n: number, rule: RiemannRule) => {
  const dx = (b - a) / n
  return Array.from({ length: n }, (_, k): RiemannPiece => {
    const x0 = a + k * dx
    const x1 = x0 + dx
    switch (rule) {
      case 'left':
        return { x0, x1, y0: f(x0), y1: f(x0) }
      case 'right':
        return { x0, x1, y0: f(x1), y1: f(x1) }
      case 'midpoint': {
        const y = f((x0 + x1) / 2)
        return { x0, x1, y0: y, y1: y }
      }
      case 'trapezoid':
        return { x0, x1, y0: f(x0), y1: f(x1) }
    }
  })
}

export const riemannSum = (pieces: readonly RiemannPiece[]) =>
  pieces.reduce((s, p) => s + ((p.y0 + p.y1) / 2) * (p.x1 - p.x0), 0)

/** Composite Simpson integration, accurate enough to serve as the "exact" reference. */
export const integrate = (f: Fn, a: number, b: number, n = 2000) => {
  const m = n % 2 === 0 ? n : n + 1
  const h = (b - a) / m
  let s = f(a) + f(b)
  for (let k = 1; k < m; k++) s += f(a + k * h) * (k % 2 === 0 ? 2 : 4)
  return (s * h) / 3
}

/** A piece of the line through `p` in direction `d`, reaching `half` units to each side of `p`. */
export const linePiece = (p: Vec2, d: Vec2, half = 0.8) => {
  const s = half / Math.hypot(d[0], d[1])
  return {
    from: [p[0] - d[0] * s, p[1] - d[1] * s] as Vec2,
    to: [p[0] + d[0] * s, p[1] + d[1] * s] as Vec2,
  }
}

/** A piece of the line through `p` with slope `m`, `half` units long on each side. */
export const tangentPiece = (p: Vec2, m: number, half = 0.8) => linePiece(p, [1, m], half)
