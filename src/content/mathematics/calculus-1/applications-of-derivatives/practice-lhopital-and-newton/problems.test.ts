import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number

/** A two-sided limit at c, from the mean of F(c + h) and F(c - h) (odd error terms cancel). */
const near = (F: Fn, c: number, h = 1e-4) => (F(c + h) + F(c - h)) / 2

/** A root of f in [lo, hi], where f changes sign, by bisection. */
const bisect = (f: Fn, lo: number, hi: number) => {
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2
    if (f(lo) * f(mid) <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/** Newton's method with numerical derivatives, written apart from the generators. */
const run = (f: Fn, x0: number, n: number) => {
  const xs = [x0]
  for (let k = 0; k < n; k++) {
    const x = xs[k]!
    const slope = derivative(f, x, 1e-6)
    if (Math.abs(slope) < 1e-9) return { xs, flat: true }
    xs.push(x - f(x) / slope)
  }
  return { xs, flat: false }
}

describe("Practice: L'Hôpital and Newton problems", () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const value = p.answer.kind === 'number' ? p.answer.value : NaN
      const a = d.a!
      const b = d.b!
      switch (g.id) {
        case 'zero-over-zero': {
          const F: Fn = [
            (x: number) => (Math.exp(a * x) - 1) / Math.sin(b * x),
            (x: number) => (1 - Math.cos(a * x)) / (x * x),
            (x: number) => Math.log(x) / (x ** d.k! - 1),
            (x: number) => (Math.sin(a * x) - a * x) / x ** 3,
          ][d.fam!]!
          expect(value).toBeCloseTo(near(F, d.fam === 2 ? 1 : 0), 4)
          break
        }
        case 'infinity-over-infinity': {
          const F: Fn = [
            (x: number) => Math.log(1 + Math.exp(a * x)) / x,
            (x: number) => (Math.exp(a * x) + x * x) / (b * Math.exp(a * x) - x),
            (x: number) => x ** d.n! / Math.exp(a * x),
          ][d.fam!]!
          expect(value).toBeCloseTo(F(600 / a), 8)
          break
        }
        case 'zero-times-infinity': {
          if (d.fam === 3) {
            expect(value).toBeCloseTo(1e-8 ** d.p! * Math.log(1e-8), 5)
            break
          }
          const F: Fn = [
            (x: number) => x * Math.sin(a / x),
            (x: number) => x * (Math.exp(a / x) - 1),
            (x: number) => x * Math.log(1 + a / x),
          ][d.fam!]!
          expect(value).toBeCloseTo(F(1e6), 4)
          break
        }
        case 'infinity-minus-infinity': {
          const F: Fn = [
            (x: number) => 1 / x - d.b! / (Math.exp(d.b! * x) - 1),
            (x: number) => d.b! / Math.log(1 + d.b! * x) - 1 / x,
            (x: number) => 1 / (x * x) - a / (x * Math.sin(a * x)),
          ][d.fam!]!
          expect(value).toBeCloseTo(near(F, 0, 1e-3), 4)
          break
        }
        case 'power-forms': {
          const v = [
            () => (1 + a / 1e7) ** (b * 1e7),
            () => (1 + a * 1e-7) ** (b / 1e-7),
            () => (Math.exp(600) + 600) ** (a / 600),
            () => 1e-9 ** Math.sin(a * 1e-9),
          ][d.fam!]!()
          expect(Math.abs(value - v) / v).toBeLessThan(1e-4)
          break
        }
        case 'compounding': {
          // The balance paid n times a year, extrapolated to n -> infinity (Richardson).
          const A = (n: number) => d.P! * (1 + d.r! / n) ** (n * d.t!)
          const limit = 2 * A(2e5) - A(1e5)
          const monthly = d.P! * (1 + d.r! / 12) ** (12 * d.t!)
          expect(Math.abs(value - (d.compare === 1 ? limit - monthly : limit))).toBeLessThan(1e-3)
          break
        }
        case 'check-the-form': {
          const v =
            d.fam === 0
              ? (Math.cos(a * 1e-9) + b) / (1e-9 + d.c!)
              : (a * 1e9 + Math.sin(1e9)) / (b * 1e9 + Math.cos(1e9))
          expect(value).toBeCloseTo(v, 6)
          break
        }
        case 'newton-step': {
          const f: Fn = (x) => x ** 3 + d.c2! * x * x + d.c1! * x + d.c0!
          expect(value).toBeCloseTo(run(f, d.x0!, 1).xs[1]!, 6)
          break
        }
        case 'newton-sqrt': {
          const { xs } = run((x) => x * x - a, d.x0!, 2)
          expect(value).toBeCloseTo(xs[2]!, 7)
          expect(Math.abs(value - Math.sqrt(a))).toBeLessThan(1e-3)
          break
        }
        case 'newton-loan-rate': {
          const h: Fn = (r) => d.loan! * r - d.pay! * (1 - (1 + r) ** -d.n!)
          const r = bisect(h, 1e-6, 0.05)
          expect(Math.abs(value - 1200 * r)).toBeLessThan(1e-6)
          // The rate from the rounded payment stays close to the quoted one.
          expect(Math.abs(value - d.annual!)).toBeLessThan(0.05)
          break
        }
        case 'newton-root': {
          const f: Fn = [
            (x: number) => x ** 3 + d.p! * x - d.q!,
            (x: number) => Math.cos(x) - x,
            (x: number) => Math.exp(-x) - x,
          ][d.fam!]!
          expect(Math.abs(value - bisect(f, -5, 5))).toBeLessThan(1e-8)
          break
        }
        case 'newton-behavior': {
          if (p.answer.kind !== 'choice') throw new Error('Expected a choice')
          const f: Fn = [
            (x: number) => x * x - a,
            (x: number) => x ** 3 - 2 * d.c! ** 2 * x + 2 * d.c! ** 3,
            (x: number) => Math.cbrt(x - d.h!),
            (x: number) => x * x - a,
          ][d.kind!]!
          const x0 = d.kind === 1 ? 0 : d.x0!
          const { xs, flat } = run(f, x0, 6)
          let behavior: number
          if (flat) behavior = 3
          else if (Math.abs(xs[2]! - xs[0]!) < 1e-6 && Math.abs(xs[1]! - xs[0]!) > 0.5) behavior = 1
          else if (Math.abs(f(xs[6]!)) < 1e-9) behavior = 0
          else behavior = Math.abs(xs[4]! - d.h!) > 8 * Math.abs(x0 - d.h!) ? 2 : -1
          expect(p.answer.correct).toBe(behavior)
          break
        }
        case 'newton-minimum': {
          const gfn: Fn = (x) => x ** 4 + d.c2! * x * x + d.c1! * x
          const d1: Fn = (x) => derivative(gfn, x, 1e-5)
          const d2 = derivative(d1, d.x0!, 1e-4)
          expect(d2).toBeGreaterThan(0)
          expect(value).toBeCloseTo(d.x0! - d1(d.x0!) / d2, 4)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
