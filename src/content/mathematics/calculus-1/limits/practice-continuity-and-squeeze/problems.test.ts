import { describe, expect, it } from 'vitest'
import { limit, oneSidedLimit } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { KINDS, problems } from './problems'

const close = (a: number, b: number, eps = 1e-6) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps * Math.max(1, Math.abs(b)))

/** The TeX inside the first $...$ of a prompt. */
const firstTex = (text: string) => text.match(/\$([^$]+)\$/)![1]!

/** The limit a prompt asks for, estimated numerically from the prompt's own TeX. */
const limitOfPrompt = (prompt: string) => {
  const m = firstTex(prompt).match(/^\\lim_\{x \\to (.+?)\} (.+)$/)
  if (!m) throw new Error(`no limit in ${prompt}`)
  const [, to, expr] = m as unknown as [string, string, string]
  const f = (x: number) => evaluateTex(expr, { x }) ?? NaN
  return limit(f, to === '\\infty' ? Infinity : Number(to))
}

/** The kind of discontinuity of f at a, found from numerical one-sided limits and the value. */
const classify = (f: (x: number) => number, a: number) => {
  const [l, r] = [oneSidedLimit(f, a, 'left'), oneSidedLimit(f, a, 'right')]
  if (!Number.isFinite(l) || !Number.isFinite(r)) return KINDS.indexOf('Infinite discontinuity')
  if (Math.abs(l - r) > 1e-6) return KINDS.indexOf('Jump discontinuity')
  const v = f(a)
  return Number.isFinite(v) && Math.abs(v - l) < 1e-6
    ? KINDS.indexOf('Continuous')
    : KINDS.indexOf('Removable discontinuity')
}

describe('continuity and standard limits practice problems', () => {
  it('generate valid problems with correct answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'piecewise-parameter': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = (x: number) => (x < d.a! ? d.m! * x + a.value : d.p! * x * x + d.q!)
          close(limit(f, d.a!), f(d.a!))
          break
        }
        case 'classify-piecewise': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const f = (x: number) =>
            x < d.a! ? d.m1! * x + d.b1! : x === d.a! ? d.v! : d.m2! * x + d.b2!
          expect(classify(f, d.a!)).toBe(a.correct)
          break
        }
        case 'classify-rational': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const [, top, bottom] = firstTex(p.prompt).match(/\\frac\{(.+?)\}\{(.+?)\}$/)!
          const f = (x: number) =>
            (evaluateTex(top!, { x }) ?? NaN) / (evaluateTex(bottom!, { x }) ?? NaN)
          expect(classify(f, d.point!)).toBe(a.correct)
          break
        }
        case 'squeeze-bounds': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const bounds = [...p.prompt.matchAll(/\$([^$]+)\$/g)].find((m) =>
            m[1]!.includes('\\leq'),
          )!
          const [lower, , upper] = bounds[1]!.split('\\leq')
          const at = (t: string, x: number) => evaluateTex(t, { x }) ?? NaN
          // The bounds really are ordered near the point, and both tend to the answer.
          for (const x of [d.a! - 0.3, d.a! + 0.2, d.a! + 1.5])
            expect(at(lower!, x)).toBeLessThanOrEqual(at(upper!, x) + 1e-12)
          close(
            limit((x) => at(lower!, x), d.a!),
            a.value,
          )
          close(
            limit((x) => at(upper!, x), d.a!),
            a.value,
          )
          break
        }
        case 'sin-limit':
        case 'exp-limit': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(limitOfPrompt(p.prompt), a.value)
          break
        }
        case 'compound-limit': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(limitOfPrompt(p.prompt), a.value, 1e-5)
          break
        }
        case 'ivt-interval': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const poly = firstTex(p.prompt.split('of ')[1]!).replace(/^f\(x\) = /, '')
          const f = (x: number) => evaluateTex(poly, { x }) ?? NaN
          a.options.forEach((o, i) => {
            const [lo, hi] = o.slice(2, -2).split(', ').map(Number) as [number, number]
            expect(Math.sign(f(lo)) !== Math.sign(f(hi)), o).toBe(i === a.correct)
          })
          break
        }
        default:
          throw new Error(`unverified generator ${g.id}`)
      }
    })
  })
})
