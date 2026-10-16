import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const base = (id: number) => (id === 0 ? (x: number) => x * x : Math.abs)
const exprTex = (a: { kind: string; tex?: string }) => (a.kind === 'expression' ? a.tex! : '')
const chosen = (a: { kind: string; options?: readonly string[]; correct?: number }) =>
  a.kind === 'choice' ? a.options![a.correct!]! : ''

describe('transformation problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'shift-formula': {
          const f = base(d.base!)
          for (const x of [-2.6, 0.4, 3.1])
            expect(evaluateTex(exprTex(a), { x })).toBeCloseTo(f(x - d.h!) + d.k!, 8)
          break
        }
        case 'describe-shift': {
          // The vertex of (x - h)^2 + k is (h, k): it moved right when h > 0 and up when k > 0.
          const option = chosen(a)
          expect(option.startsWith(d.h! > 0 ? 'right' : 'left')).toBe(true)
          expect(option).toContain(d.k! > 0 ? 'up' : 'down')
          break
        }
        case 'reflect-stretch': {
          const f = base(d.base!)
          for (const x of [-2.2, 0.5, 1.7])
            expect(evaluateTex(exprTex(a), { x })).toBeCloseTo(-d.s! * f(x) + d.k!, 8)
          break
        }
        case 'point-image': {
          // Any f through (x0, y0) works; the chosen point must lie on g = a f(x - h) + k.
          const f = (x: number) => d.y0! + 7 * (x - d.x0!)
          const [X, Y] = chosen(a).slice(2, -2).split(',').map(Number) as [number, number]
          expect(d.a! * f(X - d.h!) + d.k!).toBe(Y)
          break
        }
        case 'horizontal-stretch':
          expect(a.kind === 'number' && d.b! * a.value).toBe(d.x0)
          break
      }
    })
  })
})
