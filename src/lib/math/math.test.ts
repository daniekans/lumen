import { describe, expect, it } from 'vitest'
import {
  apply,
  cubicBezier,
  cAbs,
  cArg,
  cMul,
  complex,
  derivative,
  fmtPoint,
  fmtShort,
  det,
  integrate,
  mat2,
  niceStep,
  stepDigits,
  zoomedStep,
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

describe('fmtShort and fmtPoint', () => {
  it('drop trailing zeros, round, and use a true minus sign', () => {
    expect(fmtShort(2)).toBe('2')
    expect(fmtShort(2.004)).toBe('2')
    expect(fmtShort(1.5)).toBe('1.5')
    expect(fmtShort(-0.25)).toBe('\u22120.25')
    expect(fmtShort(-0.001)).toBe('0')
    expect(fmtPoint([1.5, -2])).toBe('(1.5, \u22122)')
  })
})

describe('zoomedStep', () => {
  it('keeps the step at zoom 1 and scales it by 1, 2 or 5 otherwise', () => {
    expect(zoomedStep(1, 1)).toBe(1)
    expect(zoomedStep(1, 0.25)).toBe(5)
    expect(zoomedStep(1, 0.5)).toBe(2)
    expect(zoomedStep(1, 2.5)).toBe(0.5)
    expect(zoomedStep(1, 8)).toBe(0.2)
    expect(zoomedStep(0.5, 4)).toBe(0.25)
  })
  it('counts the decimal places a step needs', () => {
    expect([1, 5, 0.5, 0.2, 0.25, 0.05].map(stepDigits)).toEqual([0, 0, 1, 1, 2, 2])
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

describe('cubicBezier', () => {
  it('matches the endpoints and the linear case', () => {
    const lin = cubicBezier(0, 0, 1, 1)
    expect(lin(0)).toBe(0)
    expect(lin(1)).toBe(1)
    expect(lin(0.3)).toBeCloseTo(0.3, 5)
  })
  it('is symmetric for an ease-in-out curve', () => {
    const e = cubicBezier(0.65, 0, 0.35, 1)
    expect(e(0.5)).toBeCloseTo(0.5, 5)
    expect(e(0.25) + e(0.75)).toBeCloseTo(1, 5)
  })
})
