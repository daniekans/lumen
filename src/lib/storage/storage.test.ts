import { describe, expect, it } from 'vitest'
import {
  pagesFor,
  pagesOfCells,
  rowWidth,
  scanBytes,
  scanPages,
  tableBytes,
  valueOffset,
  type Column,
  type Layout,
} from '.'

const cols: Column[] = [
  { name: 'id', width: 8 },
  { name: 'ts', width: 8 },
  { name: 'geo', width: 4 },
  { name: 'amount', width: 8 },
  { name: 'note', width: 36 },
]

/** Lays the table out byte by byte and returns, for each byte, its [row, col]. */
const materialize = (n: number, columns: readonly Column[], layout: Layout) => {
  const bytes: [number, number][] = []
  if (layout === 'row') {
    for (let r = 0; r < n; r++)
      columns.forEach((c, j) => {
        for (let b = 0; b < c.width; b++) bytes.push([r, j])
      })
  } else {
    columns.forEach((c, j) => {
      for (let r = 0; r < n; r++) for (let b = 0; b < c.width; b++) bytes.push([r, j])
    })
  }
  return bytes
}

describe('storage cost model', () => {
  it('measures rows and tables', () => {
    expect(rowWidth(cols)).toBe(64)
    expect(tableBytes(64, cols)).toBe(4096)
  })

  it('scans every byte in a row layout and only the chosen columns in a column layout', () => {
    expect(scanBytes(64, cols, ['geo', 'amount'], 'row')).toBe(4096)
    expect(scanBytes(64, cols, ['geo', 'amount'], 'column')).toBe(768)
    expect(() => scanBytes(64, cols, ['nope'], 'column')).toThrow()
  })

  it('counts pages, with each column starting a new page', () => {
    expect(pagesFor(4096, 256)).toBe(16)
    expect(pagesFor(4097, 256)).toBe(17)
    expect(scanPages(64, cols, ['geo', 'amount'], 'row', 256)).toBe(16)
    expect(scanPages(64, cols, ['geo', 'amount'], 'column', 256)).toBe(3)
    expect(
      scanPages(
        64,
        cols,
        cols.map((c) => c.name),
        'column',
        256,
      ),
    ).toBe(16)
    expect(scanPages(10, cols, ['geo', 'note'], 'column', 256)).toBe(1 + 2)
  })

  it('finds the offset of a value in both orders', () => {
    for (const layout of ['row', 'column'] as const) {
      const bytes = materialize(7, cols, layout)
      for (let r = 0; r < 7; r++)
        for (let j = 0; j < cols.length; j++) {
          const first = bytes.findIndex(([br, bj]) => br === r && bj === j)
          expect(valueOffset(7, cols, r, j, layout)).toBe(first)
        }
    }
  })

  it('finds the pages that hold given cells', () => {
    // 8 rows, 4 columns, 4 values per page.
    const total = Array.from({ length: 8 }, (_, r) => [r, 3] as const)
    expect(pagesOfCells(8, 4, total, 'row', 4)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(pagesOfCells(8, 4, total, 'column', 4)).toEqual([6, 7])
    const row5 = Array.from({ length: 4 }, (_, c) => [5, c] as const)
    expect(pagesOfCells(8, 4, row5, 'row', 4)).toEqual([5])
    expect(pagesOfCells(8, 4, row5, 'column', 4)).toEqual([1, 3, 5, 7])
  })
})
