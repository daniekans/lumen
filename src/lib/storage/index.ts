/*
 * A small cost model for how tables sit on disk. A table has `n` rows and columns of fixed byte
 * widths. Storage is read in pages of `pageSize` bytes.
 *
 * - Row layout: rows back to back, each row's values in column order.
 * - Column layout: each column's values back to back. For page counts, every column starts on a
 *   new page (as column chunks do in Parquet); for byte offsets, columns sit back to back.
 */

export type Layout = 'row' | 'column'

export interface Column {
  name: string
  /** Bytes per value. */
  width: number
}

/** Bytes of one row: the sum of the column widths. */
export const rowWidth = (columns: readonly Column[]) => columns.reduce((s, c) => s + c.width, 0)

/** Bytes of the whole table. */
export const tableBytes = (n: number, columns: readonly Column[]) => n * rowWidth(columns)

const selectedColumns = (columns: readonly Column[], selected: readonly string[]) => {
  const chosen = columns.filter((c) => selected.includes(c.name))
  if (chosen.length !== selected.length) throw new Error(`Unknown column in ${selected.join(', ')}`)
  return chosen
}

/**
 * Bytes a full scan reads to get the `selected` columns. A row layout cannot skip columns, so it
 * reads every byte; a column layout reads only the selected columns.
 */
export const scanBytes = (
  n: number,
  columns: readonly Column[],
  selected: readonly string[],
  layout: Layout,
) => (layout === 'row' ? tableBytes(n, columns) : n * rowWidth(selectedColumns(columns, selected)))

/** Pages needed to hold `bytes` bytes. */
export const pagesFor = (bytes: number, pageSize: number) => Math.ceil(bytes / pageSize)

/** Pages a full scan of the `selected` columns reads. */
export const scanPages = (
  n: number,
  columns: readonly Column[],
  selected: readonly string[],
  layout: Layout,
  pageSize: number,
) =>
  layout === 'row'
    ? pagesFor(tableBytes(n, columns), pageSize)
    : selectedColumns(columns, selected).reduce((s, c) => s + pagesFor(n * c.width, pageSize), 0)

/**
 * Byte offset of the value in row `row` and column index `col` (both from 0), with no padding:
 * row-major for a row layout, column-major for a column layout.
 */
export const valueOffset = (
  n: number,
  columns: readonly Column[],
  row: number,
  col: number,
  layout: Layout,
) => {
  const before = rowWidth(columns.slice(0, col))
  return layout === 'row'
    ? row * rowWidth(columns) + before
    : n * before + row * columns[col]!.width
}

/**
 * Pages that hold the given cells, `[row, col]` pairs, in a layout where every value takes the same
 * number of bytes and pages hold `perPage` values (the explorations use this simple model).
 */
export const pagesOfCells = (
  rows: number,
  cols: number,
  cells: readonly (readonly [number, number])[],
  layout: Layout,
  perPage: number,
) => {
  const slot = ([r, c]: readonly [number, number]) => (layout === 'row' ? r * cols : c * rows + r)
  return [...new Set(cells.map((cell) => Math.floor(slot(cell) / perPage)))].sort((a, b) => a - b)
}
