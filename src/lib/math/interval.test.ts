import { describe, expect, it } from 'vitest'
import { inIntervals, intervalTex } from '.'

describe('intervals', () => {
  it('prints interval notation', () => {
    expect(intervalTex([{ from: -2, to: Infinity, closedFrom: true }])).toBe('[-2, \\infty)')
    expect(
      intervalTex([
        { from: -Infinity, to: 1 },
        { from: 1, to: Infinity },
      ]),
    ).toBe('(-\\infty, 1) \\cup (1, \\infty)')
    expect(intervalTex([{ from: -Infinity, to: 3, closedTo: true, closedFrom: true }])).toBe(
      '(-\\infty, 3]',
    )
    expect(intervalTex([{ from: 0, to: 1, fromTex: '\\frac{1}{2}' }])).toBe('(\\frac{1}{2}, 1)')
    expect(intervalTex([])).toBe('\\varnothing')
  })

  it('tests membership with open and closed ends', () => {
    const set = [{ from: -2, to: 4, closedFrom: true }]
    expect(inIntervals(set, -2)).toBe(true)
    expect(inIntervals(set, 4)).toBe(false)
    expect(inIntervals(set, 0)).toBe(true)
    expect(inIntervals([{ from: -Infinity, to: Infinity }], 1e9)).toBe(true)
  })
})
