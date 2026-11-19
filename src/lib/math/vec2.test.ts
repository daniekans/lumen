import { describe, expect, it } from 'vitest'
import { polygonArea, turnAngle } from './vec2'

describe('vec2', () => {
  it('measures the signed turn from one vector to another', () => {
    expect(turnAngle([1, 0], [0, 2])).toBeCloseTo(Math.PI / 2)
    expect(turnAngle([1, 0], [0, -2])).toBeCloseTo(-Math.PI / 2)
    expect(turnAngle([1, 1], [2, 2])).toBeCloseTo(0)
  })

  it('gives signed polygon areas', () => {
    const square: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]
    expect(polygonArea(square)).toBe(1)
    expect(polygonArea([...square].reverse())).toBe(-1)
    // A triangle with base 4 and height 3, away from the origin.
    expect(
      polygonArea([
        [2, 1],
        [6, 1],
        [3, 4],
      ]),
    ).toBe(6)
  })
})
