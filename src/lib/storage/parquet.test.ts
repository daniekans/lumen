import { describe, expect, it } from 'vitest'
import {
  groupCount,
  groupRanges,
  groupsRead,
  groupsSpanned,
  mayMatch,
  rowGroups,
  type Predicate,
} from './parquet'

/** Whether any value of the group satisfies the predicate: the ground truth for skipping. */
const holds = (v: number, p: Predicate) =>
  p.op === 'between'
    ? p.low <= v && v <= p.high
    : {
        '=': v === p.value,
        '<': v < p.value,
        '<=': v <= p.value,
        '>': v > p.value,
        '>=': v >= p.value,
      }[p.op]

describe('row groups and footer statistics', () => {
  it('cuts rows into groups, the last one shorter', () => {
    expect(rowGroups([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]])
    expect(groupCount(7, 3)).toBe(3)
    expect(groupCount(6, 3)).toBe(2)
    expect(() => rowGroups([1], 0)).toThrow()
  })

  it('keeps the min and max of each group', () => {
    expect(groupRanges([5, 2, 9, 4, 4, 1], 2)).toEqual([
      { min: 2, max: 5 },
      { min: 4, max: 9 },
      { min: 1, max: 4 },
    ])
  })

  it('skips a group exactly when the range rules out every row', () => {
    const ops = ['=', '<', '<=', '>', '>='] as const
    // Every range inside 0..6 and every predicate value: a skipped range must have no matching
    // value, and a read range must have one (min or max is enough to witness it).
    for (let min = 0; min <= 6; min++)
      for (let max = min; max <= 6; max++)
        for (let v = -1; v <= 7; v++) {
          const preds: Predicate[] = [
            ...ops.map((op) => ({ op, value: v })),
            { op: 'between', low: v, high: v + 2 },
          ]
          for (const p of preds) {
            const any = Array.from({ length: max - min + 1 }, (_, i) => min + i).some((x) =>
              holds(x, p),
            )
            expect(mayMatch({ min, max }, p), `${JSON.stringify(p)} on ${min}..${max}`).toBe(any)
          }
        }
  })

  it('reads only the groups whose range can match', () => {
    const ranges = groupRanges([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
    expect(groupsRead(ranges, { op: '=', value: 5 })).toEqual([1])
    expect(groupsRead(ranges, { op: '>', value: 3 })).toEqual([1, 2])
    expect(groupsRead(ranges, { op: 'between', low: 3, high: 7 })).toEqual([0, 1, 2])
    expect(groupsRead(ranges, { op: '<', value: 1 })).toEqual([])
  })

  it('counts the groups a run of rows spans', () => {
    expect(groupsSpanned(0, 2, 3)).toBe(1)
    expect(groupsSpanned(2, 3, 3)).toBe(2)
    expect(groupsSpanned(4, 12, 3)).toBe(4)
    // Agrees with materializing the groups.
    for (let first = 0; first < 20; first++)
      for (let last = first; last < 20; last++) {
        const groups = new Set(
          Array.from({ length: last - first + 1 }, (_, i) => Math.floor((first + i) / 4)),
        )
        expect(groupsSpanned(first, last, 4)).toBe(groups.size)
      }
  })
})
