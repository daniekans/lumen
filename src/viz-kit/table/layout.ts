import type { Vec2 } from '@/lib/math'
import type { TableColumn } from './RelationTable'

export interface TableLayoutOptions {
  /** Top-left corner of the header, in stage units (use with `yUp={false}`). */
  x: number
  y: number
  columns: readonly TableColumn[]
  rowHeight?: number
  /** Height of the title line above the header. 0 when there is no title. */
  titleHeight?: number
}

/** Geometry of a table, for drawing connectors to rows and cells. */
export const tableLayout = ({
  x,
  y,
  columns,
  rowHeight = 34,
  titleHeight = 0,
}: TableLayoutOptions) => {
  const width = columns.reduce((s, c) => s + c.width, 0)
  const headerTop = y + titleHeight
  const bodyTop = headerTop + rowHeight
  const columnX = (j: number) => x + columns.slice(0, j).reduce((s, c) => s + c.width, 0)
  return {
    x,
    width,
    rowHeight,
    headerTop,
    bodyTop,
    columnX,
    rowTop: (slot: number) => bodyTop + slot * rowHeight,
    rowCenterY: (slot: number) => bodyTop + (slot + 0.5) * rowHeight,
    cellCenter: (slot: number, j: number): Vec2 => [
      columnX(j) + columns[j]!.width / 2,
      bodyTop + (slot + 0.5) * rowHeight,
    ],
    leftOf: (slot: number): Vec2 => [x, bodyTop + (slot + 0.5) * rowHeight],
    rightOf: (slot: number): Vec2 => [x + width, bodyTop + (slot + 0.5) * rowHeight],
    bottom: (rows: number) => bodyTop + rows * rowHeight,
  }
}
