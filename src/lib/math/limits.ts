import type { Fn } from './calculus'

export type Side = 'left' | 'right'

/**
 * Inputs that approach a from one side, closer at each step: a - 0.1, a - 0.01, ... from the left,
 * or 10, 100, ... when a is infinite (the side is then implied by the sign of a).
 */
export const approachInputs = (a: number, side: Side, n = 6, first = 1): number[] =>
  Array.from({ length: n }, (_, i) => {
    const k = first + i
    if (a === Infinity) return 10 ** k
    if (a === -Infinity) return -(10 ** k)
    return side === 'left' ? a - 10 ** -k : a + 10 ** -k
  })

/** Values past this size, growing at every step, count as a limit of plus or minus infinity. */
const HUGE = 1e5

/**
 * Numerical estimate of a one-sided limit, from f at a +- 10^-2 ... 10^-6 (or +-10^2 ... 10^7 at
 * infinity), with one Richardson step for errors that shrink in proportion to the step. Returns
 * Infinity or -Infinity for values that grow without bound, and NaN when the values do not settle.
 * Good for the smooth functions of exercises, not a proof.
 */
export const oneSidedLimit = (f: Fn, a: number, side: Side): number => {
  const infinite = !Number.isFinite(a)
  const xs = approachInputs(a, side, infinite ? 6 : 5, 2)
  const ys = xs.map(f)
  if (ys.some((y) => Number.isNaN(y))) return NaN
  const tail = ys.slice(-3)
  const growing = tail.every((y, i) => i === 0 || Math.abs(y) > Math.abs(tail[i - 1]!) * 2)
  if (
    growing &&
    Math.abs(tail[2]!) > HUGE &&
    tail.every((y) => Math.sign(y) === Math.sign(tail[2]!))
  )
    return Math.sign(tail[2]!) * Infinity
  const [prev, last] = [ys.at(-2)!, ys.at(-1)!]
  const estimate = (10 * last - prev) / 9
  return Math.abs(last - prev) < 1e-3 * Math.max(1, Math.abs(estimate)) ? estimate : NaN
}

/**
 * The two-sided limit: the common value of both one-sided limits (or the same infinity), NaN when
 * they differ or do not exist. At plus or minus infinity there is only one side.
 */
export const limit = (f: Fn, a: number): number => {
  if (!Number.isFinite(a)) return oneSidedLimit(f, a, 'right')
  const l = oneSidedLimit(f, a, 'left')
  const r = oneSidedLimit(f, a, 'right')
  if (l === r) return l
  if (Number.isFinite(l) && Number.isFinite(r) && Math.abs(l - r) < 1e-6 * Math.max(1, Math.abs(l)))
    return (l + r) / 2
  return NaN
}

/** One interval of the bisection method, with the signs of f at its ends. */
export interface Bracket {
  a: number
  b: number
  mid: number
  fa: number
  fb: number
  fmid: number
}

/**
 * The first n + 1 intervals of the bisection method for a root of f in [a, b], where f(a) and
 * f(b) have opposite signs. Each step keeps the half whose ends still have opposite signs, so by
 * the intermediate value theorem (for continuous f) every interval contains a root.
 */
export const bisection = (f: Fn, a: number, b: number, n: number): Bracket[] => {
  if (Math.sign(f(a)) === Math.sign(f(b))) throw new Error('f(a) and f(b) must differ in sign')
  const out: Bracket[] = []
  let [lo, hi] = [a, b]
  for (let k = 0; k <= n; k++) {
    const mid = (lo + hi) / 2
    const [fa, fb, fmid] = [f(lo), f(hi), f(mid)]
    out.push({ a: lo, b: hi, mid, fa, fb, fmid })
    if (fmid === 0) break
    if (Math.sign(fmid) === Math.sign(fa)) lo = mid
    else hi = mid
  }
  return out
}

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
]

/** ln Γ(x) for x > 0 (Lanczos approximation, about 15 digits). Γ(n + 1) = n!. */
export const lnGamma = (x: number): number => {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x)
  const z = x - 1
  let s = LANCZOS[0]!
  for (let i = 1; i < LANCZOS.length; i++) s += LANCZOS[i]! / (z + i)
  const t = z + 7.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s)
}
