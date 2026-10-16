import { describe, expect, it } from 'vitest'
import { decodeColumn } from '@/lib/relational'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

/** Distinct values among rows built from several decoded columns. */
const distinctRows = (cols: readonly (readonly (number | null)[])[]) =>
  new Set(cols[0]!.map((_, r) => cols.map((c) => c[r]).join(','))).size

const unique = (cols: readonly (readonly (number | null)[])[]) =>
  distinctRows(cols) === cols[0]!.length

/** X -> Y holds when no X value maps to two different Y values. */
const holds = (x: readonly (number | null)[], y: readonly (number | null)[]) => {
  const seen = new Map<number | null, number | null>()
  return x.every((v, i) => {
    if (seen.has(v) && seen.get(v) !== y[i]) return false
    seen.set(v, y[i]!)
    return true
  })
}

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)

describe('relations and keys problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'product-size':
          expect(value(a)).toBe(decodeColumn(d, 's').reduce((x, y) => x! * y!, 1))
          break
        case 'relation-count': {
          let subsets = 1
          for (let i = 0; i < d.m! * d.n!; i++) subsets *= 2
          expect(value(a)).toBe(subsets)
          break
        }
        case 'distinct-tuples':
          expect(value(a)).toBe(distinctRows([decodeColumn(d, 'n'), decodeColumn(d, 'c')]))
          expect(decodeColumn(d, 'n').length).toBeGreaterThan(value(a))
          break
        case 'key-column': {
          const keys = [0, 1, 2, 3].filter((j) => unique([decodeColumn(d, `k${j}`)]))
          expect(keys).toEqual([d.key])
          expect(a).toMatchObject({ correct: d.key })
          break
        }
        case 'composite-key': {
          const c = [0, 1, 2].map((j) => decodeColumn(d, `c${j}`))
          expect(unique(c)).toBe(true)
          expect(c.some((col) => unique([col]))).toBe(false)
          const pairs = [
            [0, 1],
            [0, 2],
            [1, 2],
          ].map(([x, y]) => unique([c[x!]!, c[y!]!]))
          const expected = pairs.filter(Boolean).length === 1 ? pairs.indexOf(true) : 3
          expect(pairs.filter(Boolean).length).toBeLessThanOrEqual(1)
          expect(a).toMatchObject({ correct: expected })
          break
        }
        case 'dependency': {
          const c = [0, 1, 2].map((j) => decodeColumn(d, `c${j}`))
          const found = [0, 1, 2].flatMap((x) =>
            [0, 1, 2].filter((y) => y !== x && holds(c[x]!, c[y]!)).map((y) => [x, y]),
          )
          expect(found).toEqual([[d.a, d.b]])
          const names = ['sku', 'category', 'supplier']
          const option = a.kind === 'choice' ? a.options[a.correct]! : ''
          expect(option.indexOf(names[d.a!]!)).toBeLessThan(option.indexOf(names[d.b!]!))
          break
        }
        case 'orphans': {
          const ids = new Set(decodeColumn(d, 'id'))
          const bad = decodeColumn(d, 'ref').flatMap((r, i) =>
            r !== null && !ids.has(r) ? [101 + i] : [],
          )
          expect(bad.length).toBeGreaterThan(0)
          expect(a.kind === 'list' ? [...a.values].sort() : []).toEqual(bad.sort())
          break
        }
        case 'on-delete': {
          const refs = decodeColumn(d, 'ref')
          const after = refs.map((r) => (r === d.target ? 'gone' : r))
          const expected = d.cascade
            ? 1 + after.filter((r) => r === 'gone').length
            : after.filter((r) => r === 'gone' || r === null).length
          expect(value(a)).toBe(expected)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
