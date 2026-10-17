/*
 * Column encodings and the information measures behind compression. Values are encoded one column
 * at a time, so every function here takes the values of one column in storage order.
 */

/** Bits needed to write every integer from 0 to `max` in binary. */
export const bitsFor = (max: number) => {
  if (!Number.isInteger(max) || max < 0) throw new Error(`bitsFor needs a whole number, got ${max}`)
  let bits = 0
  while (2 ** bits <= max) bits++
  return bits
}

/** Bits per code when `d` distinct values get the codes 0 to d - 1: the ceiling of log2 d. */
export const codeBits = (d: number) => bitsFor(d - 1)

/** Bytes that `count` values of `bits` bits take when packed back to back. */
export const packedBytes = (count: number, bits: number) => Math.ceil((count * bits) / 8)

/** A dictionary of the distinct values, in order of first appearance, and a code per value. */
export const dictionaryEncode = <T>(values: readonly T[]) => {
  const dictionary: T[] = []
  const index = new Map<T, number>()
  const codes = values.map((v) => {
    let code = index.get(v)
    if (code === undefined) {
      code = dictionary.length
      index.set(v, code)
      dictionary.push(v)
    }
    return code
  })
  return { dictionary, codes }
}

export interface Run<T> {
  value: T
  /** Index of the run's first value. */
  start: number
  length: number
}

/** Maximal runs of equal neighbors, in order. */
export const runLengths = <T>(values: readonly T[]): Run<T>[] => {
  const runs: Run<T>[] = []
  values.forEach((value, i) => {
    const last = runs.at(-1)
    if (last && last.value === value) last.length++
    else runs.push({ value, start: i, length: 1 })
  })
  return runs
}

/** The first value, then the difference of each value from the one before. */
export const deltaEncode = (values: readonly number[]) =>
  values.map((v, i) => (i === 0 ? v : v - values[i - 1]!))

/** Information of an outcome with probability `p`, in bits: log2 (1 / p). */
export const information = (p: number) => Math.log2(1 / p)

/**
 * Entropy in bits per value of a distribution given by counts (or probabilities): the average
 * information, sum of p log2 (1 / p). Zero counts add nothing.
 */
export const entropy = (counts: readonly number[]) => {
  const total = counts.reduce((s, c) => s + c, 0)
  return counts.reduce((s, c) => (c > 0 ? s + (c / total) * information(c / total) : s), 0)
}

/** How often each distinct value occurs, in order of first appearance. */
export const valueCounts = <T>(values: readonly T[]) => {
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.values()]
}
