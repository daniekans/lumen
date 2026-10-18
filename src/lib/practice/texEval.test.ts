import { describe, expect, it } from 'vitest'
import { evaluate, parseTex, variablesOf } from './texEval'

const ev = (tex: string, values: Record<string, number> = {}) => evaluate(parseTex(tex), values)

describe('texEval', () => {
  it('evaluates arithmetic with standard precedence', () => {
    expect(ev('1+2\\cdot 3')).toBe(7)
    expect(ev('2^3^2')).toBe(512)
    expect(ev('-2^2')).toBe(-4)
    expect(ev('(1+2)\\times 3')).toBe(9)
    expect(ev('8\\div 2 \\div 2')).toBe(2)
    expect(ev('10-4-3')).toBe(3)
  })

  it('reads fractions, including TeX shorthand', () => {
    expect(ev('\\frac{1}{2}')).toBe(0.5)
    expect(ev('\\frac73')).toBeCloseTo(7 / 3)
    expect(ev('\\dfrac{x+1}{2}', { x: 3 })).toBe(2)
    expect(ev('-\\frac{3}{4}')).toBe(-0.75)
    expect(ev('1/2')).toBe(0.5)
  })

  it('reads roots, absolute values and constants', () => {
    expect(ev('\\sqrt{16}')).toBe(4)
    expect(ev('2\\sqrt2')).toBeCloseTo(2 * Math.SQRT2)
    expect(ev('\\sqrt[3]{-8}')).toBeCloseTo(-2)
    expect(ev('\\left|-3\\right|')).toBe(3)
    expect(ev('\\vert x-5\\vert', { x: 2 })).toBe(3)
    expect(ev('|x|+|y|', { x: -1, y: -2 })).toBe(3)
    expect(ev('\\pi')).toBeCloseTo(Math.PI)
    expect(ev('e^2')).toBeCloseTo(Math.E ** 2)
    expect(ev('\\exponentialE')).toBeCloseTo(Math.E)
  })

  it('handles implicit multiplication', () => {
    expect(ev('2x', { x: 3 })).toBe(6)
    expect(ev('3(x+1)', { x: 1 })).toBe(6)
    expect(ev('(x+1)(x-1)', { x: 3 })).toBe(8)
    expect(ev('2\\pi r', { r: 1 })).toBeCloseTo(2 * Math.PI)
    expect(ev('xy', { x: 2, y: 5 })).toBe(10)
    expect(ev('x^23', { x: 2 })).toBe(12)
  })

  it('reads functions with or without parentheses', () => {
    expect(ev('\\sin(0)')).toBe(0)
    expect(ev('\\cos x', { x: 0 })).toBe(1)
    expect(ev('\\sin 2x', { x: Math.PI / 4 })).toBeCloseTo(1)
    expect(ev('\\sin x\\cos x', { x: 0.3 })).toBeCloseTo(Math.sin(0.3) * Math.cos(0.3))
    expect(ev('\\sin^2 x+\\cos^2 x', { x: 0.7 })).toBeCloseTo(1)
    expect(ev('\\ln e')).toBeCloseTo(1)
    expect(ev('\\log 100')).toBeCloseTo(2)
    expect(ev('\\log_2 8')).toBeCloseTo(3)
    expect(ev('\\log_{3}(x+1)', { x: 8 })).toBeCloseTo(2)
    expect(ev('\\log_{10} 1000')).toBeCloseTo(3)
    expect(ev('2\\log_4 x', { x: 2 })).toBeCloseTo(1)
    expect(ev('\\operatorname{sinh}(0)')).toBe(0)
  })

  it('reads subscripted variables and ignores spacing commands', () => {
    expect(ev('x_0+x_{12}', { x_0: 1, x_12: 2 })).toBe(3)
    expect(ev(String.raw`2\,x\;+\!1`, { x: 1 })).toBe(3)
    expect([...variablesOf(parseTex('a x^2 + b_1 x'))].sort()).toEqual(['a', 'b_1', 'x'])
  })

  it('rejects malformed input', () => {
    for (const bad of ['', '(1+2', '\\frac{1}', '1+', '\\unknown{2}', '|x', '2**3']) {
      expect(() => parseTex(bad), bad).toThrow()
    }
  })
})
