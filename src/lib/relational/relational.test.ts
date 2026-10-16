import { describe, expect, it } from 'vitest'
import { createRng } from '@/lib/practice/rng'
import {
  determines,
  isKey,
  join,
  joinOn,
  joinSize,
  orphans,
  product,
  sqlEquals,
  type JoinKind,
  type Value,
} from '.'

const customers = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Ben' },
  { id: 3, name: 'Caio' },
]
const orders = [
  { order: 10, customer: 1 },
  { order: 11, customer: 1 },
  { order: 12, customer: 2 },
  { order: 13, customer: 9 },
  { order: 14, customer: null },
]

describe('relational operations', () => {
  it('treats NULL as equal to nothing', () => {
    expect(sqlEquals(null, null)).toBe(false)
    expect(sqlEquals(1, null)).toBe(false)
    expect(sqlEquals(2, 2)).toBe(true)
  })

  it('pairs every row in a product', () => {
    expect(product(3, 5)).toHaveLength(15)
    expect(join(customers, orders, 'cross')).toHaveLength(15)
  })

  it('computes inner, outer, anti and semi joins', () => {
    const pairs = (kind: JoinKind) =>
      joinOn(customers, orders, kind, 'id', 'customer').map((p) => [p.left, p.right])
    expect(pairs('inner')).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
    ])
    expect(pairs('left')).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
      [2, null],
    ])
    expect(pairs('right')).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
      [null, 3],
      [null, 4],
    ])
    expect(pairs('full')).toHaveLength(6)
    expect(pairs('anti')).toEqual([[2, null]])
    expect(pairs('semi')).toEqual([
      [0, null],
      [1, null],
    ])
  })

  it('agrees with the multiplicity formula on random key columns', () => {
    const kinds: JoinKind[] = ['cross', 'inner', 'left', 'right', 'full', 'anti', 'semi']
    for (let seed = 1; seed <= 300; seed++) {
      const rng = createRng(seed)
      const column = (): Value[] =>
        Array.from({ length: rng.int(0, 7) }, () => (rng.int(0, 5) === 0 ? null : rng.int(1, 4)))
      const a = column()
      const b = column()
      const rows = (values: Value[]) => values.map((k) => ({ k }))
      for (const kind of kinds)
        expect(joinOn(rows(a), rows(b), kind, 'k', 'k'), `${kind} ${a} | ${b}`).toHaveLength(
          joinSize(a, b, kind),
        )
    }
  })

  it('finds keys, dependencies and orphans', () => {
    const rows = [
      { name: 'Ana', city: 'Lisbon', team: 'A' },
      { name: 'Ben', city: 'Recife', team: 'A' },
      { name: 'Caio', city: 'Recife', team: 'B' },
    ]
    expect(isKey(rows, ['name'])).toBe(true)
    expect(isKey(rows, ['city'])).toBe(false)
    expect(isKey(rows, ['city', 'team'])).toBe(true)
    expect(isKey([{ id: null }], ['id'])).toBe(false)
    expect(determines(rows, ['name'], ['city'])).toBe(true)
    expect(determines(rows, ['city'], ['team'])).toBe(false)
    expect(determines(rows, ['team', 'city'], ['name'])).toBe(true)
    expect(
      orphans(
        orders.map((o) => o.customer),
        customers.map((c) => c.id),
      ),
    ).toEqual([3])
  })
})
