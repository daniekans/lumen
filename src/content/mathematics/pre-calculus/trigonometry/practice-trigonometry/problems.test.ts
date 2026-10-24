import { describe, expect, it } from 'vitest'
import { evaluateTex, type Problem } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: Problem['answer']) =>
  a.kind === 'number' ? a.value : a.kind === 'expression' ? (evaluateTex(a.tex) ?? NaN) : NaN
const FNS = [Math.sin, Math.cos, Math.tan]

describe('Practice: trigonometry problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = (p.data ?? {}) as Data
      const a = p.answer
      switch (g.id) {
        case 'degrees-radians':
          if (d.deg !== undefined) expect(value(a)).toBeCloseTo(d.deg / 57.29577951308232, 9)
          else expect(value(a)).toBeCloseTo(d.rad! * 57.29577951308232, 9)
          break
        case 'arc-length':
          // Arc length as a fraction of the circumference.
          if (d.theta !== undefined)
            expect(value(a)).toBeCloseTo(2 * Math.PI * d.r! * (d.theta / (2 * Math.PI)), 9)
          else expect(value(a) * d.r!).toBeCloseTo(d.s!, 9)
          break
        case 'exact-value':
          expect(value(a)).toBeCloseTo(FNS[d.fn!]!(d.theta!), 9)
          break
        case 'from-one-ratio': {
          // Rebuild the angle from its point and evaluate the asked function.
          const t = Math.atan2(d.y!, d.x!)
          expect(Math.hypot(d.x!, d.y!)).toBeCloseTo(d.h!, 9)
          expect(value(a)).toBeCloseTo(FNS[d.ask!]!(t), 9)
          break
        }
        case 'sinusoid-features': {
          const f = (x: number) => d.A! * Math.sin(d.B! * (x - d.C!)) + d.D!
          let [lo, hi] = [Infinity, -Infinity]
          for (let i = 0; i <= 20000; i++) {
            const y = f((i / 20000) * 2 * Math.PI)
            lo = Math.min(lo, y)
            hi = Math.max(hi, y)
          }
          const expected = [(hi - lo) / 2, (2 * Math.PI) / d.B!, hi, lo][d.ask!]!
          expect(value(a)).toBeCloseTo(expected, 4)
          if (d.ask === 1) expect(f(0.3 + value(a))).toBeCloseTo(f(0.3), 9)
          break
        }
        case 'addition-formula': {
          const alpha = Math.asin(d.sa! / d.ha!)
          const beta = Math.acos(d.cb! / d.hb!)
          const t = alpha + d.sign! * beta
          expect(value(a)).toBeCloseTo(d.fn === 0 ? Math.sin(t) : Math.cos(t), 9)
          break
        }
        case 'double-angle': {
          const t = Math.atan2(d.y!, d.x!)
          expect(value(a)).toBeCloseTo(d.ask === 0 ? Math.sin(2 * t) : Math.cos(2 * t), 9)
          break
        }
        case 'inverse-value': {
          const v = value(a)
          if (d.nested) {
            // The answer has the same sine or cosine as θ and lies in the principal range.
            const f = FNS[d.fn!]!
            expect(f(v)).toBeCloseTo(f(d.theta!), 9)
            if (d.fn === 0) expect(Math.abs(v)).toBeLessThanOrEqual(Math.PI / 2 + 1e-12)
            else expect(v >= 0 && v <= Math.PI).toBe(true)
            expect(Math.abs(v - d.theta!)).toBeGreaterThan(0.1)
          } else {
            expect(FNS[d.fn!]!(v)).toBeCloseTo(d.c!, 9)
            if (d.fn === 1) expect(v >= -1e-12 && v <= Math.PI + 1e-12).toBe(true)
            else expect(Math.abs(v)).toBeLessThanOrEqual(Math.PI / 2 + 1e-12)
          }
          break
        }
        case 'solve-equation': {
          const f = FNS[d.fn!]!
          const vals = a.kind === 'list' ? a.values : []
          for (const v of vals) {
            expect(f(v)).toBeCloseTo(d.c!, 9)
            expect(v >= 0 && v < 2 * Math.PI).toBe(true)
          }
          // Count solutions by scanning a fine grid of one turn (24 slots per turn hold every special angle).
          const found = new Set<number>()
          for (let k = 0; k < 24; k++)
            if (Math.abs(f((k * Math.PI) / 12) - d.c!) < 1e-9) found.add(k)
          expect(vals.length).toBe(found.size)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
