import { describe, expect, it } from 'vitest'
import type { Problem } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: Problem['answer']) => (a.kind === 'number' ? a.value : NaN)
const correctOption = (a: Problem['answer']) => (a.kind === 'choice' ? a.options[a.correct] : '')

/** The expected layout of each hash-or-range case. */
const LAYOUT = ['Either: one part', 'Range', 'Hash', 'Hash', 'Range']

describe('Hashing and skew problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'bucket-of': {
          // Long division with BigInt, away from floating point.
          expect(value(a)).toBe(Number(BigInt(d.h!) % BigInt(d.n!)))
          break
        }
        case 'hash-or-range': {
          expect(correctOption(a)).toBe(LAYOUT[d.kind!])
          break
        }
        case 'skew-ratio': {
          const loads = [0, 0, 0, 0]
          let total = 0
          for (let i = 0; i < d.count!; i++) {
            loads[d[`b${i}`]!]! += d[`r${i}`]!
            total += d[`r${i}`]!
          }
          expect(loads.every((l) => l > 0)).toBe(true)
          let max = 0
          for (const l of loads) if (l > max) max = l
          expect(value(a)).toBeCloseTo((max * 4) / total, 10)
          break
        }
        case 'hot-key-bound': {
          // A table of 10 000 rows: the hot bucket holds the key's rows, against the mean.
          const rows = 10_000
          const hotRows = (rows * d.pct!) / 100
          expect(value(a)).toBeCloseTo(hotRows / (rows / d.n!), 10)
          expect(value(a)).toBeGreaterThanOrEqual(1)
          break
        }
        case 'salted-load': {
          // Place the rows bucket by bucket: salts in buckets 0 to S - 1, the rest spread evenly.
          const loads = Array.from(
            { length: d.n! },
            (_, k) => d.rest! / d.n! + (k < d.salts! ? d.hot! / d.salts! : 0),
          )
          expect(Number.isInteger(d.hot! / d.salts!)).toBe(true)
          expect(Number.isInteger(d.rest! / d.n!)).toBe(true)
          expect(value(a)).toBe(Math.max(...loads))
          break
        }
        case 'join-pairs': {
          // Build both tables row by row (each row carries its bucket) and count same-bucket pairs.
          const left = [0, 1, 2, 3].flatMap((k) => Array<number>(d[`a${k}`]!).fill(k))
          const right = [0, 1, 2, 3].flatMap((k) => Array<number>(d[`b${k}`]!).fill(k))
          let pairs = 0
          for (const x of left) for (const y of right) if (x === y) pairs++
          expect(value(a)).toBe(pairs)
          break
        }
        case 'buckets-meet': {
          // Try many hash values and collect the orders buckets of those in customers bucket j.
          const found = new Set<number>()
          for (let h = 0; h < 1000; h++) if (h % d.small! === d.j!) found.add(h % d.large!)
          expect(a.kind === 'list' ? [...a.values].sort((x, y) => x - y) : []).toEqual(
            [...found].sort((x, y) => x - y),
          )
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
