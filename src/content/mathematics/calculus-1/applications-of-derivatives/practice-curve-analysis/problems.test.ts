import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number
type Data = Readonly<Record<string, number>>

const cubic =
  (d: Data): Fn =>
  (x) =>
    d.c3! * x ** 3 + d.c2! * x ** 2 + d.c1! * x + d.d!
const second = (f: Fn, x: number) => (f(x + 1e-3) - 2 * f(x) + f(x - 1e-3)) / 1e-6

/** Largest and smallest of f on [a, b] by dense sampling, no derivatives. */
const sampleRange = (f: Fn, a: number, b: number, n = 20000) => {
  let max = -Infinity
  let min = Infinity
  for (let i = 0; i <= n; i++) {
    const y = f(a + ((b - a) * i) / n)
    max = Math.max(max, y)
    min = Math.min(min, y)
  }
  return { max, min }
}

/** Local maximum, minimum or neither, from values of f near c only. */
const classify = (f: Fn, c: number) => {
  const e = 1e-3
  const left = f(c - e) - f(c)
  const right = f(c + e) - f(c)
  if (left < 0 && right < 0) return 0
  if (left > 0 && right > 0) return 1
  return 2
}

const BEND_FNS: Fn[] = [Math.sqrt, Math.log, Math.exp, (x) => x ** 3, (x) => 1 / x]
const SHAPE_FNS: Fn[] = [(r) => (4 / 3) * Math.PI * r ** 3, (r) => Math.PI * r * r, (r) => r ** 3]

describe('Practice: curve analysis problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      const value = a.kind === 'number' ? a.value : NaN
      switch (g.id) {
        case 'linear-estimate': {
          const f: Fn = (x) => x ** (1 / d.k!)
          expect(value).toBeCloseTo(f(d.b!) + derivative(f, d.b!) * d.dx!, 6)
          // and the estimate is close to the true root
          expect(Math.abs(value - f(d.b! + d.dx!))).toBeLessThan(0.05)
          break
        }
        case 'differential-error': {
          const V = SHAPE_FNS[d.shape!]!
          expect(value).toBeCloseTo(derivative(V, d.r!) * d.dr!, 4)
          break
        }
        case 'estimate-sign': {
          const f = BEND_FNS[d.which!]!
          const x = d.a! + d.dx!
          const tangent = f(d.a!) + derivative(f, d.a!) * d.dx!
          expect(a).toMatchObject({ correct: tangent > f(x) ? 0 : 1 })
          break
        }
        case 'critical-points': {
          const f = cubic(d)
          const values = a.kind === 'list' ? a.values : []
          expect(values).toHaveLength(2)
          expect(values[0]).not.toBe(values[1])
          for (const x of values) expect(derivative(f, x)).toBeCloseTo(0, 6)
          break
        }
        case 'classify':
          expect(a).toMatchObject({ correct: classify(cubic(d), d.at!) })
          expect(derivative(cubic(d), d.at!)).toBeCloseTo(0, 6)
          break
        case 'decreasing-interval': {
          // Sample f itself: the chosen option's intervals are where f goes down.
          const f = cubic(d)
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const nums = [...a.options[a.correct]!.matchAll(/-?\d+/g)].map(Number)
          const [p, q] = [nums[0]!, nums[nums.length - 1]!]
          const falls = (x: number) => f(x + 1e-4) < f(x)
          if (d.correct === 0) {
            expect(falls((p + q) / 2)).toBe(true)
            expect(falls(p - 1)).toBe(false)
          } else {
            expect(falls(p - 1)).toBe(true)
            expect(falls(q + 1)).toBe(true)
            expect(falls((p + q) / 2)).toBe(false)
          }
          break
        }
        case 'absolute-extrema': {
          const r = sampleRange(cubic(d), d.lo!, d.hi!)
          expect(value).toBeCloseTo(d.max ? r.max : r.min, 6)
          break
        }
        case 'mvt-c': {
          const f: Fn = d.kind === 0 ? (x) => x ** 3 + d.k! * x : Math.sqrt
          const [lo, hi] = d.kind === 0 ? [0, d.b!] : [d.m! ** 2, d.n! ** 2]
          expect(value).toBeGreaterThan(lo)
          expect(value).toBeLessThan(hi)
          expect(derivative(f, value)).toBeCloseTo((f(hi) - f(lo)) / (hi - lo), 6)
          break
        }
        case 'inflection': {
          const f: Fn = (x) => d.a! * x ** 3 + d.b! * x ** 2 + d.c! * x + d.d!
          expect(second(f, value - 0.5) * second(f, value + 0.5)).toBeLessThan(0)
          break
        }
        case 'concavity-at': {
          const f: Fn = (x) => d.a! * x ** 4 + d.b! * x ** 3 + d.c! * x ** 2
          expect(a).toMatchObject({ correct: second(f, d.t!) > 0 ? 0 : 1 })
          break
        }
        case 'second-test': {
          if (d.kind === 1) {
            const f: Fn = (x) => d.s! * (x - d.p!) ** 4 + d.d!
            expect(Math.abs(second(f, d.p!))).toBeLessThan(1e-3)
            expect(a).toMatchObject({ correct: 2 })
          } else {
            const f = cubic(d)
            expect(derivative(f, d.at!)).toBeCloseTo(0, 6)
            // the test's verdict agrees with the shape of f near the point
            expect(a).toMatchObject({ correct: classify(f, d.at!) === 1 ? 0 : 1 })
          }
          break
        }
        case 'drug-peak': {
          const C: Fn = (t) => d.A! * t * Math.exp(-d.k! * t)
          let [lo, hi] = [0, 50]
          for (let i = 0; i < 200; i++) {
            const m1 = lo + (hi - lo) / 3
            const m2 = hi - (hi - lo) / 3
            if (C(m1) < C(m2)) lo = m1
            else hi = m2
          }
          const top = (lo + hi) / 2
          expect(value).toBeCloseTo(d.askTime ? top : C(top), 5)
          break
        }
        default:
          throw new Error(`no check for ${g.id}`)
      }
    })
  })
})
