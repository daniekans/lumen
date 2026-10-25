import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const close = (a: number, b: number) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(1e-9 * Math.max(1, Math.abs(b)))

/** The components stored as name0, name1, ... in the problem data. */
const read = (data: Readonly<Record<string, number>>, name: string) => {
  const out: number[] = []
  for (let i = 0; `${name}${i}` in data; i++) out.push(data[`${name}${i}`]!)
  return out
}

const dot = (a: readonly number[], b: readonly number[]) => a.reduce((s, x, i) => s + x * b[i]!, 0)

/**
 * Rank of a list of vectors by Gaussian elimination with exact rational steps on integers
 * (fraction-free), independent of the cross products the generators use.
 */
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

describe('dot product and span practice problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'dot': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const v = read(d, 'v')
          const w = read(d, 'w')
          expect(a.value).toBe(v.reduce((s, x, i) => s + x * w[i]!, 0))
          break
        }
        case 'angle': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const v = read(d, 'v')
          const w = read(d, 'w')
          const cos = dot(v, w) / Math.sqrt(dot(v, v) * dot(w, w))
          const deg = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI
          expect(Math.abs(deg - a.value)).toBeLessThan(1e-6)
          break
        }
        case 'orthogonal-k': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const v = read(d, 'v')
          const w = read(d, 'w')
          v[d.at!] = a.value
          expect(dot(v, w)).toBe(0)
          // k is the only solution: the coefficient of k is nonzero.
          expect(w[d.at!]).not.toBe(0)
          break
        }
        case 'projection': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          const w = read(d, 'w')
          // The projection is parallel to v, and what is left of w is orthogonal to v.
          const rest = w.map((x, i) => x - a.values[i]!)
          close(dot(rest, v), 0)
          const k = dot(a.values, v) / dot(v, v)
          a.values.forEach((x, i) => close(x, k * v[i]!))
          break
        }
        case 'span-weights': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          const w = read(d, 'w')
          const u = read(d, 'u')
          // Not parallel, so the weights are unique.
          expect(rank([v, w])).toBe(2)
          const [x, y] = a.values as [number, number]
          expect(v.map((c, i) => x * c + y * w[i]!)).toEqual(u)
          break
        }
        case 'dependence': {
          const v = read(d, 'v')
          const w = read(d, 'w')
          if (d.size === 2) {
            if (a.kind !== 'number') throw new Error('expected a number')
            const set = (k: number) => w.map((c, i) => (i === d.at ? k : c))
            expect(rank([v, set(a.value)])).toBe(1)
            // Unique: another component of v is nonzero, so it fixes the multiple.
            expect(v.some((c, i) => i !== d.at && c !== 0)).toBe(true)
            break
          }
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const u = read(d, 'u')
          expect(rank([v, w])).toBe(2)
          const [x, y] = a.values as [number, number]
          expect(v.map((c, i) => x * c + y * w[i]! + u[i]!)).toEqual([0, 0, 0])
          break
        }
        case 'plane-equation': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const n = read(d, 'n')
          const pp = read(d, 'p')
          expect(a.value).toBe(n[0]! * pp[0]! + n[1]! * pp[1]! + n[2]! * pp[2]!)
          break
        }
        case 'line-meets-plane': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const n = read(d, 'n')
          const v = read(d, 'v')
          const pp = read(d, 'p')
          // On the plane, and on the line: q - p is a multiple of v.
          expect(dot(n, a.values)).toBe(d.d)
          expect(rank([v, a.values.map((x, i) => x - pp[i]!)])).toBeLessThanOrEqual(1)
          // The line is not parallel to the plane, so the point is unique.
          expect(dot(n, v)).not.toBe(0)
          break
        }
        case 'plane-normal': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          const w = read(d, 'w')
          const pp = read(d, 'p')
          const n = a.values.slice(0, 3)
          // Orthogonal to two independent directions: the normal line, and n[j] = 1 picks one.
          expect(rank([v, w])).toBe(2)
          expect(dot(n, v)).toBe(0)
          expect(dot(n, w)).toBe(0)
          expect(n[d.j!]).toBe(1)
          expect(a.values[3]).toBe(dot(n, pp))
          break
        }
        case 'normal-to-parametric': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const n = read(d, 'n')
          const set = (x: number[]) => x.map((c, i) => (i === d.at ? a.value : c))
          const v = read(d, 'v')
          const w = d.inPoint ? read(d, 'w') : set(read(d, 'w'))
          const pp = d.inPoint ? set(read(d, 'p')) : read(d, 'p')
          // The parametric form describes the plane: point on it, two independent directions in it.
          expect(dot(n, pp)).toBe(d.d)
          expect(dot(n, v)).toBe(0)
          expect(dot(n, w)).toBe(0)
          expect(rank([v, w])).toBe(2)
          // Unique: the unknown has a nonzero coefficient.
          expect(n[d.at!]).not.toBe(0)
          break
        }
        case 'feature-vectors': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const x = read(d, 'x')
          const y = read(d, 'y')
          expect(x.length).toBeGreaterThanOrEqual(4)
          const expected = d.cosine
            ? dot(x, y) / Math.sqrt(dot(x, x) * dot(y, y))
            : Math.hypot(...x.map((c, i) => c - y[i]!))
          close(a.value, expected)
          break
        }
        case 'proof-short': {
          expect(a.kind).toBe('self')
          break
        }
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
