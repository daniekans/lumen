import { describe, expect, it } from 'vitest'
import { approachInputs, bisection, limit, lnGamma, oneSidedLimit } from '.'

describe('limits', () => {
  it('approaches from each side', () => {
    expect(approachInputs(1, 'left', 3)).toEqual([0.9, 0.99, 0.999])
    expect(approachInputs(1, 'right', 2).map((x) => +x.toFixed(6))).toEqual([1.1, 1.01])
    expect(approachInputs(Infinity, 'right', 3)).toEqual([10, 100, 1000])
    expect(approachInputs(-Infinity, 'left', 2)).toEqual([-10, -100])
  })

  it('finds limits through holes', () => {
    expect(limit((x) => (x * x - 1) / (x - 1), 1)).toBeCloseTo(2, 9)
    expect(limit((x) => (x ** 3 - 1) / (x - 1), 1)).toBeCloseTo(3, 9)
    expect(limit((x) => Math.sin(x) / x, 0)).toBeCloseTo(1, 9)
    expect(limit((x) => (Math.sqrt(x + 4) - 2) / x, 0)).toBeCloseTo(0.25, 8)
    expect(limit((x) => (1 / x - 1 / 2) / (x - 2), 2)).toBeCloseTo(-0.25, 9)
  })

  it('reports infinite limits and limits that do not exist', () => {
    expect(oneSidedLimit((x) => 1 / (x - 2), 2, 'right')).toBe(Infinity)
    expect(oneSidedLimit((x) => 1 / (x - 2), 2, 'left')).toBe(-Infinity)
    expect(limit((x) => 1 / (x - 2), 2)).toBeNaN()
    expect(limit((x) => -3 / (x + 1) ** 2, -1)).toBe(-Infinity)
    const jump = (x: number) => (x < 1 ? x + 1 : 4 - x)
    expect(oneSidedLimit(jump, 1, 'left')).toBeCloseTo(2, 9)
    expect(oneSidedLimit(jump, 1, 'right')).toBeCloseTo(3, 9)
    expect(limit(jump, 1)).toBeNaN()
    expect(limit((x) => Math.sin(1 / x), 0)).toBeNaN()
  })

  it('finds limits at infinity', () => {
    expect(limit((x) => (2 * x * x - 3 * x) / (x * x + 1), Infinity)).toBeCloseTo(2, 6)
    expect(limit((x) => (3 * x + 1) / (x * x - 4), -Infinity)).toBeCloseTo(0, 6)
    expect(limit((x) => Math.sqrt(4 * x * x + 1) / (x + 3), Infinity)).toBeCloseTo(2, 6)
    expect(limit((x) => Math.sqrt(4 * x * x + 1) / (x + 3), -Infinity)).toBeCloseTo(-2, 6)
    expect(limit((x) => (x * x) / (x + 1), Infinity)).toBe(Infinity)
  })

  it('bisects toward a root, halving the interval each step', () => {
    const f = (x: number) => x ** 3 - x - 1
    const steps = bisection(f, 1, 2, 20)
    expect(steps).toHaveLength(21)
    steps.forEach((s, k) => {
      expect(s.b - s.a).toBeCloseTo(2 ** -k, 12)
      expect(Math.sign(s.fa)).not.toBe(Math.sign(s.fb))
    })
    expect(steps.at(-1)!.mid).toBeCloseTo(1.324717957, 5)
    expect(() => bisection(f, 2, 3, 1)).toThrow()
  })

  it('computes ln Γ, so factorials far past the float range', () => {
    let fact = 1
    for (let n = 1; n <= 20; n++) {
      fact *= n
      expect(lnGamma(n + 1)).toBeCloseTo(Math.log(fact), 9)
    }
    expect(lnGamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)), 12)
    expect(lnGamma(1001) / Math.LN10).toBeCloseTo(2567.6046, 3)
  })
})
