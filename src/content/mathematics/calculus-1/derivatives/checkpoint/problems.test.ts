import { describe, it } from 'vitest'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

describe('derivatives checkpoint problems', () => {
  it('generate valid problems', () => testProblemSet(problems, undefined, 40))
})
