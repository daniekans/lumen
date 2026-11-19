import { describe, expect, it } from 'vitest'
import { detCofactor, matMul, matPow, transpose } from '@/lib/math'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>
type V = [number, number, number]
type M = number[][]

const read3 = (d: Data, name: string): V => [d[`${name}0`]!, d[`${name}1`]!, d[`${name}2`]!]
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: readonly number[], b: readonly number[]) => a.reduce((s, v, i) => s + v * b[i]!, 0)
const dist = (a: V, b: V) => Math.hypot(...sub(a, b))
const cols = (...vs: V[]): M => [0, 1, 2].map((i) => vs.map((v) => v[i]!))

/**
 * The cross product by its definition, without its formula: component i is the volume
 * det[v w e_i], each by cofactor expansion.
 */
const crossByVolumes = (v: V, w: V): V =>
  [0, 1, 2].map((i) => detCofactor(cols(v, w, [0, 1, 2].map((k) => (k === i ? 1 : 0)) as V))) as V

/** A triangle's area from its side lengths (Heron), a route with no cross product. */
const heron = (p: V, q: V, r: V) => {
  const [a, b, c] = [dist(p, q), dist(q, r), dist(r, p)]
  const s = (a + b + c) / 2
  return Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
}

/** An n x n matrix with determinant d (seed varies the shape): L diag(d, 1, ...) U. */
const withDet = (n: number, d: number, seed: number): M => {
  const L = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : j < i ? ((i + seed * j) % 3) - 1 : 0)),
  )
  const D = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? (i === 0 ? d : 1) : 0)),
  )
  const U = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : j > i ? ((j + seed + i) % 4) - 1 : 0)),
  )
  return matMul(matMul(L, D), U)
}

/** Gauss-Jordan inverse with partial pivoting. */
const inverse = (a: M): M => {
  const n = a.length
  const m = a.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r
    ;[m[c], m[p]] = [m[p]!, m[c]!]
    const piv = m[c]![c]!
    m[c] = m[c]!.map((v) => v / piv)
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = m[r]![c]!
      m[r] = m[r]!.map((v, k) => v - f * m[c]![k]!)
    }
  }
  return m.map((row) => row.slice(n))
}

describe('volumes and cross products practice', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'cross': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const [v, w] = [read3(d, 'v'), read3(d, 'w')]
          const c = a.values as V
          // Perpendicular to both, length from Lagrange's identity, right-handed: one vector.
          expect(dot(c, v)).toBeCloseTo(0, 9)
          expect(dot(c, w)).toBeCloseTo(0, 9)
          expect(dot(c, c)).toBeCloseTo(dot(v, v) * dot(w, w) - dot(v, w) ** 2, 9)
          expect(detCofactor(cols(v, w, c))).toBeGreaterThan(0)
          break
        }
        case 'triangle-area': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const area = heron(read3(d, 'p'), read3(d, 'q'), read3(d, 'r'))
          expect(a.value).toBeCloseTo(area, 6)
          break
        }
        case 'box-volume': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [u, v, w] = [read3(d, 'u'), read3(d, 'v'), read3(d, 'w')]
          expect(a.value).toBeCloseTo(Math.abs(dot(u, crossByVolumes(v, w))), 9)
          expect(a.value).toBeGreaterThan(0)
          break
        }
        case 'tetrahedron': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [A, B, C, D] = ['a', 'b', 'c', 'd'].map((k) => read3(d, k)) as [V, V, V, V]
          // Edges from B instead of A, by cofactors.
          const vol = Math.abs(detCofactor(cols(sub(A, B), sub(C, B), sub(D, B)))) / 6
          expect(a.value).toBeCloseTo(vol, 9)
          expect(a.value).toBeGreaterThan(0)
          break
        }
        case 'coplanar-k': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [A, B, C, D] = ['a', 'b', 'c', 'd'].map((k) => read3(d, k)) as [V, V, V, V]
          expect(D[d.j!]).toBe(a.value)
          const flat = detCofactor(cols(sub(B, A), sub(C, A), sub(D, A)))
          expect(flat).toBeCloseTo(0, 9)
          // Unique: changing the hidden coordinate leaves the plane.
          const moved = [...D] as V
          moved[d.j!] = D[d.j!]! + 1
          expect(Math.abs(detCofactor(cols(sub(B, A), sub(C, A), sub(moved, A))))).toBeGreaterThan(
            0.5,
          )
          break
        }
        case 'plane-through-points': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const [P, Q, R] = ['p', 'q', 'r'].map((k) => read3(d, k)) as [V, V, V]
          const [x, y, z, rhs] = a.values as [number, number, number, number]
          const n: V = [x, y, z]
          for (const pt of [P, Q, R]) expect(dot(n, pt)).toBeCloseTo(rhs, 9)
          expect(dot(n, n)).toBeGreaterThan(0)
          expect(a.values.every(Number.isInteger)).toBe(true)
          expect(n[d.j!]).toBeGreaterThan(0)
          break
        }
        case 'torque': {
          if (d.variant === 0) {
            if (a.kind !== 'number') throw new Error('expected a number')
            const t = (d.deg! * Math.PI) / 180
            const tau = crossByVolumes([d.L!, 0, 0], [d.F! * Math.cos(t), d.F! * Math.sin(t), 0])
            expect(a.value).toBeCloseTo(Math.hypot(...tau), 9)
          } else {
            if (a.kind !== 'vector') throw new Error('expected a vector')
            const tau = crossByVolumes(read3(d, 'r'), read3(d, 'F'))
            a.values.forEach((v, i) => expect(v).toBeCloseTo(tau[i]!, 9))
          }
          break
        }
        case 'product-rules': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const A = withDet(d.n!, d.a!, 1)
          const B = withDet(d.n!, d.b!, 2)
          expect(detCofactor(A)).toBeCloseTo(d.a!, 9)
          expect(detCofactor(B)).toBeCloseTo(d.b!, 9)
          const built = [
            () => matMul(A, B),
            () => matPow(A, d.k!),
            () => A.map((row) => row.map((v) => d.c! * v)),
            () => matMul(transpose(A), B),
            () => inverse(A),
            () => matMul(matMul(inverse(A), B), A),
          ][d.rule!]!()
          expect(a.value).toBeCloseTo(detCofactor(built), 6)
          break
        }
        case 'basis-products': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const e = (k: number) => [0, 1, 2].map((i) => (i === k ? 1 : 0)) as V
          const [x, y, z] = [e(d.a!), e(d.b!), e(d.c!)]
          const expected = d.leftFirst
            ? crossByVolumes(crossByVolumes(x, y), z)
            : crossByVolumes(x, crossByVolumes(y, z))
          a.values.forEach((v, i) => expect(v).toBeCloseTo(expected[i]!, 9))
          break
        }
        case 'handedness': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const det = detCofactor(cols(read3(d, 'u'), read3(d, 'v'), read3(d, 'w')))
          expect(a.correct).toBe(det > 0 ? 0 : 1)
          break
        }
        case 'proof-short':
          expect(a.kind).toBe('self')
          break
        default:
          throw new Error(`no check for ${g.id}`)
      }
    })
  })
})
