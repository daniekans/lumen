import { describe, expect, it } from 'vitest'
import {
  bitsFor,
  codeBits,
  deltaEncode,
  dictionaryEncode,
  entropy,
  information,
  packedBytes,
  runLengths,
  valueCounts,
} from './encoding'

describe('encodings', () => {
  it('counts the bits of binary numbers', () => {
    for (let max = 1; max < 5000; max++) expect(bitsFor(max)).toBe(max.toString(2).length)
    expect(bitsFor(0)).toBe(0)
    expect(() => bitsFor(-1)).toThrow()
    expect(() => bitsFor(1.5)).toThrow()
  })

  it('sizes codes as the ceiling of log2 d', () => {
    expect([1, 2, 3, 4, 5, 8, 9, 256, 257].map(codeBits)).toEqual([0, 1, 2, 2, 3, 3, 4, 8, 9])
    // 2^b codes fit in b bits, one more does not.
    for (let b = 1; b < 20; b++) {
      expect(codeBits(2 ** b)).toBe(b)
      expect(codeBits(2 ** b + 1)).toBe(b + 1)
    }
    expect(packedBytes(16, 2)).toBe(4)
    expect(packedBytes(10, 3)).toBe(4)
  })

  it('builds a dictionary that decodes back to the column', () => {
    const column = ['b', 'a', 'b', 'c', 'a', 'b']
    const { dictionary, codes } = dictionaryEncode(column)
    expect(dictionary).toEqual(['b', 'a', 'c'])
    expect(codes).toEqual([0, 1, 0, 2, 1, 0])
    expect(codes.map((c) => dictionary[c])).toEqual(column)
  })

  it('splits a column into runs that expand back to it', () => {
    const column = [3, 3, 1, 1, 1, 3, 2, 2]
    const runs = runLengths(column)
    expect(runs).toEqual([
      { value: 3, start: 0, length: 2 },
      { value: 1, start: 2, length: 3 },
      { value: 3, start: 5, length: 1 },
      { value: 2, start: 6, length: 2 },
    ])
    expect(runs.flatMap((r) => Array<number>(r.length).fill(r.value))).toEqual(column)
    expect(runLengths([])).toEqual([])
  })

  it('writes deltas whose prefix sums restore the column', () => {
    const column = [1000, 1003, 1004, 1009, 1009, 1015]
    const deltas = deltaEncode(column)
    expect(deltas).toEqual([1000, 3, 1, 5, 0, 6])
    let sum = 0
    expect(deltas.map((d) => (sum += d))).toEqual(column)
  })

  it('measures information and entropy', () => {
    expect(information(1 / 8)).toBeCloseTo(3, 12)
    expect(information(1)).toBe(0)
    expect(entropy([1, 1, 1, 1])).toBeCloseTo(2, 12)
    expect(entropy([4, 2, 1, 1])).toBeCloseTo(1.75, 12)
    expect(entropy([5, 0, 0])).toBe(0)
    expect(entropy([0.5, 0.5])).toBeCloseTo(1, 12)
    // log2 (8/3) * 3/8 + 1/2 + 1/2 + 3/8
    expect(entropy([6, 4, 4, 2])).toBeCloseTo((3 / 8) * Math.log2(8 / 3) + 1.375, 12)
    expect(valueCounts(['x', 'y', 'x', 'z', 'x'])).toEqual([3, 1, 1])
  })
})
