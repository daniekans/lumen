import { describe, expect, it } from 'vitest'
import type { Problem } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: { kind: string; value?: number }) => (a.kind === 'number' ? a.value! : NaN)
/** The text of the correct option of a choice answer. */
const correctOption = (a: Problem['answer']) => (a.kind === 'choice' ? a.options[a.correct] : '')

/** Widths of the events columns, in the generator's order. */
const WIDTHS = [8, 4, 8, 2, 8, 1, 12, 60]

/** Whether a value satisfies the predicate with operator index `op` and bounds a, b. */
const satisfies = (x: number, op: number, a: number, b: number) =>
  [x === a, x < a, x <= a, x > a, x >= a, a <= x && x <= b][op]!

const PARTS = ['The footer', 'A page', 'A column chunk', 'A row group', 'The footer']
const FORMATS = ['Parquet', 'Avro', 'CSV', 'JSON lines', 'Parquet', 'Avro']

describe('Parquet problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'column-chunks': {
          let groups = 0
          for (let left = d.n!; left > 0; left -= d.r!) groups++
          expect(value(a)).toBe(groups * d.c!)
          break
        }
        case 'skip-count': {
          // Brute force: a row group is read when some value in its range (all are multiples of 10,
          // and so are the bounds, so steps of 5 find every case) satisfies the predicate.
          let skipped = 0
          for (let k = 0; k < d.g!; k++) {
            let any = false
            for (let x = d[`min${k}`]!; x <= d[`max${k}`]!; x += 5)
              any ||= satisfies(x, d.op!, d.a!, d.b!)
            if (!any) skipped++
          }
          expect(value(a)).toBe(skipped)
          break
        }
        case 'pushdown-bytes': {
          const needed = new Set([d.filter!, d.s0!, ...(d.s1 === undefined ? [] : [d.s1])])
          const w = [...needed].reduce((s, j) => s + WIDTHS[j]!, 0)
          expect(value(a)).toBe((d.g! - d.k!) * w)
          break
        }
        case 'sorted-groups': {
          // Materialize which row group each matching row falls in.
          const groups = new Set<number>()
          for (let day = d.d1!; day <= d.d2!; day++)
            for (let i = (day - 1) * d.perDay!; i < day * d.perDay!; i += 10000)
              groups.add(Math.floor(i / d.r!))
          groups.add(Math.floor((d.d2! * d.perDay! - 1) / d.r!))
          expect(value(a)).toBe(groups.size)
          break
        }
        case 'parquet-parts': {
          expect(correctOption(a)).toBe(PARTS[d.kind!])
          break
        }
        case 'choose-format': {
          expect(correctOption(a)).toBe(FORMATS[d.kind!])
          break
        }
        case 'sort-for-pushdown': {
          expect(correctOption(a)).toMatch(/compresses better/)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
