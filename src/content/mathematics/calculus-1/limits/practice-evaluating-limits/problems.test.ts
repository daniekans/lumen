import { describe, expect, it } from 'vitest'
import { limit, oneSidedLimit } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const close = (a: number, b: number, eps = 1e-6) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps * Math.max(1, Math.abs(b)))

/** The TeX inside the last $...$ of a prompt. */
const lastTex = (text: string) => [...text.matchAll(/\$([^$]+)\$/g)].at(-1)![1]!

/**
 * The limit a prompt asks for, estimated numerically from the prompt's own TeX: the point, the
 * side, and the expression after \lim_{x \to ...}.
 */
const limitOfPrompt = (prompt: string) => {
  const m = lastTex(prompt).match(/^\\lim_\{x \\to (.+?)\} (.+)$/)
  if (!m) throw new Error(`no limit in ${prompt}`)
  const [, to, expr] = m as unknown as [string, string, string]
  const f = (x: number) => evaluateTex(expr, { x }) ?? NaN
  const side = to.endsWith('^{-}') ? 'left' : to.endsWith('^{+}') ? 'right' : undefined
  const point = to.replace(/\^\{[-+]\}$/, '')
  const a = point === '\\infty' ? Infinity : point === '-\\infty' ? -Infinity : Number(point)
  return side ? oneSidedLimit(f, a, side) : limit(f, a)
}

const INFINITY_OPTIONS = [Infinity, -Infinity, 0, NaN]

/** The value a choice option stands for: a number, an infinity, or NaN for "does not exist". */
const optionValue = (option: string) =>
  option === '$\\infty$'
    ? Infinity
    : option === '$-\\infty$'
      ? -Infinity
      : option.startsWith('The limit does not exist')
        ? NaN
        : Number(option.slice(1, -1))

/** Checks that the correct option is the value found, and that no other option is. */
const expectOption = (options: readonly string[], correct: number, found: number) => {
  options.forEach((o, i) => {
    const v = optionValue(o)
    const same = Number.isNaN(found) ? Number.isNaN(v) : Math.abs(v - found) < 1e-9 || v === found
    expect(same, `${o} for ${found}`).toBe(i === correct)
  })
}

describe('evaluating limits practice problems', () => {
  it('generate valid problems with correct answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'conjugate-at-infinity':
        case 'difference-of-cubes':
        case 'two-techniques':
        case 'substitution':
        case 'factor-cancel':
        case 'rationalize':
        case 'combine-fractions':
        case 'limit-at-infinity':
        case 'root-at-infinity': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(limitOfPrompt(p.prompt), a.value)
          break
        }
        case 'infinite-limit': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const expected = INFINITY_OPTIONS[a.correct]!
          const found = limitOfPrompt(p.prompt)
          if (Number.isNaN(expected)) expect(found).toBeNaN()
          else expect(found).toBe(expected)
          break
        }
        case 'one-sided-piecewise': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = (x: number) => (x < d.a! ? d.m1! * x + d.b1! : d.c2! * x * x + d.b2!)
          close(oneSidedLimit(f, d.a!, d.side! < 0 ? 'left' : 'right'), a.value)
          break
        }
        case 'two-sided-exists': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const f = (x: number) =>
            x < d.a! ? d.m1! * x + d.b1! : x === d.a! ? d.v! : d.m2! * x + d.b2!
          const found = limit(f, d.a!)
          const option = a.options[a.correct]!
          if (Number.isNaN(found)) expect(option).toMatch(/does not exist/)
          else close(Number(option.slice(1, -1)), found)
          expect(d.agree === 1).toBe(!Number.isNaN(found))
          break
        }
        case 'top-higher-at-infinity':
        case 'zero-over-zero-exists': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          expectOption(a.options, a.correct, limitOfPrompt(p.prompt))
          break
        }
        case 'table-limit': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const f = (x: number) => {
            const h = x - d.a!
            return (h < 0 ? d.L! : d.R!) + d.m! * h + d.q! * h * h
          }
          // The table in the prompt shows f's own values.
          for (const h of [-0.1, -0.001, 0.01])
            expect(p.prompt).toContain(String(+f(d.a! + h).toFixed(6)))
          expectOption(a.options, a.correct, limit(f, d.a!))
          break
        }
        default:
          throw new Error(`unverified generator ${g.id}`)
      }
    })
  })
})
