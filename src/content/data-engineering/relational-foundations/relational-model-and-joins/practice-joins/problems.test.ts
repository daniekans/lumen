import { describe, expect, it } from 'vitest'
import { decodeColumn, join, joinOn, type JoinKind } from '@/lib/relational'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)

/** Materializes the join from the decoded key columns and counts its rows. */
const rows = (d: Data, kind: JoinKind) =>
  joinOn(
    decodeColumn(d, 'l').map((k) => ({ k })),
    decodeColumn(d, 'r').map((k) => ({ k })),
    kind,
    'k',
    'k',
  ).length

describe('join problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'cross-count':
          expect(value(a)).toBe(join(new Array(d.m), new Array(d.n), 'cross').length)
          break
        case 'inner-count':
        case 'fan-out':
          expect(value(a)).toBe(rows(d, 'inner'))
          break
        case 'left-count':
          expect(value(a)).toBe(rows(d, 'left'))
          expect(value(a)).toBeGreaterThan(rows(d, 'inner'))
          break
        case 'outer-count':
          expect(value(a)).toBe(rows(d, d.full ? 'full' : 'right'))
          expect(value(a)).toBeGreaterThan(rows(d, 'inner'))
          break
        case 'anti-list': {
          const ids = decodeColumn(d, 'l')
          const pairs = joinOn(
            ids.map((k) => ({ k })),
            decodeColumn(d, 'r').map((k) => ({ k })),
            'left',
            'k',
            'k',
          )
          const expected = pairs.filter((x) => x.right === null).map((x) => ids[x.left!])
          expect(expected.length).toBeGreaterThan(0)
          expect(a.kind === 'list' ? [...a.values].sort() : []).toEqual(expected.sort())
          break
        }
        case 'on-versus-where': {
          const customers = [1, 2, 3, 4].map((id) => ({ id }))
          const refs = decodeColumn(d, 'r')
          const orders = refs.map((r, i) => ({ r, paid: decodeColumn(d, 'p')[i] === 1 }))
          const count = d.inOn
            ? join(customers, orders, 'left', (c, o) => c.id === o.r && o.paid).length
            : join(customers, orders, 'left', (c, o) => c.id === o.r).filter(
                (x) => x.right !== null && orders[x.right]!.paid,
              ).length
          expect(value(a)).toBe(count)
          break
        }
        case 'count-bounds': {
          // Check each claim on random instances that satisfy the stated constraints.
          const [t, m, n] = [d.t!, d.m!, d.n!]
          const option = a.kind === 'choice' ? a.options[a.correct]! : ''
          for (let s = 0; s < 20; s++) {
            const ids = Array.from({ length: m }, (_, i) => ({ k: i + 1 }))
            const refs = Array.from({ length: n }, (_, i) => ({ k: ((i * 7 + s) % m) + 1 }))
            if (t === 0) {
              expect(joinOn(refs, ids, 'inner', 'k', 'k')).toHaveLength(n)
              expect(option).toContain(String(n))
            } else if (t === 1) {
              const sparse = refs.map((r) => ({ k: r.k % 3 === 0 ? r.k : r.k + m }))
              expect(joinOn(ids, sparse, 'left', 'k', 'k').length).toBeGreaterThanOrEqual(m)
              expect(option).toContain(String(m))
            } else {
              const same = (len: number) => Array.from({ length: len }, () => ({ k: 1 }))
              const random = (len: number) =>
                Array.from({ length: len }, (_, i) => ({ k: ((i + s) % 4) + 1 }))
              expect(joinOn(same(m), same(n), 'inner', 'k', 'k')).toHaveLength(m * n)
              expect(joinOn(random(m), random(n), 'inner', 'k', 'k').length).toBeLessThanOrEqual(
                m * n,
              )
              expect(option).toContain(String(m * n))
            }
          }
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
