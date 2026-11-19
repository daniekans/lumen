import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

// The picked generators are verified independently in their practice sets.
describe('Checkpoint: applications of derivatives problems', () => {
  it('generate valid problems', () => testProblemSet(problems, undefined, 40))
})
