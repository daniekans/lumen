export type Easing = (t: number) => number

export const linear: Easing = (t) => t

/**
 * CSS-style cubic-bezier easing: control points (x1, y1) and (x2, y2), endpoints fixed at (0, 0)
 * and (1, 1). Solves x(s) = t for the curve parameter s with Newton's method, falling back to
 * bisection where the slope is too flat.
 */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number): Easing => {
  const bez = (s: number, a: number, b: number) =>
    3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s
  const dBez = (s: number, a: number, b: number) =>
    3 * (1 - s) * (1 - s) * a + 6 * (1 - s) * s * (b - a) + 3 * s * s * (1 - b)
  return (t) => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    let s = t
    for (let k = 0; k < 8; k++) {
      const err = bez(s, x1, x2) - t
      if (Math.abs(err) < 1e-6) return bez(s, y1, y2)
      const d = dBez(s, x1, x2)
      if (Math.abs(d) < 1e-6) break
      s -= err / d
    }
    let lo = 0
    let hi = 1
    s = t
    for (let k = 0; k < 30; k++) {
      const x = bez(s, x1, x2)
      if (Math.abs(x - t) < 1e-6) break
      if (x < t) lo = s
      else hi = s
      s = (lo + hi) / 2
    }
    return bez(s, y1, y2)
  }
}
