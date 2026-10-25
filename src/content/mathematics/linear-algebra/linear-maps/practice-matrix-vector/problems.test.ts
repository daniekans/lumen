import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

/** The components stored as name0, name1, ... in the problem data. */
const read = (data: Data, name: string) => {
  const out: number[] = []
  for (let i = 0; `${name}${i}` in data; i++) out.push(data[`${name}${i}`]!)
  return out
}

/** The matrix stored as A0_0, A0_1, ... with its shape in m and n. */
const readMat = (data: Data) =>
  Array.from({ length: data.m! }, (_, i) =>
    Array.from({ length: data.n! }, (_, j) => data[`A${i}_${j}`]!),
  )

/** Row by row, written out here rather than with the library the generators use. */
const times = (a: number[][], x: number[]) =>
  a.map((row) => {
    let s = 0
    for (let j = 0; j < row.length; j++) s += row[j]! * x[j]!
    return s
  })

/** The 2x2 matrix that sends u to tu and v to tv: [tu tv] [u v]^-1. */
const fromImages = (u: number[], v: number[], tu: number[], tv: number[]) => {
  const d = u[0]! * v[1]! - u[1]! * v[0]!
  const inv = [
    [v[1]! / d, -v[0]! / d],
    [-u[1]! / d, u[0]! / d],
  ]
  return [0, 1].map((i) => [0, 1].map((j) => tu[i]! * inv[0]![j]! + tv[i]! * inv[1]![j]!))
}

/** The maps of the plane in `matrix-from-images`, applied to a point directly. */
const DESCRIBED_MAPS: ((p: [number, number]) => [number, number])[] = [
  ([x, y]) => [-y, x],
  ([x, y]) => [y, -x],
  ([x, y]) => [-x, -y],
  ([x, y]) => [x, -y],
  ([x, y]) => [-x, y],
  ([x, y]) => [y, x],
  ([x]) => [x, 0],
  ([, y]) => [0, y],
]

const NOT_LINEAR_MAPS: ((c: number, k: number, x: number, y: number) => number[])[] = [
  (c, k, x, y) => [c * x + y + k, y],
  (c, _k, x, y) => [c * x, y * y],
  (c, _k, x, y) => [x * y, c * y],
]

describe('linear maps and matrix times vector practice', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'product-2d':
        case 'product-shape':
        case 'image-from-basis':
        case 'nutrients':
        case 'store-totals': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          expect(a.values).toEqual(times(readMat(d), read(d, 'x')))
          break
        }
        case 'shape': {
          if (a.kind !== 'number') throw new Error('expected a number')
          expect(a.value).toBe(d.askInput ? d.n : d.m)
          break
        }
        case 'matrix-from-formula': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          // The matrix applied to e_j gives the formula's coefficients of variable j.
          const A = readMat(d)
          for (let j = 0; j < d.n!; j++) {
            const e = Array.from({ length: d.n! }, (_, k) => (k === j ? 1 : 0))
            expect(a.rows.map((r) => r[j])).toEqual(times(A, e))
          }
          break
        }
        case 'matrix-from-images': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          if (d.described! >= 0) {
            const f = DESCRIBED_MAPS[d.described!]!
            // Check on a few points, not only the basis.
            for (const pt of [
              [1, 0],
              [0, 1],
              [2, -3],
            ] as [number, number][])
              expect(times(a.rows as number[][], pt)).toEqual(f(pt).map((v) => v + 0))
          } else expect(a.rows).toEqual(readMat(d))
          break
        }
        case 'image-other-basis': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const M = fromImages(read(d, 'u'), read(d, 'v'), read(d, 'Tu'), read(d, 'Tv'))
          times(M, read(d, 'x')).forEach((v, i) => expect(v).toBeCloseTo(a.values[i]!, 9))
          break
        }
        case 'matrix-other-basis': {
          if (a.kind !== 'matrix') throw new Error('expected a matrix')
          const M = fromImages(read(d, 'u'), read(d, 'v'), read(d, 'Tu'), read(d, 'Tv'))
          M.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(a.rows[i]![j]!, 9)))
          // The answer sends u and v to their given images.
          expect(times(a.rows as number[][], read(d, 'u'))).toEqual(read(d, 'Tu'))
          expect(times(a.rows as number[][], read(d, 'v'))).toEqual(read(d, 'Tv'))
          break
        }
        case 'which-linear': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          expect(a.options).toHaveLength(4)
          // The right option is the one whose formula has no constant, power or product.
          expect(a.options[a.correct]).not.toMatch(/\^2|xy|[+-] \d+,/)
          break
        }
        case 'witness': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const f = NOT_LINEAR_MAPS[d.kind!]!
          const t1 = f(d.c!, d.k!, d.p!, d.q!)
          const t2 = f(d.c!, d.k!, 2 * d.p!, 2 * d.q!)
          expect(a.values).toEqual(t2.map((v, i) => v - 2 * t1[i]!))
          expect(a.values.some((v) => v !== 0)).toBe(true)
          break
        }
        case 'layer': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const b = read(d, 'b')
          expect(a.values).toEqual(times(readMat(d), read(d, 'x')).map((v, i) => v + b[i]!))
          break
        }
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
