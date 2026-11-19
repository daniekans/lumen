import { describe, expect, it } from 'vitest'
import { detCofactor, detN, matMul, transpose } from '@/lib/math'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>
type M = number[][]

const readMat = (d: Data, name: string): M =>
  Array.from({ length: d[`${name}n`]! }, (_, i) =>
    Array.from({ length: d[`${name}n`]! }, (_, j) => d[`${name}${i}_${j}`]!),
  )

const readPoints = (d: Data, m: number) =>
  Array.from({ length: m }, (_, k) => [d[`x${k}`]!, d[`y${k}`]!] as const)

/** Area of a triangle from its side lengths (Heron), a route that uses no determinant. */
const heron = (p: readonly number[], q: readonly number[], r: readonly number[]) => {
  const dist = (a: readonly number[], b: readonly number[]) =>
    Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!)
  const [a, b, c] = [dist(p, q), dist(q, r), dist(r, p)]
  const s = (a + b + c) / 2
  return Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
}

/** Three points on one line: the longest distance is the sum of the other two. */
const onOneLine = (p: readonly number[], q: readonly number[], r: readonly number[]) => {
  const dist = (a: readonly number[], b: readonly number[]) =>
    Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!)
  const [a, b, c] = [dist(p, q), dist(q, r), dist(r, p)].sort((x, y) => x - y)
  return Math.abs(c! - a! - b!) < 1e-9
}

/** A matrix with determinant d: diag(d, 1, ..., 1) between two triangular matrices. */
const withDet = (n: number, d: number): M => {
  const L = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : j < i ? i - 2 * j : 0)),
  )
  const D = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? (i === 0 ? d : 1) : 0)),
  )
  const U = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : j > i ? j - i + 1 : 0)),
  )
  return matMul(matMul(L, D), U)
}

/** Applies the stored operation k to a matrix, by building the result directly. */
const applyOp = (a: M, d: Data, k: number): M => {
  const code = d[`op${k}`]!
  const i = d[`op${k}i`]!
  const j = d[`op${k}j`]!
  const c = d[`op${k}c`]!
  const b = a.map((row) => [...row])
  switch (code) {
    case 0:
      ;[b[i], b[j]] = [b[j]!, b[i]!]
      return b
    case 1:
      b[i] = b[i]!.map((v) => c * v)
      return b
    case 2:
      b[i] = b[i]!.map((v, col) => v + c * a[j]![col]!)
      return b
    case 3:
      return b.map((row) => row.map((v) => c * v))
    default:
      return transpose(a)
  }
}

describe('determinants practice', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'det-2x2':
        case 'det-3x3':
        case 'triangular':
        case 'det-4x4': {
          if (a.kind !== 'number') throw new Error('expected a number')
          expect(a.value).toBeCloseTo(detCofactor(readMat(d, 'A')), 9)
          break
        }
        case 'row-operations': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const A = withDet(d.n!, d.d!)
          expect(detN(A)).toBe(d.d)
          const B = applyOp(applyOp(A, d, 0), d, 1)
          expect(a.value).toBeCloseTo(detCofactor(B), 9)
          break
        }
        case 'singular-k': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const A = readMat(d, 'A')
          expect(A[d.i!]![d.j!]).toBe(a.value)
          expect(detCofactor(A)).toBeCloseTo(0, 9)
          break
        }
        case 'collinear': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [P, Q, R] = readPoints(d, 3)
          expect(R![1]).toBe(a.value)
          expect(onOneLine(P!, Q!, R!)).toBe(true)
          expect(P![0] === Q![0] && P![1] === Q![1]).toBe(false)
          break
        }
        case 'orientation': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const [P, Q, R] = readPoints(d, 3)
          // The turn from PQ to QR, by angles rather than a determinant.
          const ang =
            Math.atan2(R![1] - Q![1], R![0] - Q![0]) - Math.atan2(Q![1] - P![1], Q![0] - P![0])
          const turn = Math.atan2(Math.sin(ang), Math.cos(ang))
          const degenerate =
            onOneLine(P!, Q!, R!) ||
            (P![0] === Q![0] && P![1] === Q![1]) ||
            (Q![0] === R![0] && Q![1] === R![1])
          const expected = degenerate ? 2 : turn > 0 ? 0 : 1
          expect(a.correct).toBe(expected)
          break
        }
        case 'polygon-area': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const ps = readPoints(d, d.m!)
          const cx = ps.reduce((s, q) => s + q[0], 0) / ps.length
          const cy = ps.reduce((s, q) => s + q[1], 0) / ps.length
          // Split into triangles from the mean point, each by Heron's formula.
          const area = ps.reduce((s, q, k) => s + heron([cx, cy], q, ps[(k + 1) % ps.length]!), 0)
          expect(a.value).toBeCloseTo(area * 100, 6)
          break
        }
        case 'image-area': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const A = readMat(d, 'A')
          const corners =
            d.shape === 0
              ? [
                  [0, 0],
                  [d.w!, 0],
                  [d.w!, d.h!],
                  [0, d.h!],
                ]
              : [
                  [0, 0],
                  [d.w!, 0],
                  [0, d.h!],
                ]
          const img = corners.map(([x, y]) => [
            A[0]![0]! * x! + A[0]![1]! * y!,
            A[1]![0]! * x! + A[1]![1]! * y!,
          ])
          const area =
            heron(img[0]!, img[1]!, img[2]!) +
            (img.length === 4 ? heron(img[0]!, img[2]!, img[3]!) : 0)
          expect(a.value).toBeCloseTo(area, 6)
          break
        }
        default:
          throw new Error(`no check for ${g.id}`)
      }
    })
  })
})
