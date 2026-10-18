import { describe, expect, it } from 'vitest'
import { largestDelta, thresholdN } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { GROWTH, GROWTH_OPTIONS, problems } from './problems'

const close = (a: number, b: number, eps = 1e-6) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps * Math.max(1, Math.abs(b)))

/** The TeX inside each $...$ of a prompt. */
const texParts = (text: string) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!)

/** The number after "\varepsilon = " in a prompt. */
const epsOf = (prompt: string) => Number(prompt.match(/\\varepsilon = ([\d.]+)/)![1])

/** ln of each growth class at x, computed from its parameter. */
const lnGrowth = (cls: number, param: number, x: number) =>
  GROWTH[cls] === 'log'
    ? param * Math.log(Math.log(x))
    : GROWTH[cls] === 'power'
      ? param * Math.log(x)
      : x * Math.log(param)

describe('limit definition practice problems', () => {
  it('generate valid problems with correct answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'delta-linear': {
          if (a.kind !== 'number') throw new Error('expected a number')
          // The line and its limit, read back from the prompt's TeX.
          const [head] = texParts(p.prompt)
          const m = head!.match(/^\\lim_\{x \\to (-?\d+)\} \((.+)\) = (-?\d+)$/)!
          const f = (x: number) => evaluateTex(m[2]!, { x }) ?? NaN
          close(f(Number(m[1])), Number(m[3]))
          close(largestDelta(f, Number(m[1]), Number(m[3]), epsOf(p.prompt), 10).delta, a.value)
          break
        }
        case 'delta-quadratic': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const eps = epsOf(p.prompt)
          expect(eps).toBeLessThan(d.a! * d.a!)
          close(largestDelta((x) => x * x, d.a!, d.a! * d.a!, eps, 10).delta, a.value)
          break
        }
        case 'delta-min-rule': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const eps = epsOf(p.prompt)
          close(a.value, Math.min(1, eps / (2 * Math.abs(d.a!) + 1)))
          // The rule's delta really works.
          const best = largestDelta((x) => x * x, d.a!, d.a! * d.a!, eps, 2).delta
          expect(best).toBeGreaterThanOrEqual(a.value - 1e-9)
          break
        }
        case 'epsilon-n': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [head] = texParts(p.prompt)
          const m = head!.match(/^\\lim_\{x \\to \\infty\} (.+) = (-?\d+)$/)!
          const f = (x: number) => evaluateTex(m[1]!, { x }) ?? NaN
          close(thresholdN(f, Number(m[2]), epsOf(p.prompt), 3 * a.value), a.value)
          break
        }
        case 'growth-ratio': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const ln = (x: number) => lnGrowth(d.top!, d.t!, x) - lnGrowth(d.bottom!, d.u!, x)
          // The log of the ratio runs off to -infinity (limit 0) or +infinity.
          const [r1, r2] = [ln(1e20), ln(1e30)]
          expect(Math.sign(r1)).toBe(Math.sign(r2))
          expect(Math.abs(r2)).toBeGreaterThan(Math.abs(r1))
          expect(Math.abs(r2)).toBeGreaterThan(5)
          expect(GROWTH_OPTIONS[a.correct]).toBe(r2 < 0 ? '$0$' : '$\\infty$')
          break
        }
        case 'big-o-constant': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = (x: number) => d.p! * x * x + d.q! * x + d.r!
          let sup = 0
          for (let x = d.x0!; x < 1e4; x *= 1.01) sup = Math.max(sup, f(x) / (x * x))
          close(sup, a.value)
          break
        }
        case 'proof-linear':
        case 'proof-quadratic':
          expect(a.kind).toBe('self')
          break
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
