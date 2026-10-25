import { describe, expect, it } from 'vitest'
import {
  column,
  fromColumns,
  identityN,
  matMul,
  matPow,
  matVec,
  rank,
  sameMatN,
  transpose,
} from './matN'

describe('matN', () => {
  const A = [
    [1, 2, 3],
    [4, 5, 6],
  ]

  it('reads columns and builds from columns', () => {
    expect(column(A, 1)).toEqual([2, 5])
    expect(fromColumns([1, 4], [2, 5], [3, 6])).toEqual(A)
  })

  it('transposes', () => {
    expect(transpose(A)).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ])
    expect(transpose(transpose(A))).toEqual(A)
  })

  it('multiplies a matrix and a vector as a combination of columns', () => {
    expect(matVec(A, [1, 0, -1])).toEqual([-2, -2])
    expect(matVec(A, [0, 1, 0])).toEqual(column(A, 1))
    expect(() => matVec(A, [1, 2])).toThrow()
  })

  it('multiplies matrices', () => {
    const B = [
      [1, 0],
      [0, 1],
      [1, 1],
    ]
    expect(matMul(A, B)).toEqual([
      [4, 5],
      [10, 11],
    ])
    expect(matMul(identityN(2), A)).toEqual(A)
    expect(() => matMul(A, A)).toThrow()
    // (AB)^T = B^T A^T
    expect(transpose(matMul(A, B))).toEqual(matMul(transpose(B), transpose(A)))
  })

  it('takes powers', () => {
    const R = [
      [0, -1],
      [1, 0],
    ]
    expect(matPow(R, 0)).toEqual(identityN(2))
    expect(matPow(R, 2)).toEqual([
      [-1, 0],
      [0, -1],
    ])
    expect(sameMatN(matPow(R, 4), identityN(2))).toBe(true)
  })

  it('finds the rank exactly', () => {
    expect(rank(A)).toBe(2)
    expect(rank(identityN(3))).toBe(3)
    expect(rank([[0, 0]])).toBe(0)
    // Third column is the sum of the first two.
    expect(
      rank([
        [1, 2, 3],
        [0, 1, 1],
        [2, 5, 7],
      ]),
    ).toBe(2)
    // Fractions that floating point gets slightly wrong.
    expect(
      rank([
        [0.1, 0.2],
        [0.3, 0.6],
      ]),
    ).toBe(1)
    expect(
      rank([
        [1 / 3, 1],
        [1, 3],
      ]),
    ).toBe(1)
  })
})
