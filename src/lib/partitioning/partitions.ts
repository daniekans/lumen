/*
 * Partitioning a table by the values of some columns, as Hive-style layouts do: every distinct
 * combination of values gets its own folder (`day=3/city=OSL`), and the rows with that combination
 * go there. The folders form a partition of the rows in the set sense: disjoint, and together they
 * hold every row. A filter on the partition columns is checked against folder names, so folders
 * that cannot match are never opened (partition pruning).
 */

export type Row = Readonly<Record<string, string | number>>

/** The folder path of a row: `col=value` for each partition column, in order. */
export const partitionPath = (row: Row, columns: readonly string[]) =>
  columns.map((c) => `${c}=${row[c]}`).join('/')

/**
 * The rows grouped by their partition path. Paths are sorted by their values (numbers as numbers),
 * column by column, and rows keep their order inside a partition.
 */
export const partitionBy = (rows: readonly Row[], columns: readonly string[]) => {
  const compare = (a: Row, b: Row) => {
    for (const c of columns) {
      const x = a[c]!
      const y = b[c]!
      if (x === y) continue
      return typeof x === 'number' && typeof y === 'number' ? x - y : String(x) < String(y) ? -1 : 1
    }
    return 0
  }
  const parts = new Map<string, Row[]>()
  for (const row of [...rows].sort(compare)) {
    const path = partitionPath(row, columns)
    parts.set(path, [...(parts.get(path) ?? []), row])
  }
  return parts
}

/** An equality filter on some columns, such as `{ day: 3, city: 'OSL' }`. */
export type Filter = Readonly<Record<string, string | number>>

/**
 * Whether a partition can hold matching rows. Only the filter's partition columns can be decided
 * from the path; a filter on any other column needs the files to be read.
 */
export const partitionMayMatch = (path: string, filter: Filter) =>
  path
    .split('/')
    .map((part) => part.split('='))
    .every(([c, v]) => !(c! in filter) || String(filter[c!]) === v)

/** Paths of the partitions a query with `filter` reads after pruning. */
export const prunedPaths = (paths: Iterable<string>, filter: Filter) =>
  [...paths].filter((p) => partitionMayMatch(p, filter))

/** The most partitions a layout can have: the product of the columns' distinct counts. */
export const partitionCount = (cardinalities: readonly number[]) =>
  cardinalities.reduce((p, d) => p * d, 1)

/**
 * Files a partition of `bytes` is written as, with files of at most `target` bytes. A nonempty
 * partition needs at least one file, however small.
 */
export const filesFor = (bytes: number, target: number) =>
  bytes <= 0 ? 0 : Math.ceil(bytes / target)

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/** Bytes in decimal units (1 KB = 1000 B) with up to three significant digits: `40 MB`, `60.8 GB`. */
export const formatBytes = (bytes: number) => {
  let k = 0
  let v = bytes
  while (v >= 999.5 && k < UNITS.length - 1) {
    v /= 1000
    k++
  }
  return `${Number(v.toPrecision(3))} ${UNITS[k]}`
}
