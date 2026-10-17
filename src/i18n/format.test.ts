import { describe, expect, it } from 'vitest'
import { count, formatInteger, formatPercent, plural } from './format'
import { en } from './messages'

describe('format helpers', () => {
  it('picks plural forms', () => {
    const steps = { one: 'step', other: 'steps' }
    expect(plural(1, steps)).toBe('step')
    expect(plural(0, steps)).toBe('steps')
    expect(plural(2, steps)).toBe('steps')
    expect(count(1, steps)).toBe('1 step')
    expect(plural(1, { other: 'sheep' })).toBe('sheep')
  })

  it('formats numbers', () => {
    expect(formatInteger(1234)).toBe('1,234')
    expect(formatPercent(0.8)).toBe('80%')
    expect(formatPercent(0.666)).toBe('67%')
  })
})

describe('messages', () => {
  it('builds progress details', () => {
    expect(en.progress.stepsOf(1, 1)).toBe('1 of 1 step')
    expect(en.progress.inProgressDetail([en.progress.stepsOf(1, 2)])).toBe(
      'In progress: 1 of 2 steps',
    )
    expect(en.progress.bestScore(0.5, 0.8)).toBe('Best score 50%, 80% passes')
  })
})
