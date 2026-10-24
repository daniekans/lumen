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
