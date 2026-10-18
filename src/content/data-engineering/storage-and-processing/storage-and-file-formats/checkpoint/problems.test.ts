import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('storage and file formats checkpoint problems', () => {
  it('generate valid problems', () => {
    // The practice generators are verified independently in their own sets.
    testProblemSet(problems, undefined, 20)
  })
})
