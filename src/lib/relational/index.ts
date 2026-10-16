/*
 * Relational operations on small in-memory tables, used by the data engineering visualizations and
 * practice generators. Joins return pairs of row indices so callers can draw or count them. SQL
 * semantics apply: NULL never equals anything, not even NULL.
 */

export type Value = string | number | null

export type Row = Readonly<Record<string, Value>>

export type JoinKind = 'cross' | 'inner' | 'left' | 'right' | 'full' | 'anti' | 'semi'

/** One row of a join result: the index of the left and right rows, or null where padded. */
export interface JoinPair {
  left: number | null
  right: number | null
}

/** SQL equality: NULL compared with anything is unknown, which a join treats as false. */
export const sqlEquals = (a: Value, b: Value) => a !== null && b !== null && a === b

/** Every pair of a left and a right row, left row major. */
export const product = (leftCount: number, rightCount: number): JoinPair[] => {
  const pairs: JoinPair[] = []
  for (let i = 0; i < leftCount; i++)
    for (let j = 0; j < rightCount; j++) pairs.push({ left: i, right: j })
  return pairs
}

/**
 * Joins two tables with a condition on a pair of rows. Matched pairs come first in left row order;
 * left and full joins pad unmatched left rows in place, right and full joins append unmatched right
 * rows at the end. Anti and semi joins return left rows only.
 */
export const join = <L, R>(
  left: readonly L[],
  right: readonly R[],
  kind: JoinKind,
  on: (l: L, r: R) => boolean = () => true,
): JoinPair[] => {
  if (kind === 'cross') return product(left.length, right.length)
  const out: JoinPair[] = []
  const rightMatched = new Array<boolean>(right.length).fill(false)
  left.forEach((l, i) => {
    let matched = false
    right.forEach((r, j) => {
      if (!on(l, r)) return
      matched = true
      rightMatched[j] = true
      if (kind !== 'anti' && kind !== 'semi') out.push({ left: i, right: j })
    })
    if (kind === 'semi' && matched) out.push({ left: i, right: null })
    if (!matched && (kind === 'left' || kind === 'full' || kind === 'anti'))
      out.push({ left: i, right: null })
  })
  if (kind === 'right' || kind === 'full')
    rightMatched.forEach((m, j) => {
      if (!m) out.push({ left: null, right: j })
    })
  return out
}

/** Equijoin on one column from each side. */
export const joinOn = (
  left: readonly Row[],
  right: readonly Row[],
  kind: JoinKind,
  leftColumn: string,
  rightColumn: string,
) => join(left, right, kind, (l, r) => sqlEquals(l[leftColumn] ?? null, r[rightColumn] ?? null))

/** How often each non-NULL value occurs. */
export const valueCounts = (values: readonly Value[]) => {
  const counts = new Map<Value, number>()
  for (const v of values) if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1)
  return counts
}

/**
 * Row count of an equijoin computed from key multiplicities alone: a key value that occurs a times
 * on the left and b times on the right contributes a * b matched rows. Independent of `join`, so
 * the two can check each other.
 */
export const joinSize = (left: readonly Value[], right: readonly Value[], kind: JoinKind) => {
  if (kind === 'cross') return left.length * right.length
  const a = valueCounts(left)
  const b = valueCounts(right)
  let matched = 0
  for (const [k, n] of a) matched += n * (b.get(k) ?? 0)
  const unmatched = (values: readonly Value[], other: Map<Value, number>) =>
    values.filter((v) => v === null || !other.has(v)).length
  const leftOnly = unmatched(left, b)
  const rightOnly = unmatched(right, a)
  switch (kind) {
    case 'inner':
      return matched
    case 'left':
      return matched + leftOnly
    case 'right':
      return matched + rightOnly
    case 'full':
      return matched + leftOnly + rightOnly
    case 'anti':
      return leftOnly
    case 'semi':
      return left.length - leftOnly
  }
}

/** A set of columns is a key when no column is NULL and no two rows agree on all of them. */
export const isKey = (rows: readonly Row[], columns: readonly string[]) => {
  const seen = new Set<string>()
  for (const row of rows) {
    const values = columns.map((c) => row[c] ?? null)
    if (values.some((v) => v === null)) return false
    const id = JSON.stringify(values)
    if (seen.has(id)) return false
    seen.add(id)
  }
  return true
}

/** The functional dependency from -> to holds when rows that agree on `from` agree on `to`. */
export const determines = (
  rows: readonly Row[],
  from: readonly string[],
  to: readonly string[],
) => {
  const image = new Map<string, string>()
  for (const row of rows) {
    const x = JSON.stringify(from.map((c) => row[c] ?? null))
    const y = JSON.stringify(to.map((c) => row[c] ?? null))
    const seen = image.get(x)
    if (seen !== undefined && seen !== y) return false
    image.set(x, y)
  }
  return true
}

/** Indices of child rows whose reference is not NULL and matches no parent key. */
export const orphans = (childRefs: readonly Value[], parentKeys: readonly Value[]) => {
  const keys = new Set(parentKeys.filter((k) => k !== null))
  return childRefs.flatMap((v, i) => (v !== null && !keys.has(v) ? [i] : []))
}

/*
 * Problem data is a flat record of numbers, so columns are stored one value per entry:
 * { a0: 3, a1: 0, an: 2 } is the column [3, NULL]. Keys used this way must be positive.
 */
export const encodeColumn = (prefix: string, values: readonly (number | null)[]) => {
  const out: Record<string, number> = { [`${prefix}n`]: values.length }
  values.forEach((v, i) => (out[`${prefix}${i}`] = v ?? 0))
  return out
}

export const decodeColumn = (data: Readonly<Record<string, number>>, prefix: string) =>
  Array.from({ length: data[`${prefix}n`] ?? 0 }, (_, i) => {
    const v = data[`${prefix}${i}`] ?? 0
    return v === 0 ? null : v
  })
