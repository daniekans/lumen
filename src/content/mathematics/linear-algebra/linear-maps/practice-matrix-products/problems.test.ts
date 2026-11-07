import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>
type M = number[][]

/** The matrix stored as name0_0, name0_1, ... with its shape in namem and namen. */
const readMat = (d: Data, name: string): M =>
  Array.from({ length: d[`${name}m`]! }, (_, i) =>
    Array.from({ length: d[`${name}n`]! }, (_, j) => d[`${name}${i}_${j}`]!),
  )

/** The product by the sum formula, written out here rather than with the library. */
const times = (a: M, b: M): M =>
  a.map((row) =>
    b[0]!.map((_, j) => {
      let s = 0
      for (let k = 0; k < row.length; k++) s += row[k]! * b[k]![j]!
      return s
    }),
  )

/** A matrix applied to a point. */
const apply = (a: readonly (readonly number[])[], x: readonly number[]) =>
  a.map((row) => row.reduce((s, v, k) => s + v * x[k]!, 0))

const near = (a: readonly (readonly number[])[], b: readonly (readonly number[])[]) => {
  expect(a.length).toBe(b.length)
  a.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(b[i]![j]!, 9)))
}

/** The described maps of `compose-described`, applied to a point directly. */
const MAPS: ((p: number[]) => number[])[] = [
  ([x, y]) => [-y!, x!],
  ([x, y]) => [y!, -x!],
  ([x, y]) => [-x!, -y!],
  ([x, y]) => [x!, -y!],
  ([x, y]) => [-x!, y!],
  ([x, y]) => [y!, x!],
  ([x]) => [x!, 0],
  ([x, y]) => [2 * x!, y!],
  ([x, y]) => [x! + y!, y!],
]

const POINTS = [
  [1, 0],
  [0, 1],
  [2, -3],
  [-1, 4],
]

describe('matrix products practice', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'product-2d':
        case 'product-rect': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const A = readMat(d, 'A')
          const B = readMat(d, 'B')
          expect(a.rows).toEqual(times(A, B))
          // The columns are A times the columns of B.
          B[0]!.forEach((_, j) =>
            expect(a.rows.map((r) => r[j])).toEqual(
              apply(
                A,
                B.map((r) => r[j]!),
              ),
            ),
          )
          break
        }
        case 'product-entry': {
          if (a.kind !== 'number') throw new Error('expected a number')
          expect(a.value).toBe(times(readMat(d, 'A'), readMat(d, 'B'))[d.i!]![d.j!])
          break
        }
        case 'shape': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          expect(new Set(a.options).size).toBe(a.options.length)
          const defined = d.n === d.q
          expect(a.options[a.correct]).toBe(
            defined ? `$${d.m} \\times ${d.p}$` : '$AB$ is not defined',
          )
          break
        }
        case 'rotation-power': {
          const t = (d.deg! * Math.PI) / 180
          if (d.variant === 0) {
            if (a.kind !== 'number') throw new Error('expected a number')
            // The first k with k * deg a multiple of 360, by search.
            let k = 1
            while ((k * d.deg!) % 360 !== 0) k++
            expect(a.value).toBe(k)
          } else if (d.variant === 1) {
            if (a.kind !== 'number') throw new Error('expected a number')
            // Rotate i-hat k times and read its angle.
            let v = [1, 0]
            for (let s = 0; s < d.k!; s++)
              v = [
                Math.cos(t) * v[0]! - Math.sin(t) * v[1]!,
                Math.sin(t) * v[0]! + Math.cos(t) * v[1]!,
              ]
            const angle = ((Math.atan2(v[1]!, v[0]!) * 180) / Math.PI + 360) % 360
            expect(Math.abs(angle - a.value) < 1e-6 || Math.abs(angle - a.value - 360) < 1e-6).toBe(
              true,
            )
            expect(a.value).toBeGreaterThanOrEqual(0)
            expect(a.value).toBeLessThan(360)
          } else {
            if (a.kind !== 'matrix') throw new Error('expected a matrix')
            let r: M = [
              [1, 0],
              [0, 1],
            ]
            for (let s = 0; s < d.k!; s++) r = times(readMat(d, 'R'), r)
            near(a.rows, r)
          }
          break
        }
        case 'compose-described': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const f = MAPS[d.f!]!
          const gm = MAPS[d.g!]!
          for (const pt of POINTS) expect(apply(a.rows, pt)).toEqual(gm(f(pt)).map((v) => v + 0))
          break
        }
        case 'standard-map': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const R = a.rows
          if (d.kind === 0) {
            // A rotation: i-hat lands at angle deg on the unit circle, and lengths and angles stay.
            const t = (d.deg! * Math.PI) / 180
            expect(R[0]![0]!).toBeCloseTo(Math.cos(t), 12)
            expect(R[1]![0]!).toBeCloseTo(Math.sin(t), 12)
            const j = apply(R, [0, 1])
            expect(Math.hypot(j[0]!, j[1]!)).toBeCloseTo(1, 12)
            expect(R[0]![0]! * j[0]! + R[1]![0]! * j[1]!).toBeCloseTo(0, 12)
            expect(R[0]![0]! * j[1]! - R[1]![0]! * j[0]!).toBeCloseTo(1, 12)
          } else if (d.kind === 1 || d.kind === 2) {
            const u = [d.a!, d.b!]
            for (const pt of POINTS) {
              const y = apply(R, pt)
              if (d.kind === 1) {
                // Px lies on the line, and x - Px is perpendicular to it.
                expect(y[0]! * u[1]! - y[1]! * u[0]!).toBeCloseTo(0, 12)
                expect((pt[0]! - y[0]!) * u[0]! + (pt[1]! - y[1]!) * u[1]!).toBeCloseTo(0, 12)
              } else {
                // The midpoint of x and Fx is on the line, and Fx - x is perpendicular to it.
                const mid = [(pt[0]! + y[0]!) / 2, (pt[1]! + y[1]!) / 2]
                expect(mid[0]! * u[1]! - mid[1]! * u[0]!).toBeCloseTo(0, 12)
                expect((y[0]! - pt[0]!) * u[0]! + (y[1]! - pt[1]!) * u[1]!).toBeCloseTo(0, 12)
              }
            }
          } else if (d.kind === 3) {
            const k = d.a!
            const moved = d.b ? apply(R, [1, 0]) : apply(R, [0, 1])
            const kept = d.b ? apply(R, [0, 1]) : apply(R, [1, 0])
            expect(moved).toEqual(d.b ? [1, k] : [k, 1])
            expect(kept).toEqual(d.b ? [0, 1] : [1, 0])
          } else {
            for (const pt of POINTS)
              expect(apply(R, pt)).toEqual([d.a! * pt[0]!, d.b! * pt[1]!].map((v) => v + 0))
          }
          break
        }
        case 'transpose': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const A = readMat(d, 'A')
          A.forEach((row, i) => row.forEach((v, j) => expect(a.rows[j]![i]).toBe(v)))
          expect(a.rows.length).toBe(A[0]!.length)
          break
        }
        case 'transpose-product': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const AB = times(readMat(d, 'A'), readMat(d, 'B'))
          AB.forEach((row, i) => row.forEach((v, j) => expect(a.rows[j]![i]).toBe(v)))
          break
        }
        case 'join-totals': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          // Join the sparse rows on the product and sum per (store, measure).
          const Q = readMat(d, 'Q')
          const P = readMat(d, 'P')
          const sales = Q.flatMap((row, s) => row.flatMap((v, k) => (v ? [{ s, k, v }] : [])))
          const totals = [
            [0, 0],
            [0, 0],
          ]
          for (const { s, k, v } of sales) P[k]!.forEach((val, j) => (totals[s]![j]! += v * val))
          near(a.rows, totals)
          expect(sales.length).toBeLessThan(6)
          break
        }
        case 'two-layers': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const W2 = readMat(d, 'W')
          const W1 = readMat(d, 'V')
          for (const pt of POINTS) expect(apply(a.rows, pt)).toEqual(apply(W2, apply(W1, pt)))
          break
        }
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
