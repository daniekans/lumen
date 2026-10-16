import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

/** The correct option of a choice answer, as written. */
const chosen = (a: { kind: string; options?: readonly string[]; correct?: number }) =>
  a.kind === 'choice' ? a.options![a.correct!]! : ''

describe('evaluating and domain problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'evaluate-quadratic':
          expect(a).toMatchObject({ value: d.a! * d.k! ** 2 + d.b! * d.k! + d.c! })
          break
        case 'evaluate-piecewise': {
          const f = (x: number) => (x < d.k! ? d.m! * x + d.q! : x ** 2 + d.r!)
          expect(a).toMatchObject({ value: f(d.x!) })
          break
        }
        case 'evaluate-expression': {
          const f = (x: number) => x * x + d.b! * x
          for (const t of [-1.7, 0.3, 2.4])
            expect(evaluateTex(a.kind === 'expression' ? a.tex : '', { t })).toBeCloseTo(
              f(t + d.p!),
              8,
            )
          break
        }
        case 'domain-root': {
          // Sample both sides of the boundary and compare with the chosen bracket direction.
          const e = -d.b! / d.a!
          const inside = (x: number) => d.a! * x + d.b! >= 0
          const option = chosen(a)
          expect(inside(e)).toBe(true)
          expect(option.startsWith('$[')).toBe(inside(e + 1))
          expect(option.endsWith(']$')).toBe(inside(e - 1))
          break
        }
        case 'domain-fraction': {
          const den = (x: number) => x * x - (d.r1! + d.r2!) * x + d.r1! * d.r2!
          expect(a.kind).toBe('list')
          if (a.kind !== 'list') break
          expect(a.values).toHaveLength(2)
          for (const v of a.values) expect(den(v)).toBe(0)
          expect(a.values[0]).not.toBe(a.values[1])
          break
        }
        case 'range-vertex': {
          const f = (x: number) => d.a! * (x - d.h!) ** 2 + d.k!
          const option = chosen(a)
          expect(f(d.h!)).toBe(d.k!)
          expect(option).toContain(String(d.k))
          // Opens up: values above k occur, so the range is [k, oo).
          expect(option.startsWith('$[')).toBe(f(d.h! + 1) > d.k!)
          break
        }
        case 'domain-root-over-linear': {
          const f = (x: number) => Math.sqrt(x - d.a!) / (x - d.b!)
          expect(Number.isFinite(f(d.a!))).toBe(true)
          expect(Number.isFinite(f(d.b!))).toBe(false)
          expect(Number.isNaN(f(d.a! - 0.5))).toBe(true)
          expect(chosen(a)).toBe(`$[${d.a}, ${d.b}) \\cup (${d.b}, \\infty)$`)
          break
        }
      }
    })
  })
})
