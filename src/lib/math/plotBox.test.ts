import { describe, expect, it } from 'vitest'
import { plotBox } from '.'

describe('plotBox', () => {
  const box = plotBox({ at: [10, 2], size: [8, 4], x: [0, 4], y: [0, 100] })

  it('maps the data corners to the box corners', () => {
    expect(box.map([0, 0])).toEqual([10, 2])
    expect(box.map([4, 100])).toEqual([18, 6])
    expect(box.map([2, 50])).toEqual([14, 4])
  })

  it('leaves out samples outside the y range', () => {
    const pts = box.curve((x) => 1 / x, 0, 4, 40)
    expect(pts.every(([, y]) => y >= 2 && y <= 6)).toBe(true)
    expect(pts.length).toBe(40)
  })
})
