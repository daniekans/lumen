import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number

/** The function each generator differentiates, rebuilt from its data. */
const source = (id: string, d: Readonly<Record<string, number>>): Fn | undefined => {
  switch (id) {
    case 'polynomial':
      return (x) => d.a! * x ** d.n! + d.b! * x * x + d.c! * x + d.d!
    case 'negative-power':
      return (x) => d.a! / x ** d.k! + d.c! * x
    case 'product':
      return (x) => (d.a! * x + d.b!) * (d.c! * x * x + d.d!)
    case 'quotient':
      return (x) => (d.a! * x + d.b!) / (x + d.d!)
    default:
      return undefined
  }
}

describe('basic rules problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      const f = source(g.id, d)
      if (f) {
        const t = a.kind === 'expression' ? a.tex : ''
        for (const x of [0.6, 1.3, 2.7])
          expect(evaluateTex(t, { x }), `${g.id} at ${x}`).toBeCloseTo(derivative(f, x), 4)
        return
      }
      if (g.id === 'rules-at-a-point') {
        const { f0, f1, g0, g1, quotient } = d as Record<string, number>
        // Product and quotient of the linear functions with those values and slopes at 0.
        const F: Fn = (x) => f0! + f1! * x
        const G: Fn = (x) => g0! + g1! * x
        const h: Fn = quotient ? (x) => F(x) / G(x) : (x) => F(x) * G(x)
        expect(a).toMatchObject({ value: expect.closeTo(derivative(h, 0), 6) })
      }
      if (g.id === 'motion-rates') {
        const s: Fn = (t) => d.a! * t ** 3 + d.b! * t * t + d.c! * t + d.d!
        const v: Fn = (t) => derivative(s, t, 1e-4)
        const vt = v(d.t1!)
        const at = derivative(v, d.t1!, 1e-3)
        if (d.kind === 2)
          expect(a).toMatchObject({ correct: Math.sign(vt) === Math.sign(at) ? 0 : 1 })
        else expect(a).toMatchObject({ value: expect.closeTo(d.kind === 0 ? vt : at, 3) })
        return
      }
      if (g.id === 'motion-rest') {
        const s: Fn = (t) => t ** 3 + d.b! * t * t + d.c! * t + d.d!
        const values = a.kind === 'list' ? a.values : []
        expect(values).toHaveLength(2)
        for (const t of values) {
          expect(t).toBeGreaterThan(0)
          expect(derivative(s, t)).toBeCloseTo(0, 5)
        }
        // and the velocity really changes sign at each, so the zeros are not a double root
        expect(derivative(s, values[0]! - 0.5) * derivative(s, values[0]! + 0.5)).toBeLessThan(0)
        return
      }
      if (g.id === 'highest-point') {
        const s: Fn = (t) => d.s0! + d.v0! * t - 4.9 * t * t
        // the top by ternary search on s, without using the derivative
        let [lo, hi] = [0, 10]
        for (let i = 0; i < 200; i++) {
          const m1 = lo + (hi - lo) / 3
          const m2 = hi - (hi - lo) / 3
          if (s(m1) < s(m2)) lo = m1
          else hi = m2
        }
        const tTop = (lo + hi) / 2
        expect(a).toMatchObject({ value: expect.closeTo(d.height ? s(tTop) : tTop, 6) })
        return
      }
      if (g.id === 'tangent-line') {
        const f: Fn = (x) => d.a! * x ** 3 + d.b! * x * x + d.c! * x + d.d!
        const x0 = d.x0!
        const t = a.kind === 'expression' ? a.tex : ''
        expect(evaluateTex(t, { x: x0 })).toBeCloseTo(f(x0), 6)
        expect(evaluateTex(t, { x: x0 + 1 })! - evaluateTex(t, { x: x0 })!).toBeCloseTo(
          derivative(f, x0),
          4,
        )
      }
    })
  })
})
