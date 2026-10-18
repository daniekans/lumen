import { describe, expect, it } from 'vitest'
import { compoundFactor, logBase, timeToMultiply } from '.'

describe('exponentials and logarithms', () => {
  it('takes logarithms in any base', () => {
    expect(logBase(2, 8)).toBeCloseTo(3)
    expect(logBase(10, 0.01)).toBeCloseTo(-2)
    expect(logBase(4, 2)).toBeCloseTo(0.5)
    for (const x of [0.3, 2, 17]) expect(2 ** logBase(2, x)).toBeCloseTo(x)
  })

  it('compounds toward e^(rt)', () => {
    expect(compoundFactor(1, 1)).toBe(2)
    expect(compoundFactor(0.1, 4, 2)).toBeCloseTo(1.025 ** 8)
    expect(compoundFactor(1, Infinity)).toBeCloseTo(Math.E)
    const gaps = [1, 10, 100, 1000].map((n) => Math.E - compoundFactor(1, n))
    gaps.forEach((g, i) => {
      expect(g).toBeGreaterThan(0)
      if (i) expect(g).toBeLessThan(gaps[i - 1]!)
    })
  })

  it('finds doubling times and half-lives', () => {
    expect(timeToMultiply(2, 2)).toBeCloseTo(1)
    expect(timeToMultiply(0.5, 0.5)).toBeCloseTo(1)
    expect(timeToMultiply(1.5 ** 0.25, 1.5)).toBeCloseTo(4)
  })
})
