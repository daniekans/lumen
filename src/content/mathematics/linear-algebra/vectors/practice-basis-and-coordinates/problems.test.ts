import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

/** The components stored as name0, name1, ... in the problem data. */
const read = (data: Readonly<Record<string, number>>, name: string) => {
  const out: number[] = []
  for (let i = 0; `${name}${i}` in data; i++) out.push(data[`${name}${i}`]!)
  return out
}

const basisOf = (data: Readonly<Record<string, number>>, count: number) =>
  Array.from({ length: count }, (_, k) => read(data, `b${k}`))

/** Rank by fraction-free Gaussian elimination on whole numbers. */
const rank = (rows: readonly (readonly number[])[]) => {
  const m = rows.map((r) => [...r])
  let r = 0
  for (let c = 0; c < (m[0]?.length ?? 0) && r < m.length; c++) {
    const pivot = m.findIndex((row, i) => i >= r && row[c] !== 0)
    if (pivot < 0) continue
    ;[m[r], m[pivot]] = [m[pivot]!, m[r]!]
    for (let i = r + 1; i < m.length; i++) {
      const f = m[i]![c]!
      const g = m[r]![c]!
      m[i] = m[i]!.map((x, j) => x * g - m[r]![j]! * f)
    }
    r++
  }
  return r
}

/** c1 b1 + ... + cn bn. */
const combine = (basis: readonly (readonly number[])[], c: readonly number[]) =>
  basis[0]!.map((_, i) => basis.reduce((s, b, k) => s + c[k]! * b[i]!, 0))

describe('basis and coordinates practice problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'from-coords': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const basis = basisOf(d, d.n!)
          expect(rank(basis)).toBe(d.n)
          expect(a.values).toEqual(combine(basis, read(d, 'c')))
          break
        }
        case 'coords-2d':
        case 'coords-3d': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const basis = basisOf(d, d.n!)
          // A basis, so the weights that rebuild x are the only ones.
          expect(rank(basis)).toBe(d.n)
          expect(combine(basis, a.values)).toEqual(read(d, 'x'))
          expect(a.values.every(Number.isInteger)).toBe(true)
          break
        }
        case 'is-basis': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const vs = basisOf(d, d.count!)
          vs.forEach((v) => expect(v).toHaveLength(d.dim!))
          const isBasis = vs.length === d.dim && rank(vs) === d.dim
          expect(a.correct).toBe(isBasis ? 0 : 1)
          break
        }
        case 'not-a-basis-k': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const v = [d.v0!, d.v1!]
          expect(rank([v, [a.value, d.second!]])).toBe(1)
          // Unique: any other k gives a basis.
          expect(rank([v, [a.value + 1, d.second!]])).toBe(2)
          break
        }
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
