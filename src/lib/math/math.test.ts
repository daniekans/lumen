import { describe, expect, it } from 'vitest'
import {
  apply,
  basisCoords,
  basisCoords3,
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
  linePiece,
  mat2,
  niceStep,
  stepDigits,
  zoomedStep,
  riemannPieces,
  riemannSum,
  sameMat,
  sameVec,
  secantSlope,
  spanDimension3,
  tangentPiece,
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
  it('line pieces reach the same distance on both sides, vertical ones too', () => {
    const t = tangentPiece([1, 2], 3, 1)
    expect(Math.hypot(t.to[0] - 1, t.to[1] - 2)).toBeCloseTo(1)
    expect((t.to[1] - t.from[1]) / (t.to[0] - t.from[0])).toBeCloseTo(3)
    expect(linePiece([0, 0], [0, 2], 0.5)).toEqual({ from: [0, -0.5], to: [0, 0.5] })
  })
})

describe('mat2', () => {
  it('applies columns as images of the basis vectors', () => {
    const m = mat2(1, 2, 3, 4)
    expect(apply(m, [1, 0])).toEqual([1, 3])
    expect(apply(m, [0, 1])).toEqual([2, 4])
    expect(det(m)).toBe(-2)
  })
  it('compares vectors with a tolerance', () => {
    expect(sameVec([1, 2], [1, 2 + 1e-12])).toBe(true)
    expect(sameVec([1, 2], [1.1, 2])).toBe(false)
  })
  it('compares matrices with a tolerance', () => {
    expect(sameMat(mat2(1, 2, 3, 4), mat2(1, 2, 3, 4 + 1e-12))).toBe(true)
    expect(sameMat(mat2(1, 2, 3, 4), mat2(1, 2, 3, 4.1))).toBe(false)
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

describe('spanDimension3', () => {
  it('counts the dimension of the span', () => {
    expect(spanDimension3([])).toBe(0)
    expect(spanDimension3([[0, 0, 0]])).toBe(0)
    expect(
      spanDimension3([
        [1, 2, 0],
        [-2, -4, 0],
      ]),
    ).toBe(1)
    expect(
      spanDimension3([
        [1, 2, 0],
        [-1, 0, 2],
        [0, 2, 2],
      ]),
    ).toBe(2)
    expect(
      spanDimension3([
        [1, 2, 0],
        [-1, 0, 2],
        [1, 1, 3],
      ]),
    ).toBe(3)
    expect(
      spanDimension3([
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
      ]),
    ).toBe(2)
  })
})

describe('basis coordinates', () => {
  it('finds the weights that rebuild the vector', () => {
    const m = { i: [2, 1], j: [-1, 2] } as const
    const c = basisCoords(m, [3, 4])!
    expect(c[0]).toBeCloseTo(2, 12)
    expect(c[1]).toBeCloseTo(1, 12)
    expect(basisCoords({ i: [2, 1], j: [-4, -2] }, [3, 4])).toBeNull()
  })
  it('solves in space, and rejects a dependent set', () => {
    const b = [
      [1, 1, 0],
      [0, 1, 1],
      [1, 0, 1],
    ] as const
    const c = basisCoords3(b, [3, 3, 2])!
    ;[2, 1, 1].forEach((x, k) => expect(c[k]).toBeCloseTo(x, 12))
    expect(
      basisCoords3(
        [
          [1, 2, 0],
          [-1, 0, 2],
          [0, 2, 2],
        ],
        [1, 1, 1],
      ),
    ).toBeNull()
  })
})
