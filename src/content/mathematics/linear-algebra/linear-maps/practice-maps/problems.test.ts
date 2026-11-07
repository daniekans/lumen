import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { DESCRIBED, IMAGE_OPTIONS, KERNEL_OPTIONS, problems } from './problems'

type Data = Readonly<Record<string, number>>
type V = number[]
type M = number[][]

const readMat = (d: Data, name: string): M =>
  Array.from({ length: d[`${name}m`]! }, (_, i) =>
    Array.from({ length: d[`${name}n`]! }, (_, j) => d[`${name}${i}_${j}`]!),
  )
const readVec = (d: Data, name: string, n: number): V =>
  Array.from({ length: n }, (_, i) => d[`${name}${i}`]!)

const apply = (a: readonly (readonly number[])[], x: readonly number[]) =>
  a.map((row) => row.reduce((s, v, k) => s + v * x[k]!, 0))

const cross = (a: V, b: V): V => [
  a[1]! * b[2]! - a[2]! * b[1]!,
  a[2]! * b[0]! - a[0]! * b[2]!,
  a[0]! * b[1]! - a[1]! * b[0]!,
]
const dot = (a: V, b: V) => a.reduce((s, v, i) => s + v * b[i]!, 0)
const det3 = (a: V, b: V, c: V) => dot(a, cross(b, c))

/** Rank from minors, for up to three vectors of space (or of the plane, padded with 0). */
const rankOf = (vs: readonly V[]): number => {
  const p = vs.map((v) => [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0])
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++)
      for (let k = j + 1; k < p.length; k++)
        if (Math.abs(det3(p[i]!, p[j]!, p[k]!)) > 1e-9) return 3
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++)
      if (cross(p[i]!, p[j]!).some((v) => Math.abs(v) > 1e-9)) return 2
  return p.some((v) => v.some((x) => Math.abs(x) > 1e-9)) ? 1 : 0
}
const columns = (a: M): V[] => a[0]!.map((_, j) => a.map((r) => r[j]!))

/** A basis of each described set. */
const SETS: Record<string, V[]> = {
  'only $\\mathbf{0}$': [],
  'the $z$-axis': [[0, 0, 1]],
  'the $xy$-plane': [
    [1, 0, 0],
    [0, 1, 0],
  ],
  'the plane $x + y + z = 0$': [
    [1, -1, 0],
    [0, 1, -1],
  ],
  'the line along $(1, 1, 1)$': [[1, 1, 1]],
  'all of space': [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
}

/** Rodrigues' formula for a turn about a unit axis k. */
const rodrigues = (k: V, deg: number, v: V): V => {
  const t = (deg * Math.PI) / 180
  const kv = cross(k, v)
  const kd = dot(k, v)
  return v.map((x, i) => x * Math.cos(t) + kv[i]! * Math.sin(t) + k[i]! * kd * (1 - Math.cos(t)))
}
const UNIT: V[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

describe('maps practice', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'rotation-3d': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const k = UNIT[d.axis!]!
          for (const v of [...UNIT, [1, 2, 3]])
            apply(a.rows, v).forEach((x, i) =>
              expect(x).toBeCloseTo(rodrigues(k, d.deg!, v)[i]!, 9),
            )
          break
        }
        case 'rotate-vector-3d': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const out = rodrigues(UNIT[d.axis!]!, d.deg!, readVec(d, 'v', 3))
          a.values.forEach((x, i) => expect(x).toBeCloseTo(out[i]!, 9))
          break
        }
        case 'nonsquare': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const pts = [
            [1, 2, 3],
            [-4, 0, 5],
          ]
          if (d.variant === 0) {
            for (const q of pts) expect(apply(a.rows, q)).toEqual([q[d.i!], q[d.j!]])
          } else if (d.variant === 1) {
            expect(apply(a.rows, [1, 0])).toEqual(readVec(d, 'a', 3))
            expect(apply(a.rows, [0, 1])).toEqual(readVec(d, 'b', 3))
          } else {
            for (const q of pts)
              expect(apply(a.rows, q)).toEqual(q.map((v, i) => (i === d.k ? 0 : v)))
          }
          break
        }
        case 'map-shape': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          expect(a.options[a.correct]).toBe(`$\\mathbb{R}^{${d.n}} \\to \\mathbb{R}^{${d.m}}$`)
          break
        }
        case 'kernel-vector': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const A = readMat(d, 'A')
          expect(apply(A, a.values).every((v) => v === 0)).toBe(true)
          expect(a.values[a.values.length - 1]).toBe(1)
          // The kernel is a single line, so the answer is the only one with last component 1.
          expect(rankOf(columns(A))).toBe(A.length - 1)
          break
        }
        case 'rank': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const A = readMat(d, 'A')
          expect(a.value).toBe(rankOf(columns(A)))
          expect(a.value).toBe(d.r)
          break
        }
        case 'reachable': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const [c1, c2] = columns(readMat(d, 'A'))
          expect(rankOf([c1!, c2!])).toBe(2)
          const inPlane = det3(c1!, c2!, readVec(d, 'b', 3)) === 0
          expect(a.options[a.correct]).toBe(inPlane ? 'Yes' : 'No')
          break
        }
        case 'kernel-or-image': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const map = DESCRIBED[d.i!]!
          const rk = rankOf(columns(map.m))
          const answer = a.options[a.correct]!
          const basis = SETS[answer]!
          if (d.askKernel) {
            expect(KERNEL_OPTIONS).toContain(answer)
            for (const v of basis) expect(apply(map.m, v).every((x) => x === 0)).toBe(true)
            expect(basis.length).toBe(3 - rk)
          } else {
            expect(IMAGE_OPTIONS).toContain(answer)
            expect(basis.length).toBe(rk)
            for (const c of columns(map.m)) expect(rankOf([...basis, c])).toBe(rk)
          }
          break
        }
        case 'same-predictions': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const X = readMat(d, 'X')
          const w = readVec(d, 'w', 3)
          expect(apply(X, [...a.values, d.s!])).toEqual(apply(X, w))
          expect(rankOf(columns(X))).toBe(2)
          break
        }
        case 'proof-kernel-image':
          expect(a.kind).toBe('self')
          break
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
