import { describe, expect, it } from 'vitest'
import { addN, dotN, normN, scaleN, simplifySqrt, subN } from './vector'

describe('n-dimensional vectors', () => {
  it('add, subtract, scale and measure componentwise', () => {
    expect(addN([1, 2, 3], [4, -5, 6])).toEqual([5, -3, 9])
    expect(subN([1, 2], [4, -5])).toEqual([-3, 7])
    expect(scaleN([1, -2, 0.5], -2)).toEqual([-2, 4, -1])
    expect(dotN([1, 2, 3], [4, -5, 6])).toBe(12)
    expect(normN([2, -1, 2])).toBe(3)
    expect(() => addN([1], [1, 2])).toThrow()
  })

  it('simplifies square roots of whole numbers', () => {
    expect(simplifySqrt(12)).toEqual([2, 3])
    expect(simplifySqrt(9)).toEqual([3, 1])
    expect(simplifySqrt(7)).toEqual([1, 7])
    expect(simplifySqrt(72)).toEqual([6, 2])
    expect(simplifySqrt(0)).toEqual([1, 0])
    for (let n = 1; n < 500; n++) {
      const [a, b] = simplifySqrt(n)
      expect(a * a * b).toBe(n)
    }
  })
})
