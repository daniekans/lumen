import { describe, expect, it } from 'vitest'
import { evaluate, parseTex } from '@/lib/practice'
import {
  degToRad,
  exactTex,
  piTex,
  radToDeg,
  reduceAngle,
  sinusoid,
  sinusoidFeatures,
  solveInTurn,
  tanUndefined,
  trig,
} from './trig'

const ev = (tex: string) => evaluate(parseTex(tex))

/** Every multiple of π/6 and π/4 in [-2π, 2π], as [n, d] with angle nπ/d. */
const SPECIAL = [6, 4].flatMap((d) =>
  Array.from({ length: 4 * d + 1 }, (_, i) => [i - 2 * d, d] as const),
)

describe('trig', () => {
  it('converts degrees and radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12)
    expect(radToDeg(Math.PI / 3)).toBeCloseTo(60, 12)
    expect(reduceAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12)
    expect(reduceAngle(5 * Math.PI)).toBeCloseTo(Math.PI, 12)
  })

  it('writes multiples of π as TeX that evaluates to the angle', () => {
    expect(piTex(2, 6)).toBe('\\frac{\\pi}{3}')
    expect(piTex(-4, 4)).toBe('-\\pi')
    expect(piTex(0, 6)).toBe('0')
    for (const [n, d] of SPECIAL) expect(ev(piTex(n, d))).toBeCloseTo((n * Math.PI) / d, 12)
  })

  it('gives exact TeX for sine, cosine and tangent at every special angle', () => {
    for (const [n, d] of SPECIAL) {
      const t = (n * Math.PI) / d
      for (const fn of ['sin', 'cos', 'tan'] as const) {
        if (fn === 'tan' && tanUndefined(t)) continue
        const v = trig[fn](t)
        const tex = exactTex(v)
        expect(tex, `${fn}(${n}π/${d})`).not.toBeNull()
        expect(ev(tex!)).toBeCloseTo(v, 12)
      }
    }
    expect(exactTex(0.3)).toBeNull()
  })

  it('reads amplitude, period and extremes of a sinusoid', () => {
    const s = { A: -3, B: 2, C: 1, D: 4 }
    const f = sinusoidFeatures(s)
    expect(f).toMatchObject({ amplitude: 3, midline: 4, max: 7, min: 1 })
    expect(f.period).toBeCloseTo(Math.PI, 12)
    // Sample the function: it repeats with the period and stays within [min, max].
    const g = sinusoid(s)
    let [lo, hi] = [Infinity, -Infinity]
    for (let i = 0; i <= 2000; i++) {
      const x = (i / 2000) * 7
      expect(g(x + f.period)).toBeCloseTo(g(x), 9)
      lo = Math.min(lo, g(x))
      hi = Math.max(hi, g(x))
    }
    expect(lo).toBeCloseTo(1, 4)
    expect(hi).toBeCloseTo(7, 4)
  })

  it('finds every solution of sin θ = c and cos θ = c in one turn', () => {
    for (const fn of ['sin', 'cos'] as const)
      for (const c of [-1, -0.8, -0.5, 0, 0.3, Math.SQRT2 / 2, 1]) {
        const sols = solveInTurn(fn, c)
        for (const t of sols) {
          expect(trig[fn](t)).toBeCloseTo(c, 9)
          expect(t).toBeGreaterThanOrEqual(0)
          expect(t).toBeLessThan(2 * Math.PI)
        }
        // Count sign changes of fn(θ) - c on a fine grid; tangencies (c = ±1) give one root.
        let crossings = 0
        const N = 20000
        for (let i = 0; i < N; i++) {
          const a = trig[fn]((i / N) * 2 * Math.PI) - c
          const b = trig[fn](((i + 1) / N) * 2 * Math.PI) - c
          if (a === 0 || a * b < 0) crossings++
        }
        expect(sols.length).toBe(Math.abs(c) === 1 ? 1 : crossings)
      }
    expect(solveInTurn('sin', 1.5)).toEqual([])
  })
})
