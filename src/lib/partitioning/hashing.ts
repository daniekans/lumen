/*
 * Hash partitioning: a hash function maps a key to a 32-bit number, and the number modulo n picks
 * one of n buckets. The same key always lands in the same bucket, so all rows of a key meet in one
 * place, while neighboring keys scatter. The load of a bucket is the sum of the frequencies of its
 * keys; a key that holds a large share of the rows makes one bucket large whatever n is.
 */

/**
 * MurmurHash3 (x86, 32-bit) of a byte array, as an unsigned number. Spark and many other engines
 * use this hash for partitioning.
 */
export const murmur3 = (bytes: Uint8Array, seed = 0) => {
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593
  let h = seed >>> 0
  const blocks = bytes.length >> 2
  const mixK = (k: number) => Math.imul(rotl(Math.imul(k, c1), 15), c2)
  for (let i = 0; i < blocks; i++) {
    const j = 4 * i
    const k = bytes[j]! | (bytes[j + 1]! << 8) | (bytes[j + 2]! << 16) | (bytes[j + 3]! << 24)
    h ^= mixK(k)
    h = Math.imul(rotl(h, 13), 5) + 0xe6546b64
  }
  const tail = 4 * blocks
  const rest = bytes.length & 3
  if (rest > 0) {
    let k = 0
    for (let j = rest - 1; j >= 0; j--) k = (k << 8) | bytes[tail + j]!
    h ^= mixK(k)
  }
  h ^= bytes.length
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

const rotl = (x: number, r: number) => (x << r) | (x >>> (32 - r))

/** Spark's seed for `hash()` and hash partitioning. */
export const SEED = 42

/** The hash of a 32-bit integer key: its four bytes, little endian, through Murmur3. */
export const hashInt = (key: number, seed = SEED) => {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setInt32(0, key, true)
  return murmur3(b, seed)
}

/** The hash of a text key, from its UTF-8 bytes. */
export const hashString = (key: string, seed = SEED) => murmur3(new TextEncoder().encode(key), seed)

export type Key = number | string

export const hashKey = (key: Key) => (typeof key === 'number' ? hashInt(key) : hashString(key))

/** The bucket of a key among `n`: its hash modulo `n`. */
export const bucketOf = (key: Key, n: number) => hashKey(key) % n

/** The bucket of a key when the buckets cover ranges: the first range whose upper bound exceeds it. */
export const rangeBucketOf = (key: number, upperBounds: readonly number[]) => {
  const k = upperBounds.findIndex((b) => key < b)
  return k === -1 ? upperBounds.length : k
}

/** Rows per bucket: the sum of the frequencies of the keys that land in it. */
export const bucketLoads = (freqs: ReadonlyMap<Key, number>, n: number) => {
  const loads = Array<number>(n).fill(0)
  for (const [key, f] of freqs) loads[bucketOf(key, n)]! += f
  return loads
}

/** The largest load over the mean load. `1` is perfect balance; a stage takes about this many times longer than balanced. */
export const skewRatio = (loads: readonly number[]) => {
  const total = loads.reduce((s, l) => s + l, 0)
  return total === 0 ? 1 : Math.max(...loads) / (total / loads.length)
}

/** A salted key: the key and a salt in `0 .. salts - 1`, hashed together. */
export const saltedKey = (key: Key, salt: number) => `${key}#${salt}`

/**
 * Pairs a join compares when both tables are bucketed alike: bucket k meets only bucket k, so the
 * count is the sum of the products of bucket sizes instead of the product of the table sizes.
 */
export const pairsCompared = (a: readonly number[], b: readonly number[]) =>
  a.reduce((s, ak, k) => s + ak * (b[k] ?? 0), 0)

/** Rows per bucket of a list of keys (one key per row). */
export const bucketSizes = (keys: readonly Key[], n: number) => {
  const sizes = Array<number>(n).fill(0)
  for (const key of keys) sizes[bucketOf(key, n)]!++
  return sizes
}
