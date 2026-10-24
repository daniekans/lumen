import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number

/** The function each generator differentiates, rebuilt from its data, and points to compare at. */
const source = (id: string, d: Readonly<Record<string, number>>): [Fn, number[]] | undefined => {
  const { a, b, c } = d as Record<string, number>
  switch (id) {
    case 'elementary':
      return [(x) => a! * Math.exp(x) + b! * Math.sin(x) + c! * Math.log(x), [0.5, 1.4, 2.8]]
    case 'base-and-tangent':
      return [(x) => a! * d.b! ** x + c! * Math.tan(x), [-1.1, 0.3, 1.2]]
    case 'fractional-power':
      return [(x) => a! * x ** (d.p! / d.q!), [0.5, 1.4, 2.8]]
    case 'power-of-linear':
      return [(x) => (a! * x + b!) ** d.n!, [-1.2, 0.4, 1.7]]
    case 'root-of-quadratic':
      return [(x) => Math.sqrt(a! * x * x + b!), [-2, 0.4, 2.5]]
    case 'exp-of-polynomial':
      return [(x) => c! * Math.exp(a! * x * x + b! * x), [-0.9, 0.2, 0.8]]
    case 'trig-of-inner':
      return [
        d.square ? (x) => Math.cos(a! * x * x) : (x) => Math.sin(a! * x + b!),
        [-1.3, 0.4, 1.9],
      ]
    case 'log-of-quadratic':
      return [(x) => Math.log(a! * x * x + d.k!), [-2, 0.3, 2.6]]
    case 'product-with-chain':
      return [(x) => x ** d.m! * Math.exp(a! * x), [-0.8, 0.5, 1.3]]
    default:
      return undefined
  }
}

describe('chain rule problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      const src = source(g.id, d)
      if (src) {
        const [f, xs] = src
        const t = a.kind === 'expression' ? a.tex : ''
        for (const x of xs) {
          const want = derivative(f, x, 1e-6)
          const got = evaluateTex(t, { x }) ?? NaN
          expect(Math.abs(got - want), `${g.id} at ${x}: ${t}`).toBeLessThan(
            1e-4 * Math.max(1, Math.abs(want)),
          )
        }
        return
      }
      // chain-from-values: h = f∘g with linear f and g that have the given values and slopes.
      const { x0, g0, g1, f1 } = d as Record<string, number>
      const inner: Fn = (x) => g0! + g1! * (x - x0!)
      const outer: Fn = (u) => f1! * (u - g0!)
      expect(a).toMatchObject({
        value: expect.closeTo(
          derivative((x) => outer(inner(x)), x0!),
          6,
        ),
      })
    })
  })
})
