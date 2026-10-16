import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

/** Evaluates TeX that the generator guarantees to be readable. */
const ev = (tex: string, vars: Record<string, number>) => evaluateTex(tex, vars)!
const exprTex = (a: { kind: string; tex?: string }) => (a.kind === 'expression' ? a.tex! : '')
const optionTex = (a: { kind: string; options?: readonly string[]; correct?: number }) =>
  a.kind === 'choice' ? a.options![a.correct!]!.slice(1, -1) : ''

describe('composition and inverse problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'compose-evaluate': {
          const f = (x: number) => d.a! * x + d.b!
          const gg = (x: number) => x * x + d.c!
          expect(a).toMatchObject({ value: d.fg ? f(gg(d.k!)) : gg(f(d.k!)) })
          break
        }
        case 'compose-formula': {
          const f = (x: number) => x * x + d.p!
          const gg = (x: number) => d.m! * x + d.q!
          for (const x of [-2.3, 0.7, 1.9])
            expect(ev(exprTex(a), { x })).toBeCloseTo(d.fg ? f(gg(x)) : gg(f(x)), 8)
          break
        }
        case 'decompose':
          // f(g(x)) must reproduce h(x) = (mx + q)^3.
          for (const x of [-1.4, 0.3, 2.2])
            expect(ev(exprTex(a), { x }) ** 3).toBeCloseTo((d.m! * x + d.q!) ** 3, 6)
          break
        case 'inverse-evaluate':
          expect(a.kind === 'number' && d.a! * a.value + d.b!).toBe(d.a! * d.k! + d.b!)
          break
        case 'inverse-linear':
          for (const x of [-3.1, 0.4, 5.2])
            expect(d.a! * ev(exprTex(a), { x }) + d.b!).toBeCloseTo(x, 8)
          break
        case 'inverse-cubic':
          for (const x of [-7.5, 0.2, 9.3])
            expect(ev(optionTex(a), { x }) ** 3 + d.b!).toBeCloseTo(x, 6)
          break
        case 'inverse-rational': {
          const f = (x: number) => (x + d.p!) / (x - d.q!)
          for (const x of [2.5, 3.7, 5.1]) expect(f(ev(exprTex(a), { x }))).toBeCloseTo(x, 8)
          break
        }
      }
    })
  })
})
