import { describe, expect, it } from 'vitest'
import {
  apply,
  cAbs,
  cArg,
  cMul,
  complex,
  derivative,
  det,
  integrate,
  mat2,
  niceStep,
  riemannPieces,
  riemannSum,
  secantSlope,
} from '.'

describe('calculus', () => {
  const f = (x: number) => x * x
  it('secant slope approaches the derivative as h shrinks', () => {
    expect(secantSlope(f, 1, 1)).toBeCloseTo(3)
    expect(secantSlope(f, 1, 1e-6)).toBeCloseTo(2, 4)
    expect(derivative(f, 1)).toBeCloseTo(2, 6)
  })
  it('riemann sums converge to the integral', () => {
    const exact = integrate(f, 0, 1)
    expect(exact).toBeCloseTo(1 / 3, 8)
    const left = riemannSum(riemannPieces(f, 0, 1, 4, 'left'))
    expect(left).toBeCloseTo(0.21875)
    const mid = riemannSum(riemannPieces(f, 0, 1, 200, 'midpoint'))
    expect(Math.abs(mid - exact)).toBeLessThan(1e-5)
    const trap = riemannSum(riemannPieces(f, 0, 1, 4, 'trapezoid'))
    expect(trap).toBeCloseTo(0.34375)
  })
})

describe('mat2', () => {
  it('applies columns as images of the basis vectors', () => {
    const m = mat2(1, 2, 3, 4)
    expect(apply(m, [1, 0])).toEqual([1, 3])
    expect(apply(m, [0, 1])).toEqual([2, 4])
    expect(det(m)).toBe(-2)
  })
})

describe('complex', () => {
  it('multiplication multiplies moduli and adds arguments', () => {
    const a = complex(1, 1)
    const b = complex(0, 2)
    const p = cMul(a, b)
    expect(cAbs(p)).toBeCloseTo(cAbs(a) * cAbs(b))
    expect(cArg(p)).toBeCloseTo(cArg(a) + cArg(b))
  })
})

describe('niceStep', () => {
  it('rounds up to 1, 2 or 5 times a power of ten', () => {
    expect(niceStep(0.7)).toBe(1)
    expect(niceStep(1.3)).toBe(2)
    expect(niceStep(3)).toBe(5)
    expect(niceStep(42)).toBe(50)
  })
})
