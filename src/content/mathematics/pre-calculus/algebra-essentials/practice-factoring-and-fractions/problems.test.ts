import { describe, expect, it } from 'vitest'
import { evaluateTex, type Answer } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const POINTS = [-2.7, -1.3, 0.4, 1.9, 3.1]

/** Value of an option such as $(2x + 1)(x - 3)$ at x. */
const valueOf = (option: string, x: number) => evaluateTex(option.slice(1, -1), { x }) ?? NaN

const equalAt = (option: string, f: (x: number) => number) =>
  POINTS.every((x) => Math.abs(valueOf(option, x) - f(x)) < 1e-9 * Math.max(1, Math.abs(f(x))))

/** Options equal to f as functions; the correct option must be one of them. */
const equalOptions = (answer: Answer, f: (x: number) => number) => {
  if (answer.kind !== 'choice') throw new Error('expected a choice')
  const equal = answer.options.map((o) => equalAt(o, f))
  expect(equal[answer.correct]).toBe(true)
  return answer.options.filter((_, i) => equal[i])
}

describe('factoring and rational expression problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'common-factor': {
          const f = (x: number) => d.g! * d.a! * x * x + d.g! * d.b! * x
          const equal = equalOptions(a, f)
          // Equal but unfinished forms are allowed; only the correct one has gx outside.
          expect(equal.filter((o) => o.startsWith(`$${d.g}x(`))).toHaveLength(1)
          break
        }
        case 'trinomial':
          expect(equalOptions(a, (x) => (x + d.p!) * (x + d.q!))).toHaveLength(1)
          break
        case 'leading-coefficient':
          expect(equalOptions(a, (x) => (d.a! * x + d.p!) * (x + d.q!))).toHaveLength(1)
          break
        case 'difference-of-squares':
          expect(equalOptions(a, (x) => d.a! ** 2 * x * x - d.b! ** 2)).toHaveLength(1)
          break
        case 'simplify-rational': {
          const f = (x: number) => ((x + d.a!) * (x + d.b!)) / ((x + d.a!) * (x + d.c!))
          expect(equalOptions(a, f)).toHaveLength(1)
          break
        }
        case 'hole': {
          // The limit at the cancelled zero, approached from both sides.
          const f = (x: number) => ((x + d.a!) * (x + d.b!)) / ((x + d.a!) * (x + d.c!))
          const value = a.kind === 'number' ? a.value : NaN
          for (const e of [1e-7, -1e-7]) expect(value).toBeCloseTo(f(-d.a! + e), 5)
          break
        }
        case 'excluded-values': {
          // Zeros of x^2 + (a + c)x + ac from the quadratic formula.
          const [B, C] = [d.a! + d.c!, d.a! * d.c!]
          const r = Math.sqrt(B * B - 4 * C)
          const zeros = [(-B - r) / 2, (-B + r) / 2].sort((u, v) => u - v)
          if (a.kind !== 'list') throw new Error('expected a list')
          expect([...a.values].sort((u, v) => u - v)).toEqual(
            zeros.map((z) => expect.closeTo(z, 9)),
          )
          break
        }
        case 'multiply-rational': {
          const f = (x: number) =>
            ((x + d.b!) * (x + d.c!) * (x + d.a!)) / ((x + d.a!) * (x + d.c!))
          if (a.kind !== 'expression') throw new Error('expected an expression')
          for (const x of POINTS) expect(evaluateTex(a.tex, { x })).toBeCloseTo(f(x), 9)
          break
        }
        case 'add-rational': {
          const f = (x: number) => d.m! / (x - d.p!) + d.n! / (x - d.q!)
          if (a.kind !== 'expression') throw new Error('expected an expression')
          for (const x of [-4.3, -0.55, 2.35, 5.7]) {
            const n = evaluateTex(a.tex, { x })!
            expect(n / ((x - d.p!) * (x - d.q!))).toBeCloseTo(f(x), 9)
          }
          break
        }
      }
    })
  })
})
