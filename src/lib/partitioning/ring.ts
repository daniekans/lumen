/*
 * Rehashing and consistent hashing. With buckets h mod n, going from n to m buckets moves every key
 * whose remainder changes: for m = n + 1, all but 1 in n + 1 of them. A hash ring bends the range
 * of h into a circle, places nodes on it by hashing their names, and gives each key to the first
 * node at or after it, clockwise. A node that joins takes keys from one neighbor only, so about
 * 1 / (n + 1) of the keys move.
 */
import { hashKey, hashString, type Key } from './hashing'

/** Size of the hash range, and the circumference of the ring. */
export const RING = 2 ** 32

/** Whether a key with hash `h` changes bucket when the count goes from `n` to `m`. */
export const movesOnResize = (h: number, n: number, m: number) => h % n !== h % m

/** How many of the keys change bucket when the count goes from `n` to `m`. */
export const keysMovedByModulo = (keys: readonly Key[], n: number, m: number) =>
  keys.filter((k) => movesOnResize(hashKey(k), n, m)).length

/** A point of a node on the ring. */
export interface RingPoint {
  node: string
  at: number
}

/** The name hashed for virtual node `i` of a node: the name itself for the first one. */
export const virtualName = (node: string, i: number) => (i === 0 ? node : `${node}#${i}`)

/** The points of each node on the ring, `v` per node, sorted clockwise from 0. */
export const ringPoints = (nodes: readonly string[], v = 1): RingPoint[] =>
  nodes
    .flatMap((node) =>
      Array.from({ length: v }, (_, i) => ({ node, at: hashString(virtualName(node, i)) })),
    )
    .sort((a, b) => a.at - b.at || (a.node < b.node ? -1 : 1))

/** The node that owns a position: the first point at or after it, wrapping past the top of the range. */
export const ringOwner = (position: number, points: readonly RingPoint[]) => {
  const p = points.find((q) => q.at >= position) ?? points[0]
  if (!p) throw new Error('A ring needs at least one node')
  return p.node
}

/** The node that owns a key: the owner of its hash. */
export const ownerOfKey = (key: Key, points: readonly RingPoint[]) =>
  ringOwner(hashKey(key), points)

/** Clockwise distance from `a` to `b` on a ring of size `size`. */
export const clockwise = (a: number, b: number, size = RING) => (((b - a) % size) + size) % size

/** The share of the ring each node owns: the arcs that end at its points, over the circumference. */
export const arcShares = (points: readonly RingPoint[], size = RING) => {
  const shares = new Map<string, number>()
  points.forEach((p, i) => {
    const prev = points[(i + points.length - 1) % points.length]!
    const arc = points.length === 1 ? size : clockwise(prev.at, p.at, size)
    shares.set(p.node, (shares.get(p.node) ?? 0) + arc / size)
  })
  return shares
}

/** How many keys change owner between two rings. */
export const keysMovedOnRing = (
  keys: readonly Key[],
  before: readonly RingPoint[],
  after: readonly RingPoint[],
) => keys.filter((k) => ownerOfKey(k, before) !== ownerOfKey(k, after)).length
