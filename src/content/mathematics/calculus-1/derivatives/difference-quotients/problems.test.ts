import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const quad = (d: Readonly<Record<string, number>>) => (x: number) =>
  d.a! * x * x + d.b! * x + (d.c ?? 0)

describe('difference quotient problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'secant-slope': {
          const f = quad(d)
          expect(a).toMatchObject({ value: (f(d.q!) - f(d.p!)) / (d.q! - d.p!) })
          break
        }
        case 'derivative-at-point':
          expect(
            a.kind === 'number' && Math.abs(a.value - derivative(quad(d), d.x0!)),
          ).toBeLessThan(1e-4)
          break
        case 'difference-quotient': {
          const f = quad(d)
          for (const h of [0.3, 1.1, 1.7])
            expect(evaluateTex(a.kind === 'expression' ? a.tex : '', { h })).toBeCloseTo(
              (f(d.x0! + h) - f(d.x0!)) / h,
              6,
            )
          break
        }
        case 'derivative-function': {
          const f = d.degree === 3 ? (x: number) => d.a! * x ** 3 + d.b! * x : quad(d)
          for (const x of [-1.3, 0.4, 2.2])
            expect(evaluateTex(a.kind === 'expression' ? a.tex : '', { x })).toBeCloseTo(
              derivative(f, x),
              4,
            )
          break
        }
        case 'reciprocal-at-point': {
          const k = d.k!
          expect(a).toMatchObject({
            value: expect.closeTo(
              derivative((x) => k / x, d.x0!),
              5,
            ),
          })
          break
        }
        case 'root-at-point': {
          const c = d.c!
          expect(a).toMatchObject({
            value: expect.closeTo(
              derivative((x) => c * Math.sqrt(x), d.a! * d.a!),
              5,
            ),
          })
          break
        }
        case 'differentiable-join': {
          // With the right m, the one-sided slopes at a agree; with m + 1 they do not.
          const left = (x: number) => d.p! * x * x + d.b! * x
          const m = a.kind === 'number' ? a.value : NaN
          const right = (mm: number) => (x: number) => mm * (x - d.a!) + left(d.a!)
          const h = 1e-6
          const leftSlope = (left(d.a!) - left(d.a! - h)) / h
          expect(left(d.a!)).toBeCloseTo(right(m)(d.a!), 9)
          expect(leftSlope).toBeCloseTo((right(m)(d.a! + h) - right(m)(d.a!)) / h, 4)
          expect(Math.abs(leftSlope - (m + 1))).toBeGreaterThan(0.5)
          break
        }
        case 'tangent-line': {
          const f = quad(d)
          const m = derivative(f, d.x0!)
          for (const x of [-2, 0.5, 3])
            expect(evaluateTex(a.kind === 'expression' ? a.tex : '', { x })).toBeCloseTo(
              f(d.x0!) + m * (x - d.x0!),
              4,
            )
          break
        }
      }
    })
  })
})
