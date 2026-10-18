import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('exponential and logarithmic checkpoint problems', () => {
  it('generate valid problems', () => {
    // The practice generators are verified independently in their own set.
    testProblemSet(problems, undefined, 20)
  })
})
