import { describe, expect, it } from 'vitest'
import {
  filesFor,
  formatBytes,
  partitionBy,
  partitionCount,
  partitionMayMatch,
  partitionPath,
  prunedPaths,
  type Row,
} from './partitions'

const ROWS: Row[] = [
  { day: 10, city: 'OSL', amount: 1 },
  { day: 2, city: 'LIS', amount: 2 },
  { day: 10, city: 'LIS', amount: 3 },
  { day: 2, city: 'LIS', amount: 4 },
]

describe('partitions', () => {
  it('writes a path per row, column by column', () => {
    expect(partitionPath(ROWS[0]!, ['day', 'city'])).toBe('day=10/city=OSL')
    expect(partitionPath(ROWS[0]!, [])).toBe('')
  })

  it('groups rows into disjoint folders that hold every row', () => {
    const parts = partitionBy(ROWS, ['day', 'city'])
    expect([...parts.keys()]).toEqual(['day=2/city=LIS', 'day=10/city=LIS', 'day=10/city=OSL'])
    expect(parts.get('day=2/city=LIS')!.map((r) => r.amount)).toEqual([2, 4])
    const all = [...parts.values()].flat()
    expect(all).toHaveLength(ROWS.length)
    expect(new Set(all).size).toBe(ROWS.length)
  })

  it('prunes on partition columns only', () => {
    const paths = [...partitionBy(ROWS, ['day', 'city']).keys()]
    expect(prunedPaths(paths, { day: 10 })).toEqual(['day=10/city=LIS', 'day=10/city=OSL'])
    expect(prunedPaths(paths, { city: 'LIS' })).toEqual(['day=2/city=LIS', 'day=10/city=LIS'])
    expect(prunedPaths(paths, { day: 2, city: 'OSL' })).toEqual([])
    // amount is not a partition column, so it rules nothing out.
    expect(prunedPaths(paths, { amount: 7 })).toEqual(paths)
    expect(partitionMayMatch('day=1', { day: 1, amount: 5 })).toBe(true)
  })

  it('counts partitions and files', () => {
    expect(partitionCount([365, 50])).toBe(18250)
    expect(partitionCount([])).toBe(1)
    expect(filesFor(2000, 1000)).toBe(2)
    expect(filesFor(2001, 1000)).toBe(3)
    expect(filesFor(40, 1000)).toBe(1)
    expect(filesFor(0, 1000)).toBe(0)
  })

  it('formats bytes in decimal units', () => {
    expect(formatBytes(200)).toBe('200 B')
    expect(formatBytes(4e7)).toBe('40 MB')
    expect(formatBytes(730e9 / 12)).toBe('60.8 GB')
    expect(formatBytes(7.3e11)).toBe('730 GB')
    expect(formatBytes(999.6e6)).toBe('1 GB')
    expect(formatBytes(2e15)).toBe('2 PB')
  })
})
