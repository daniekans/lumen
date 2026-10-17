import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('algebra essentials checkpoint problems', () => {
  it('generate valid problems', () => {
    // The practice generators are verified independently in their own sets.
    testProblemSet(problems)
  })
})
