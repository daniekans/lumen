import { describe, expect, it } from 'vitest'
import { hashInt } from './hashing'
import {
  arcShares,
  clockwise,
  keysMovedByModulo,
  keysMovedOnRing,
  movesOnResize,
  ownerOfKey,
  RING,
  ringOwner,
  ringPoints,
  type RingPoint,
} from './ring'

const KEYS = Array.from({ length: 500 }, (_, i) => 1 + i)

/** Owner by brute force: the point with the smallest clockwise distance from the position. */
const nearestClockwise = (position: number, points: readonly RingPoint[]) => {
  let best = points[0]!
  for (const p of points) if (clockwise(position, p.at) < clockwise(position, best.at)) best = p
  return best.node
}

describe('rehashing', () => {
  it('keeps exactly n of every n(n + 1) hash values when going from n to n + 1', () => {
    for (let n = 1; n <= 12; n++) {
      const period = n * (n + 1)
      const stays = Array.from({ length: period }, (_, h) => h).filter(
        (h) => !movesOnResize(h, n, n + 1),
      )
      expect(stays).toEqual(Array.from({ length: n }, (_, h) => h))
      // The pattern repeats with the period.
      for (let h = 0; h < period; h++)
        expect(movesOnResize(h + 7 * period, n, n + 1)).toBe(movesOnResize(h, n, n + 1))
    }
  })

  it('keeps the keys with h mod 2n < n when doubling', () => {
    for (let h = 0; h < 200; h++) expect(movesOnResize(h, 4, 8)).toBe(h % 8 >= 4)
  })

  it('moves about n / (n + 1) of real keys', () => {
    expect(keysMovedByModulo(KEYS, 4, 5) / KEYS.length).toBeCloseTo(0.8, 1)
    expect(keysMovedByModulo([1001, 1002, 1003], 4, 4)).toBe(0)
  })
})

describe('hash ring', () => {
  const nodes = ['node-A', 'node-B', 'node-C', 'node-D']

  it('sorts points clockwise and gives v points per node', () => {
    const pts = ringPoints(nodes, 8)
    expect(pts).toHaveLength(32)
    for (let i = 1; i < pts.length; i++) expect(pts[i]!.at).toBeGreaterThanOrEqual(pts[i - 1]!.at)
  })

  it('gives each position to the first point at or after it', () => {
    const pts: RingPoint[] = [
      { node: 'a', at: 10 },
      { node: 'b', at: 40 },
      { node: 'c', at: 70 },
    ]
    expect(ringOwner(10, pts)).toBe('a')
    expect(ringOwner(11, pts)).toBe('b')
    expect(ringOwner(70, pts)).toBe('c')
    expect(ringOwner(71, pts)).toBe('a')
    expect(ringOwner(0, pts)).toBe('a')
    for (const v of [1, 4, 16]) {
      const ring = ringPoints(nodes, v)
      for (const k of KEYS) expect(ownerOfKey(k, ring)).toBe(nearestClockwise(hashInt(k), ring))
    }
  })

  it('splits the whole ring among the nodes', () => {
    for (const v of [1, 3, 32]) {
      const total = [...arcShares(ringPoints(nodes, v)).values()].reduce((s, x) => s + x, 0)
      expect(total).toBeCloseTo(1, 12)
    }
    expect(arcShares([{ node: 'a', at: 5 }]).get('a')).toBe(1)
    expect(
      arcShares(
        [
          { node: 'a', at: 10 },
          { node: 'b', at: 40 },
        ],
        100,
      ),
    ).toEqual(
      new Map([
        ['a', 0.7],
        ['b', 0.3],
      ]),
    )
  })

  it('moves keys only onto a node that joins', () => {
    for (const v of [1, 8]) {
      const before = ringPoints(nodes, v)
      const after = ringPoints([...nodes, 'node-E'], v)
      const moved = KEYS.filter((k) => ownerOfKey(k, before) !== ownerOfKey(k, after))
      expect(moved.length).toBe(keysMovedOnRing(KEYS, before, after))
      expect(moved.length).toBeGreaterThan(0)
      for (const k of moved) expect(ownerOfKey(k, after)).toBe('node-E')
    }
  })

  it('moves only the keys of a node that leaves', () => {
    const before = ringPoints(nodes)
    const after = ringPoints(nodes.filter((n) => n !== 'node-A'))
    for (const k of KEYS)
      if (ownerOfKey(k, before) !== ownerOfKey(k, after))
        expect(ownerOfKey(k, before)).toBe('node-A')
  })

  it('moves far fewer keys than modulo when a node joins', () => {
    const ring = keysMovedOnRing(KEYS, ringPoints(nodes, 64), ringPoints([...nodes, 'node-E'], 64))
    expect(ring / KEYS.length).toBeLessThan(0.35)
    expect(keysMovedByModulo(KEYS, 4, 5)).toBeGreaterThan(2 * ring)
    expect(RING).toBe(4294967296)
  })
})
