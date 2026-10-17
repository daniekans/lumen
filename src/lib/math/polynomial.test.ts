import { describe, expect, it } from 'vitest'
import {
  polyAdd,
  polyDegree,
  polyDerivative,
  polyDivide,
  polyEval,
  polyFromRoots,
  polyMul,
  polyScale,
  signChanges,
} from '.'

describe('polynomials', () => {
  it('evaluates, adds, scales and multiplies', () => {
    expect(polyEval([2, -3, 1], 2)).toBe(3)
    expect(polyAdd([1, 2], [3, 0, 1])).toEqual([3, 1, 3])
    expect(polyAdd([1, 2], [-1, 0])).toEqual([2])
    expect(polyScale([1, -2], 3)).toEqual([3, -6])
    expect(polyMul([1, 1], [1, -1])).toEqual([1, 0, -1])
  })

  it('builds from roots with multiplicity', () => {
    const p = polyFromRoots([1, 1, -2], 2)
    expect(polyDegree(p)).toBe(3)
    expect(p[0]).toBe(2)
    for (const x of [-3, 0, 0.5, 4]) expect(polyEval(p, x)).toBeCloseTo(2 * (x - 1) ** 2 * (x + 2))
  })

  it('divides with a remainder', () => {
    // (x² - 1) / (x - 2) = x + 2 remainder 3
    expect(polyDivide([1, 0, -1], [1, -2])).toEqual({ quotient: [1, 2], remainder: [3] })
    // Exact division leaves the zero polynomial.
    expect(polyDivide(polyFromRoots([1, 2, 3]), [1, -2])).toEqual({
      quotient: [1, -4, 3],
      remainder: [0],
    })
    // A lower degree numerator is all remainder.
    expect(polyDivide([2, 1], [1, 0, -4])).toEqual({ quotient: [0], remainder: [2, 1] })
    for (const x of [-2, 0.3, 5]) {
      const { quotient, remainder } = polyDivide([3, -1, 4, 2], [1, 1])
      expect(polyEval(quotient, x) * (x + 1) + polyEval(remainder, x)).toBeCloseTo(
        polyEval([3, -1, 4, 2], x),
      )
    }
  })

  it('differentiates', () => {
    expect(polyDerivative([1, 0, -3, 5])).toEqual([3, 0, -3])
    expect(polyDerivative([7])).toEqual([0])
    expect(polyDegree([0, 0])).toBe(-Infinity)
  })

  it('finds sign changes and skips touching zeros', () => {
    const p = polyFromRoots([-2, 1, 1, 3])
    const xs = signChanges((x) => polyEval(p, x), -5, 5)
    expect(xs).toHaveLength(2)
    expect(xs[0]).toBeCloseTo(-2, 8)
    expect(xs[1]).toBeCloseTo(3, 8)
    // Turning points of x³ - 3x are at ±1; x³ has none.
    const turns = signChanges((x) => polyEval(polyDerivative([1, 0, -3, 0]), x), -4, 4)
    expect(turns.map((t) => +t.toFixed(6))).toEqual([-1, 1])
    expect(signChanges((x) => polyEval(polyDerivative([1, 0, 0, 0]), x), -4, 4)).toEqual([])
  })
})
