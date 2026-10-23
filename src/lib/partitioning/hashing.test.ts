import { describe, expect, it } from 'vitest'
import {
  bucketLoads,
  bucketOf,
  bucketSizes,
  hashInt,
  hashKey,
  hashString,
  murmur3,
  pairsCompared,
  rangeBucketOf,
  saltedKey,
  skewRatio,
} from './hashing'

const utf8 = (s: string) => new TextEncoder().encode(s)

describe('hashing', () => {
  it('matches published Murmur3 vectors', () => {
    expect(murmur3(utf8(''), 0)).toBe(0)
    expect(murmur3(utf8(''), 1)).toBe(0x514e28b7)
    expect(murmur3(utf8('test'), 0x9747b28c)).toBe(0x704b81dc)
    expect(murmur3(utf8('Hello, world!'), 0x9747b28c)).toBe(0x24884cba)
    expect(murmur3(utf8('The quick brown fox jumps over the lazy dog'), 0x9747b28c)).toBe(
      0x2fa826cd,
    )
  })

  it("matches Spark's hash() of an integer", () => {
    // SELECT hash(1) in Spark returns -559580957, a signed 32-bit int.
    expect(hashInt(1) | 0).toBe(-559580957)
  })

  it('hashes text and numbers deterministically', () => {
    expect(hashString('abc')).toBe(hashString('abc'))
    expect(hashKey(7)).toBe(hashInt(7))
    expect(hashKey('7')).not.toBe(hashInt(7))
  })

  it('puts a key in the bucket of its hash modulo n', () => {
    for (const n of [2, 3, 4, 8]) {
      for (let key = 0; key < 50; key++) {
        const b = bucketOf(key, n)
        expect(b).toBeGreaterThanOrEqual(0)
        expect(b).toBeLessThan(n)
        expect((hashInt(key) - b) % n).toBe(0)
      }
    }
  })

  it('refines buckets when n doubles: bucket k of 2n lies inside bucket k mod n', () => {
    for (let key = 0; key < 200; key++) expect(bucketOf(key, 8) % 4).toBe(bucketOf(key, 4))
  })

  it('places keys in ranges', () => {
    const bounds = [1004, 1008]
    expect([1001, 1004, 1007, 1008, 2000].map((k) => rangeBucketOf(k, bounds))).toEqual([
      0, 1, 1, 2, 2,
    ])
  })

  it('sums frequencies per bucket and measures skew', () => {
    const freqs = new Map<number, number>([
      [1, 10],
      [2, 20],
      [3, 30],
    ])
    const loads = bucketLoads(freqs, 4)
    expect(loads.reduce((s, l) => s + l, 0)).toBe(60)
    for (const [key, f] of freqs) expect(loads[bucketOf(key, 4)]).toBeGreaterThanOrEqual(f)
    expect(skewRatio([5, 5, 5, 5])).toBe(1)
    expect(skewRatio([10, 2, 2, 2])).toBe(2.5)
    expect(skewRatio([0, 0])).toBe(1)
  })

  it('spreads a salted key over several buckets', () => {
    const buckets = new Set(Array.from({ length: 8 }, (_, s) => bucketOf(saltedKey(42, s), 16)))
    expect(buckets.size).toBeGreaterThan(1)
  })

  it('counts pairs a bucketed join compares', () => {
    expect(pairsCompared([2, 3], [4, 1])).toBe(11)
    const a = [1, 2, 3, 4, 5, 1, 2]
    const b = [1, 1, 2, 3]
    const sa = bucketSizes(a, 4)
    const sb = bucketSizes(b, 4)
    let pairs = 0
    for (const x of a) for (const y of b) if (bucketOf(x, 4) === bucketOf(y, 4)) pairs++
    expect(pairsCompared(sa, sb)).toBe(pairs)
  })
})
