/*
 * Row groups and the statistics a Parquet footer keeps for them. A file cuts its rows into row
 * groups of a fixed number of rows (the last one may be shorter), and for every column chunk the
 * footer stores the minimum and maximum value. A reader compares a predicate with those ranges and
 * skips the row groups where no row can match, without reading them.
 */

export interface Range {
  min: number
  max: number
}

export type Predicate =
  | { op: '=' | '<' | '<=' | '>' | '>='; value: number }
  | { op: 'between'; low: number; high: number }

/** Rows of the column cut into consecutive groups of `rowsPerGroup`. */
export const rowGroups = <T>(values: readonly T[], rowsPerGroup: number): T[][] => {
  if (!Number.isInteger(rowsPerGroup) || rowsPerGroup < 1)
    throw new Error(`rowGroups needs a positive whole size, got ${rowsPerGroup}`)
  const groups: T[][] = []
  for (let i = 0; i < values.length; i += rowsPerGroup)
    groups.push(values.slice(i, i + rowsPerGroup))
  return groups
}

/** The min and max of each row group, as the footer stores them. */
export const groupRanges = (values: readonly number[], rowsPerGroup: number): Range[] =>
  rowGroups(values, rowsPerGroup).map((g) => ({ min: Math.min(...g), max: Math.max(...g) }))

/** Whether some value in `range` could satisfy the predicate. If not, the row group is skipped. */
export const mayMatch = ({ min, max }: Range, p: Predicate) => {
  switch (p.op) {
    case '=':
      return min <= p.value && p.value <= max
    case '<':
      return min < p.value
    case '<=':
      return min <= p.value
    case '>':
      return max > p.value
    case '>=':
      return max >= p.value
    case 'between':
      return min <= p.high && p.low <= max
  }
}

/** Indexes of the row groups a reader has to read for the predicate. */
export const groupsRead = (ranges: readonly Range[], p: Predicate) =>
  ranges.flatMap((r, k) => (mayMatch(r, p) ? [k] : []))

/** Number of row groups that `n` rows fill, `rowsPerGroup` at a time. */
export const groupCount = (n: number, rowsPerGroup: number) => Math.ceil(n / rowsPerGroup)

/** Row groups that hold any of the rows `first` to `last` (from 0), in a file of fixed-size groups. */
export const groupsSpanned = (first: number, last: number, rowsPerGroup: number) =>
  Math.floor(last / rowsPerGroup) - Math.floor(first / rowsPerGroup) + 1
