import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const PAGE = 8192

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)

const widths = (d: Data) => Array.from({ length: d.c! }, (_, j) => d[`w${j}`]!)
const masked = (d: Data) => widths(d).filter((_, j) => (d.mask! >> j) & 1)
const total = (ws: readonly number[]) => ws.reduce((s, w) => s + w, 0)

/** Distinct pages touched by `n` back-to-back records of `w` bytes, starting on a fresh page. */
const pagesTouched = (n: number, w: number) => {
  const pages = new Set<number>()
  for (let i = 0; i < n; i++) {
    pages.add(Math.floor((i * w) / PAGE))
    pages.add(Math.floor(((i + 1) * w - 1) / PAGE))
  }
  return pages.size
}

/** Walks the bytes in storage order until it reaches row `r`, column `j`. */
const walkOffset = (d: Data) => {
  const ws = widths(d)
  const cells: [number, number][] = []
  if (d.row) for (let r = 0; r < d.n!; r++) ws.forEach((_, j) => cells.push([r, j]))
  else ws.forEach((_, j) => Array.from({ length: d.n! }, (_, r) => cells.push([r, j])))
  let offset = 0
  for (const [r, j] of cells) {
    if (r === d.r && j === d.j) return offset
    offset += ws[j]!
  }
  throw new Error('cell not found')
}

describe('layout and scan cost problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'table-size':
          expect(value(a)).toBe(d.m! * total(widths(d)))
          break
        case 'scan-bytes':
          expect(masked(d).length).toBeGreaterThanOrEqual(2)
          expect(value(a)).toBe(d.m! * total(d.row ? widths(d) : masked(d)))
          break
        case 'scan-fraction':
          expect(value(a)).toBeCloseTo((100 * total(masked(d))) / total(widths(d)), 9)
          expect(value(a)).toBeLessThan(100)
          break
        case 'row-pages':
          expect(value(a)).toBe(pagesTouched(d.n!, total(widths(d))))
          break
        case 'column-pages':
          expect(value(a)).toBe(total(masked(d).map((w) => pagesTouched(d.n!, w))))
          break
        case 'lookup-pages':
          expect(value(a)).toBe(d.row ? 1 : d.k)
          break
        case 'value-offset':
          expect(value(a)).toBe(walkOffset(d))
          break
        case 'choose-layout': {
          // Model: a million rows of 8-byte columns. Compare pages in both layouts.
          const n = 1e6
          const c = d.c!
          const [rowPages, colPages] =
            d.kind! <= 1
              ? [1, c]
              : [Math.ceil((n * 8 * c) / PAGE), (d.kind === 2 ? 1 : 2) * Math.ceil((n * 8) / PAGE)]
          const best = rowPages < colPages ? 0 : 1
          expect(a.kind === 'choice' && a.correct).toBe(best)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
