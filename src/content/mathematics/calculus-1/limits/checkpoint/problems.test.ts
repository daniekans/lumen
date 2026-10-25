import { describe, expect, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('limits checkpoint problems', () => {
  it('generate valid problems', () => {
    // The practice generators are verified independently in their own sets.
    expect(problems).toHaveLength(14)
    expect(problems.every(Boolean)).toBe(true)
    testProblemSet(problems, undefined, 20)
  })
})
