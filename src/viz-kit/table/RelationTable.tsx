import clsx from 'clsx'
import { alpha, vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { tableLayout, type TableLayoutOptions } from './layout'
import styles from './Table.module.css'

export interface TableColumn {
  label: string
  /** Width in stage units. */
  width: number
  /** Primary key columns are underlined, foreign key columns get a dashed underline. */
  key?: 'primary' | 'foreign'
}

export type CellValue = string | number | null

export type RowState = 'idle' | 'active' | 'dim' | 'error' | 'padded'

export interface TableRow {
  /** Stable identity, so a row keeps its element (and animates) when the order changes. */
  id: string | number
  cells: readonly CellValue[]
  state?: RowState
  /** Highlight color for `active` rows. Defaults to the table color. */
  color?: string
  /** Vertical slot, in rows from the top. Defaults to the row's index. Fractions are allowed. */
  slot?: number
  opacity?: number
}

interface RelationTableProps extends Omit<TableLayoutOptions, 'titleHeight'> {
  title?: string
  rows: readonly TableRow[]
  color?: string
  onRowClick?: (id: TableRow['id']) => void
}

const TITLE_HEIGHT = 26

/**
 * A database table drawn in SVG: an optional title, a header and rows of monospace cells. NULL
 * cells read as an italic NULL. Rows move to their `slot` with a CSS transition, and state changes
 * (active, dim, error, padded) cross-fade, so reordering and highlighting animate without a tween.
 */
export function RelationTable({
  x,
  y,
  columns,
  rowHeight = 34,
  title,
  rows,
  color = vc.blue,
  onRowClick,
}: RelationTableProps) {
  const c = useCoords()
  const u = c.unit
  const layout = tableLayout({
    x,
    y,
    columns,
    rowHeight,
    titleHeight: title ? TITLE_HEIGHT : 0,
  })
  const w = layout.width * u
  const h = rowHeight * u
  const [left, headerTop] = c.toPx([x, layout.headerTop])
  const font = Math.max(12, 15 * u)
  const bodyHeight = rows.length * h

  return (
    <g className={styles.table}>
      {title && (
        <text
          x={left}
          y={headerTop - 9 * u}
          className={styles.title}
          style={{ fontSize: Math.max(10, 12.5 * u) }}
        >
          {title}
        </text>
      )}
      <rect
        x={left}
        y={headerTop}
        width={w}
        height={h + bodyHeight}
        rx={8 * u}
        className={styles.frame}
      />
      {columns.map((col, j) => {
        const cx = c.x(layout.columnX(j) + col.width / 2)
        const cy = headerTop + h / 2
        const textWidth = col.label.length * font * 0.6
        return (
          <g key={j}>
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              className={styles.header}
              style={{ fontSize: font }}
            >
              {col.label}
            </text>
            {col.key && (
              <line
                x1={cx - textWidth / 2}
                x2={cx + textWidth / 2}
                y1={cy + font * 0.72}
                y2={cy + font * 0.72}
                className={styles.keyLine}
                strokeDasharray={col.key === 'foreign' ? `${3 * u} ${3 * u}` : undefined}
              />
            )}
          </g>
        )
      })}
      <line x1={left} x2={left + w} y1={headerTop + h} y2={headerTop + h} className={styles.rule} />

      {rows.map((row, i) => {
        const slot = row.slot ?? i
        const state = row.state ?? 'idle'
        const tint = row.color ?? color
        const fill =
          state === 'active'
            ? alpha(tint, 0.16)
            : state === 'error'
              ? alpha(vc.red, 0.16)
              : 'transparent'
        return (
          <g
            key={row.id}
            className={clsx(styles.row, onRowClick && styles.interactive)}
            style={{
              transform: `translate(0px, ${slot * rowHeight * u}px)`,
              opacity: (row.opacity ?? 1) * (state === 'dim' ? 0.32 : 1),
            }}
            onClick={onRowClick && (() => onRowClick(row.id))}
          >
            <rect
              x={left + 1}
              y={headerTop + h}
              width={w - 2}
              height={h}
              style={{ fill }}
              className={styles.rowFill}
            />
            {row.cells.map((value, j) => (
              <text
                key={j}
                x={c.x(layout.columnX(j) + columns[j]!.width / 2)}
                y={headerTop + h + h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={clsx(styles.cell, value === null && styles.null)}
                style={{ fontSize: font }}
              >
                {value === null ? 'NULL' : String(value)}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}
