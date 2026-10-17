import type { Fn } from './calculus'

/** A polynomial as its coefficients, highest degree first: [2, -3, 1] is 2x² - 3x + 1. */
export type Poly = readonly number[]

/** Drops leading zero coefficients; the zero polynomial is [0]. */
export const polyTrim = (p: Poly): number[] => {
  const i = p.findIndex((c) => c !== 0)
  return i < 0 ? [0] : p.slice(i)
}

/** Degree of a polynomial; the zero polynomial has degree -Infinity. */
export const polyDegree = (p: Poly) => {
  const t = polyTrim(p)
  return t.length === 1 && t[0] === 0 ? -Infinity : t.length - 1
}

/** Value at x by Horner's rule. */
export const polyEval = (p: Poly, x: number) => p.reduce((acc, c) => acc * x + c, 0)

export const polyAdd = (p: Poly, q: Poly): number[] => {
  const n = Math.max(p.length, q.length)
  const pad = (r: Poly) => [...Array<number>(n - r.length).fill(0), ...r]
  const [a, b] = [pad(p), pad(q)]
  return polyTrim(a.map((c, i) => c + b[i]!))
}

export const polyScale = (p: Poly, k: number): number[] => polyTrim(p.map((c) => c * k))

export const polyMul = (p: Poly, q: Poly): number[] => {
  const out = Array<number>(p.length + q.length - 1).fill(0)
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j]! += a * b)))
  return polyTrim(out)
}

/** a(x - r₁)(x - r₂)...: repeat a root to give it a higher multiplicity. */
export const polyFromRoots = (roots: readonly number[], a = 1): number[] =>
  roots.reduce<number[]>((p, r) => polyMul(p, [1, -r]), [a])

/** Long division: p = quotient · d + remainder, with deg remainder < deg d. */
export const polyDivide = (p: Poly, d: Poly) => {
  const den = polyTrim(d)
  if (polyDegree(den) === -Infinity) throw new Error('Division by the zero polynomial')
  const rem = polyTrim(p)
  const quotient: number[] = []
  while (rem.length >= den.length && polyDegree(rem) !== -Infinity) {
    const k = rem[0]! / den[0]!
    quotient.push(k)
    for (let i = 0; i < den.length; i++) rem[i]! -= k * den[i]!
    rem.shift()
  }
  return { quotient: polyTrim(quotient.length ? quotient : [0]), remainder: polyTrim(rem) }
}

export const polyDerivative = (p: Poly): number[] => {
  const n = p.length - 1
  return n <= 0 ? [0] : polyTrim(p.slice(0, -1).map((c, i) => c * (n - i)))
}

/**
 * Points in [lo, hi] where f changes sign, found by sampling and bisection. A zero where f only
 * touches 0 (a double root) is not a sign change and is skipped, which is what turning points of
 * a polynomial need: they are the sign changes of its derivative.
 */
export const signChanges = (f: Fn, lo: number, hi: number, samples = 600): number[] => {
  const out: number[] = []
  let x0 = lo
  let y0 = f(lo)
  for (let k = 1; k <= samples; k++) {
    const x1 = lo + ((hi - lo) * k) / samples
    const y1 = f(x1)
    if (y1 === 0 || Math.sign(y0) * Math.sign(y1) < 0) {
      if (y1 === 0) {
        // A sample landed on the zero: count it only if the sign differs on the far side.
        const after = f(x1 + (hi - lo) / samples / 2)
        if (Math.sign(y0) * Math.sign(after) < 0) out.push(x1)
      } else {
        let [a, b, fa] = [x0, x1, y0]
        for (let i = 0; i < 60; i++) {
          const m = (a + b) / 2
          const fm = f(m)
          if (Math.sign(fm) === Math.sign(fa)) [a, fa] = [m, fm]
          else b = m
        }
        out.push((a + b) / 2)
      }
    }
    ;[x0, y0] = [x1, y1]
  }
  return out
}
