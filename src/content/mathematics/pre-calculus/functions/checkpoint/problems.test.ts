import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

/** First coordinates of a relation written as $\{(1, 2), (3, 4)\}$. */
const inputs = (option: string) =>
  [...option.matchAll(/\((-?\d+), -?\d+\)/g)].map((m) => Number(m[1]))

describe('functions checkpoint problems', () => {
  it('generate valid problems with independently verified answers', () => {
    // Practice generators are verified in their own sets; this checks the checkpoint's own ones.
    testProblemSet(problems, (g, p) => {
      if (g.id !== 'is-function' || p.answer.kind !== 'choice') return
      const { options, correct } = p.answer
      options.forEach((o, i) => {
        const xs = inputs(o)
        expect(xs).toHaveLength(4)
        expect(new Set(xs).size === xs.length, o).toBe(i === correct)
      })
    })
  })
})
