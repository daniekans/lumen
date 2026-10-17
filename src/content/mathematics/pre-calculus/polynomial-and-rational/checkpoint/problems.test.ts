import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('polynomial and rational checkpoint problems', () => {
  it('generate valid problems', () => {
    // The practice generators are verified independently in their own set.
    testProblemSet(problems)
  })
})
