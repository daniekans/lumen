import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number

/** Where f is largest or smallest on [a, b], by dense sampling (no derivatives). */
const argBest = (f: Fn, a: number, b: number, sense: 1 | -1, n = 200_000) => {
  let best = a
  let value = sense * f(a)
  for (let i = 1; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    const v = sense * f(x)
    if (v > value) {
      value = v
      best = x
    }
  }
  return { x: best, value: sense * value }
}

describe('Practice: optimization problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const value = p.answer.kind === 'number' ? p.answer.value : NaN
      switch (g.id) {
        case 'fence': {
          // a x + b y = L, area x y.
          const area: Fn = (x) => (x * (d.L! - d.a! * x)) / d.b!
          const best = argBest(area, 0, d.L! / d.a!, 1)
          expect(value).toBeCloseTo(best.value, 3)
          break
        }
        case 'box': {
          const V: Fn = (x) => x * (d.W! - 2 * x) * (d.H! - 2 * x)
          const best = argBest(V, 0, Math.min(d.W!, d.H!) / 2, 1)
          expect(Math.abs(value - best.x)).toBeLessThan(1e-3)
          break
        }
        case 'can': {
          const A: Fn = (r) =>
            d.disks! * Math.PI * r * r + 2 * Math.PI * r * (d.V! / (Math.PI * r * r))
          const best = argBest(A, 0.5, 30, -1)
          expect(Math.abs(value - best.x)).toBeLessThan(1e-3)
          break
        }
        case 'closest-point': {
          // Distance from the point to (x, curve(x)), over the curve's domain.
          const dist: Fn =
            d.parabola === 1
              ? (x) => Math.hypot(x, x * x - d.p!)
              : (x) => Math.hypot(x - d.p!, Math.sqrt(x))
          const best = argBest(dist, d.parabola === 1 ? -5 : 0, 15, -1)
          expect(value).toBeCloseTo(best.value, 5)
          break
        }
        case 'profit': {
          const P: Fn = (q) => (q - d.c!) * (d.Q! - d.k! * q)
          const top = d.cap! > 0 ? d.cap! : d.Q! / d.k!
          const best = argBest(P, d.c!, top, 1)
          expect(Math.abs(value - best.x)).toBeLessThan(1e-3)
          break
        }
        case 'least-squares': {
          const ys = Array.from({ length: d.n! }, (_, i) => d[`y${i}`]!)
          const S: Fn = (c) => ys.reduce((s, y) => s + (y - c) ** 2, 0)
          const best = argBest(S, -5, 25, -1)
          if (d.askMin === 1) expect(value).toBeCloseTo(best.value, 4)
          else expect(Math.abs(value - best.x)).toBeLessThan(1e-3)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
