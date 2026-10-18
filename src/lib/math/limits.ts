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
