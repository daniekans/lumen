import { describe, expect, it } from 'vitest'
import type { Problem } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)
/** The text of the correct option of a choice answer. */
const correctOption = (a: Problem['answer']) => (a.kind === 'choice' ? a.options[a.correct] : '')

/** Distinct counts of the generator's columns, in its order. */
const CARDINALITIES = [5, 12, 365, 24, 50, 8, 4, 6]
/** Whether each WHERE case prunes on a day/country layout. */
const PRUNES = [true, true, false, false, true, false, true]
/** The finest layout with partitions of at least 1 GB, by daily volume. */
const FINEST: Record<number, string> = {
  0.5: 'month',
  2: 'day',
  8: 'day',
  40: 'day and hour',
  150: 'day and country',
}

describe('Partitioning problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'partition-count': {
          // Enumerate the combinations one column at a time.
          let combos = 1
          for (const k of [d.c0, d.c1, d.c2]) if (k !== undefined) combos *= CARDINALITIES[k]!
          expect(value(a)).toBe(combos)
          break
        }
        case 'file-count': {
          // Write each partition's bytes into files of the target size, one file at a time.
          const size = d.perDayMb! / d.split!
          let files = 0
          for (let left = size; left > 0; left -= d.target!) files++
          expect(value(a)).toBe(d.days! * d.split! * files)
          break
        }
        case 'pruned-read': {
          let mb = 0
          for (let day = 1; day <= 31; day++)
            for (let c = 0; c < d.countries!; c++) {
              const dayKept = d.d1! <= day && day <= d.d2!
              const countryKept = !(d.byCountry && d.withCountry) || c < d.k!
              if (dayKept && countryKept) mb += d.mb!
            }
          expect(value(a)).toBe(mb)
          break
        }
        case 'can-prune': {
          expect(correctOption(a)).toBe(
            PRUNES[d.kind!] ? 'Prunes partitions' : 'Reads every partition',
          )
          break
        }
        case 'finest-layout': {
          expect(correctOption(a)).toBe(FINEST[d.daily!])
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
