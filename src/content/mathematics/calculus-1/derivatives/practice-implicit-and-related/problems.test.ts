import { describe, expect, it } from 'vitest'
import { derivative } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Fn = (x: number) => number

/** The y near `y0` with F(x, y) = 0, by Newton's method in y. */
const solveY = (F: (x: number, y: number) => number, x: number, y0: number) => {
  let y = y0
  for (let i = 0; i < 60; i++) {
    const fy = (F(x, y + 1e-7) - F(x, y - 1e-7)) / 2e-7
    y -= F(x, y) / fy
  }
  return y
}

/** dy/dx on the curve F = 0 at (x0, y0), from points of the curve on both sides of x0. */
const curveSlope = (F: (x: number, y: number) => number, x0: number, y0: number) =>
  derivative((x) => solveY(F, x, y0), x0, 1e-5)

/** The x with f(x) = y for an increasing f, by bisection. */
const invert = (f: Fn, y: number) => {
  let [lo, hi] = [-50, 50]
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < y) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

const close = (got: number, want: number, label: string) =>
  expect(Math.abs(got - want), label).toBeLessThan(1e-4 * Math.max(1, Math.abs(want)))

describe('implicit differentiation and related rates problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = (p.data ?? {}) as Record<string, number>
      const a = p.answer
      const value = a.kind === 'number' ? a.value : NaN
      const t = a.kind === 'expression' ? a.tex : ''
      switch (g.id) {
        case 'implicit-slope': {
          const { x0, y0, k, c } = d as Record<string, number>
          const F = (x: number, y: number) => x * x + k! * x * y + y * y - c!
          expect(F(x0!, y0!)).toBe(0)
          close(value, curveSlope(F, x0!, y0!), g.id)
          return
        }
        case 'implicit-derivative': {
          const { m, n, a: ca, b } = d as Record<string, number>
          for (const [x, y] of [
            [0.7, 1.3],
            [1.5, 0.8],
            [1.1, 1.9],
          ] as const) {
            // the curve of the same family through (x, y)
            const c = ca! * x ** m! + b! * y ** n!
            const F = (u: number, v: number) => ca! * u ** m! + b! * v ** n! - c
            close(evaluateTex(t, { x, y }) ?? NaN, curveSlope(F, x, y), `${g.id}: ${t}`)
          }
          return
        }
        case 'tangent-implicit': {
          const { a: ca, b, x0, y0, c } = d as Record<string, number>
          const F = (x: number, y: number) => ca! * x * x + b! * y * y - c!
          const line: Fn = (x) => evaluateTex(t, { x }) ?? NaN
          close(line(x0!), y0!, `${g.id} passes through the point: ${t}`)
          close(derivative(line, x0!), curveSlope(F, x0!, y0!), `${g.id} slope: ${t}`)
          return
        }
        case 'inverse-derivative': {
          const f: Fn = (x) => x ** 3 + d.a! * x + d.b!
          const y0 = f(d.x0!)
          close(
            value,
            derivative((y) => invert(f, y), y0, 1e-4),
            g.id,
          )
          return
        }
        case 'inverse-trig': {
          const k = d.k!
          const fs: Fn[] = [
            (x) => Math.atan(k * x),
            (x) => Math.asin(k * x),
            (x) => Math.atan(x * x),
          ]
          const f = fs[d.kind!]!
          for (const x of d.kind === 1 ? [-0.6 / k, 0.1, 0.7 / k] : [-1.5, 0.3, 1.8])
            close(evaluateTex(t, { x }) ?? NaN, derivative(f, x, 1e-6), `${g.id} at ${x}: ${t}`)
          return
        }
        case 'log-differentiation': {
          const f: Fn = d.sine ? (x) => x ** Math.sin(x) : (x) => x ** (d.k! * x)
          for (const x of [0.6, 1.3, 2.2])
            close(evaluateTex(t, { x }) ?? NaN, derivative(f, x, 1e-6), `${g.id} at ${x}: ${t}`)
          return
        }
        case 'ladder': {
          const { x0, y0, v } = d as Record<string, number>
          const L = Math.hypot(x0!, y0!)
          close(
            value,
            derivative((s) => Math.sqrt(L * L - (x0! + v! * s) ** 2), 0),
            g.id,
          )
          return
        }
        case 'cone': {
          const { R, H, h0, q } = d as Record<string, number>
          const volume = (h: number) => (Math.PI * R! * R! * h ** 3) / (3 * H! * H!)
          const V0 = volume(h0!)
          const level = (s: number) => invert(volume, V0 + q! * Math.PI * s)
          close(value, derivative(level, 0, 1e-4), g.id)
          return
        }
        case 'growing-circle-or-sphere': {
          const r0 = d.r0!
          if (d.sphere) {
            const volume = (r: number) => (4 / 3) * Math.PI * r ** 3
            const radius = (s: number) => invert(volume, volume(r0) + d.Q! * s)
            close(value, derivative(radius, 0, 1e-4), g.id)
          } else {
            close(
              value,
              derivative((s) => Math.PI * (r0 + d.v! * s) ** 2, 0),
              g.id,
            )
          }
          return
        }
        case 'angle-of-elevation': {
          const { d: dist, h0, v } = d as Record<string, number>
          close(
            value,
            derivative((s) => Math.atan((h0! + v! * s) / dist!), 0),
            g.id,
          )
          return
        }
        default:
          throw new Error(`no check for ${g.id}`)
      }
    })
  })
})
