/*
 * Trigonometry helpers: conversions, exact values at multiples of π/6 and π/4 as TeX, sinusoid
 * features, and the solutions of sin θ = c or cos θ = c in one turn.
 */

export const TAU = 2 * Math.PI

export const degToRad = (deg: number) => (deg * Math.PI) / 180
export const radToDeg = (rad: number) => (rad * 180) / Math.PI

/** The same angle in [0, 2π). */
export const reduceAngle = (theta: number) => ((theta % TAU) + TAU) % TAU

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** nπ/d as reduced TeX: 0, \pi, -\frac{\pi}{6}, \frac{5\pi}{4}, 2\pi. */
export const piTex = (n: number, d: number) => {
  if (n === 0) return '0'
  const g = gcd(n, d)
  const [p, q] = [n / g, d / g]
  const sign = p < 0 ? '-' : ''
  const top = Math.abs(p) === 1 ? '\\pi' : `${Math.abs(p)}\\pi`
  return q === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${q}}`
}

/** Magnitudes that sine, cosine and tangent take at multiples of π/6 and π/4, with their TeX. */
const EXACT: readonly [number, string][] = [
  [0, '0'],
  [1 / 2, '\\frac{1}{2}'],
  [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'],
  [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'],
  [1, '1'],
  [Math.sqrt(3) / 3, '\\frac{\\sqrt{3}}{3}'],
  [Math.sqrt(3), '\\sqrt{3}'],
]

/** Exact TeX for a value such as sin(π/3), or null when it is not one of the special values. */
export const exactTex = (v: number) => {
  const hit = EXACT.find(([m]) => Math.abs(Math.abs(v) - m) < 1e-9)
  if (!hit) return null
  return v < -1e-9 ? `-${hit[1]}` : hit[1]
}

export type TrigFn = 'sin' | 'cos' | 'tan'

export const trig: Record<TrigFn, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
}

/** Whether tan is undefined at the angle (cos θ = 0). */
export const tanUndefined = (theta: number) => Math.abs(Math.cos(theta)) < 1e-12

/** y = A sin(B(x - C)) + D. */
export interface Sinusoid {
  A: number
  B: number
  C: number
  D: number
}

export const sinusoid =
  ({ A, B, C, D }: Sinusoid) =>
  (x: number) =>
    A * Math.sin(B * (x - C)) + D

/** Amplitude, period, midline and extremes of A sin(B(x - C)) + D. */
export const sinusoidFeatures = ({ A, B, D }: Sinusoid) => ({
  amplitude: Math.abs(A),
  period: TAU / Math.abs(B),
  midline: D,
  max: D + Math.abs(A),
  min: D - Math.abs(A),
})

/** Solutions of sin θ = c (or cos θ = c) with θ in [0, 2π), sorted. Empty when |c| > 1. */
export const solveInTurn = (fn: 'sin' | 'cos', c: number) => {
  if (Math.abs(c) > 1) return []
  const raw = fn === 'sin' ? [Math.asin(c), Math.PI - Math.asin(c)] : [Math.acos(c), -Math.acos(c)]
  const out: number[] = []
  for (const t of raw.map(reduceAngle))
    if (!out.some((u) => Math.abs(u - t) < 1e-9 || Math.abs(Math.abs(u - t) - TAU) < 1e-9))
      out.push(t)
  return out.map((t) => (Math.abs(t - TAU) < 1e-9 ? 0 : t)).sort((a, b) => a - b)
}
