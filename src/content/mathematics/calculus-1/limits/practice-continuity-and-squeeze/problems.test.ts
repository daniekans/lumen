import { describe, expect, it } from 'vitest'
import { bisection, limit, oneSidedLimit } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { BISECT, KINDS, KINDS_OSC, problems } from './problems'

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
        case 'build-squeeze': {
          if (a.kind !== 'number') throw new Error('expected a number')
          if (d.variant === 1) {
            close(limitOfPrompt(p.prompt), a.value, 1e-5)
            break
          }
          // x^n times a bounded factor: the squeeze bound itself, |f(x) - c| <= |x|^n, near 0.
          // (The numerical limit is too noisy here: the oscillation spoils its extrapolation.)
          const expr = firstTex(p.prompt).replace(/^\\lim_\{x \\to 0\} /, '')
          for (let k = 1; k <= 7; k++)
            for (const x of [10 ** -k, -(10 ** -k) * 1.37])
              expect(Math.abs((evaluateTex(expr, { x }) ?? NaN) - a.value)).toBeLessThanOrEqual(
                Math.abs(x) ** d.n! + 1e-12,
              )
          break
        }
        case 'classify-oscillating': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const body = firstTex(p.prompt).match(/\\begin\{cases\} (.+?) & x \\neq/)![1]!
          const f = (x: number) => evaluateTex(body, { x }) ?? NaN
          const damped = body.startsWith('(')
          for (let k = 1; k <= 1000; k *= 10) {
            // Inputs ever closer to a where sin(1/(x - a)) is 1 and -1.
            const [up, down] = [Math.PI / 2, (3 * Math.PI) / 2].map(
              (t) => d.a! + 1 / (t + 2 * Math.PI * k),
            )
            if (damped) {
              for (const x of [up!, down!])
                expect(Math.abs(f(x))).toBeLessThanOrEqual(Math.abs(x - d.a!) + 1e-12)
            } else {
              close(f(up!), 1)
              close(f(down!), -1)
            }
          }
          // Damped: the limit is 0, so f(a) = 0 is continuous and anything else removable.
          const kind = damped ? (d.v === 0 ? 0 : 1) : KINDS_OSC.indexOf('Oscillating discontinuity')
          expect(kind).toBe(a.correct)
          break
        }
        case 'bisection-steps': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const { g: fn, lo } = BISECT[d.i!]!
          expect(Math.sign(fn(lo))).not.toBe(Math.sign(fn(lo + 1)))
          const width = (k: number) => {
            const last = bisection(fn, lo, lo + 1, k).at(-1)!
            return last.b - last.a
          }
          expect(width(a.value)).toBeLessThan(d.tol!)
          expect(width(a.value - 1)).toBeGreaterThanOrEqual(d.tol!)
          break
        }
        case 'continuous-interest': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const amount = (n: number) => d.P! * (1 + d.rate! / n) ** (d.t! * n)
          close(limit(amount, Infinity), a.value, 1e-6)
          // The worded formula is the one in the prompt.
          expect(p.prompt).toContain(`\\frac{${d.rate}}{n}`)
          break
        }
        default:
          throw new Error(`unverified generator ${g.id}`)
      }
    })
  })
})
