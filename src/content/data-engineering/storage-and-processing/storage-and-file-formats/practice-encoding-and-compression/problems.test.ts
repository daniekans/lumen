import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)

/** Smallest b with 2^b > max, by doubling. */
const widthFor = (max: number) => {
  let b = 0
  let capacity = 1
  while (capacity <= max) {
    capacity *= 2
    b++
  }
  return b
}

/** Expected encodings for the column cases, in the order of the generator's list. */
const BEST = ['Dictionary', 'Delta', 'Run-length', 'None: store it plain', 'Delta']

describe('encoding and compression problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'code-bits':
          expect(value(a)).toBe(widthFor(d.d! - 1))
          expect(2 ** value(a)).toBeGreaterThanOrEqual(d.d!)
          expect(2 ** (value(a) - 1)).toBeLessThan(d.d!)
          break
        case 'dictionary-size':
          expect(value(a)).toBe(d.d! * d.w! + Math.ceil((d.n! * widthFor(d.d! - 1)) / 8))
          break
        case 'compression-ratio': {
          const stored = d.d! * d.w! + (d.n! * widthFor(d.d! - 1)) / 8
          expect(value(a)).toBeCloseTo((d.n! * d.w!) / stored, 9)
          expect(value(a)).toBeGreaterThan(1)
          break
        }
        case 'run-count': {
          const seq = Array.from({ length: d.length! }, (_, i) => d[`s${i}`]!)
          const order = d.sorted ? [...seq].sort((x, y) => x - y) : seq
          const runs = order.filter((v, i) => i === 0 || v !== order[i - 1]).length
          expect(value(a)).toBe(runs)
          break
        }
        case 'rle-size':
          expect(value(a)).toBe(d.d! * (d.v! + 4))
          break
        case 'delta-bits': {
          const ts = Array.from({ length: 6 }, (_, i) => d[`t${i}`]!)
          const max = Math.max(...ts.slice(1).map((t, i) => t - ts[i]!))
          expect(value(a)).toBe(widthFor(max))
          break
        }
        case 'information':
          expect(2 ** value(a)).toBeCloseTo(d.total! / d.c!, 9)
          break
        case 'entropy': {
          const counts = Array.from({ length: d.k! }, (_, i) => d[`c${i}`]!)
          expect(counts.every((c) => c > 0)).toBe(true)
          expect(counts.reduce((s, c) => s + c, 0)).toBe(d.total)
          const h =
            -counts.reduce((s, c) => s + (c / d.total!) * Math.log(c / d.total!), 0) / Math.LN2
          expect(value(a)).toBeCloseTo(h, 9)
          break
        }
        case 'choose-encoding':
          expect(a.kind === 'choice' && a.options[a.correct]).toBe(BEST[d.kind!])
          break
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
