import type { Value } from '@/lib/relational'
import { tableLayout, type TableColumn } from '@/viz-kit'

/*
 * The two tables and the layout shared by the join explorations (joins-as-products, outer-joins):
 * customers down the left, orders drawn sideways along the top, the grid of pairs between them and
 * the result table below.
 */

export const customers = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Ben' },
  { id: 3, name: 'Caio' },
  { id: 4, name: 'Dara' },
] as const

/** Order 105 names a customer that does not exist and 106 has no customer: neither can match. */
export const orders: readonly { id: number; customer: Value }[] = [
  { id: 101, customer: 1 },
  { id: 102, customer: 2 },
  { id: 103, customer: 1 },
  { id: 104, customer: 4 },
  { id: 105, customer: 9 },
  { id: 106, customer: null },
]

export const ROW_H = 40
export const COL_W = 54
export const GRID = { x: 224, y: 170 }

export const customerColumns: TableColumn[] = [
  { label: 'id', width: 56, key: 'primary' },
  { label: 'name', width: 84 },
]
export const CUSTOMERS = { x: 60, y: GRID.y - ROW_H, rowHeight: ROW_H }

export const ORDERS_HEADER = {
  x: GRID.x,
  y: GRID.y - ROW_H - 2 * 30 - 16,
  colWidth: COL_W,
  lineHeight: 30,
  titleWidth: 130,
}
export const orderLines = [
  { label: 'order_id', values: orders.map((o) => o.id) },
  { label: 'customer_id', values: orders.map((o) => o.customer) },
]

export const resultColumns: TableColumn[] = [
  { label: 'id', width: 44 },
  { label: 'name', width: 70 },
  { label: 'order_id', width: 92 },
  { label: 'customer_id', width: 120 },
]

/** A result row from a pair of row indices; a missing side is padded with NULLs. */
export const resultCells = (left: number | null, right: number | null): Value[] => {
  const c = left === null ? null : customers[left]!
  const o = right === null ? null : orders[right]!
  return [c?.id ?? null, c?.name ?? null, o?.id ?? null, o?.customer ?? null]
}

export const GRID_RIGHT = GRID.x + orders.length * COL_W
export const GRID_BOTTOM = GRID.y + customers.length * ROW_H

/** The SQL line sits under the grid (below the padded cells of a right join), the result under it. */
export const SQL_Y = GRID_BOTTOM + 92
export const RESULT = { x: CUSTOMERS.x, y: SQL_Y + 30, rowHeight: 28 }
export const resultLayout = tableLayout({ ...RESULT, columns: resultColumns, titleHeight: 26 })
