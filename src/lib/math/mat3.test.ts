import { describe, expect, it } from 'vitest'
import { apply3, lerpMatN, rotationAbout } from './mat3'

const close = (a: readonly number[], b: readonly number[]) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 12))

describe('rotationAbout', () => {
  const q = Math.PI / 2
  it('turns a quarter turn by the right-hand rule', () => {
    // About z: x to y. About x: y to z. About y: z to x.
    close(apply3(rotationAbout('z', q), [1, 0, 0]), [0, 1, 0])
    close(apply3(rotationAbout('x', q), [0, 1, 0]), [0, 0, 1])
    close(apply3(rotationAbout('y', q), [0, 0, 1]), [1, 0, 0])
  })
  it('keeps the axis and lengths', () => {
    const r = rotationAbout('y', 0.7)
    close(apply3(r, [0, 2, 0]), [0, 2, 0])
    const v = apply3(r, [1, 2, 3])
    expect(Math.hypot(...v)).toBeCloseTo(Math.hypot(1, 2, 3), 12)
  })
})

describe('apply3 and lerpMatN', () => {
  it('applies a 3 x 2 matrix to a vector of the plane', () => {
    expect(
      apply3(
        [
          [1, 0],
          [0, 1],
          [2, -1],
        ],
        [3, 4],
      ),
    ).toEqual([3, 4, 2])
  })
  it('moves entry by entry', () => {
    expect(
      lerpMatN(
        [
          [0, 2],
          [4, 0],
        ],
        [
          [2, 2],
          [0, 0],
        ],
        0.5,
      ),
    ).toEqual([
      [1, 2],
      [2, 0],
    ])
  })
})
