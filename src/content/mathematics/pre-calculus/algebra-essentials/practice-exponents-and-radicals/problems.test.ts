import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const squareFree = (n: number) => {
  for (let d = 2; d * d <= n; d++) if (n % (d * d) === 0) return false
  return true
}

/** Value of an option such as $3\sqrt{2}$ or $\frac{\sqrt{6}}{3}$. */
const valueOf = (option: string) => evaluateTex(option.slice(1, -1), {}) ?? NaN

/** Radicands in an option; simplest form needs every one square-free. */
const radicands = (option: string) =>
  [...option.matchAll(/\\sqrt\{(\d+)\}/g)].map((m) => Number(m[1]))

/** Exactly one option has the target value in simplest form, and it is the correct one. */
const expectOneSimplest = (
  answer: { kind: string; options?: readonly string[]; correct?: number },
  target: number,
  simplest: (option: string) => boolean,
) => {
  const good = answer.options!.map((o) => Math.abs(valueOf(o) - target) < 1e-9 && simplest(o))
  expect(good.filter(Boolean)).toHaveLength(1)
  expect(good[answer.correct!]).toBe(true)
}

describe('exponents and radicals problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      const value = a.kind === 'number' ? a.value : NaN
      switch (g.id) {
        case 'exponent-laws':
          for (const x of [0.7, 1.3, 2.1])
            expect(x ** value).toBeCloseTo((x ** d.p! * x ** d.q!) / x ** d.r!, 9)
          break
        case 'power-rules':
          // With y = 1 only the power of x remains.
          for (const x of [0.8, 1.4])
            expect(x ** value).toBeCloseTo((x ** d.p!) ** d.k! / x ** d.r!, 9)
          break
        case 'negative-zero':
          expect(value).toBeCloseTo((d.p! / d.q!) ** -d.n! - d.c! ** 0, 12)
          break
        case 'rational-exponent':
          expect(value).toBeCloseTo(d.b! ** ((d.sign! * d.p!) / d.q!), 9)
          break
        case 'simplify-radical':
          expectOneSimplest(a, Math.sqrt(d.n!), (o) => radicands(o).every(squareFree))
          break
        case 'multiply-radicals':
          expectOneSimplest(a, Math.sqrt(d.a!) * Math.sqrt(d.b!), (o) =>
            radicands(o).every(squareFree),
          )
          break
        case 'rationalize':
          expectOneSimplest(a, d.a! / Math.sqrt(d.b!), (o) => !/\}\{\\sqrt/.test(o))
          break
        case 'add-radicals': {
          const lhs =
            d.c1! * Math.sqrt(d.m1! ** 2 * d.r!) + d.sign! * d.c2! * Math.sqrt(d.m2! ** 2 * d.r!)
          expect(value * Math.sqrt(d.r!)).toBeCloseTo(lhs, 9)
          break
        }
      }
    })
  })
})
