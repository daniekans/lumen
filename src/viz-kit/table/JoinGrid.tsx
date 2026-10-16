import { alpha, vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import type { CellValue } from './RelationTable'
import styles from './Table.module.css'

/** `dim` is a match drawn faded, for matches outside the current focus. */
export type PairState = 'off' | 'candidate' | 'match' | 'dim'

interface JoinGridProps {
  /** Left edge of the first column and top edge of the first row, in stage units. */
  x: number
  y: number
  rows: number
  cols: number
  colWidth: number
  rowHeight: number
  /** State of the pair (left row i, right row j). */
  state: (i: number, j: number) => PairState
  /** Left rows that get a NULL-padded cell to the right of the grid. */
  padRows?: readonly number[]
  /** Right rows that get a NULL-padded cell below the grid. */
  padCols?: readonly number[]
  color?: string
  padColor?: string
}

/** Gap between the grid and its padded cells, in stage units. */
const JOIN_PAD_GAP = 18

/**
 * The Cartesian product of two tables as a grid: one cell per pair of a left row and a right row.
 * A join lights the pairs that satisfy its condition; outer joins add padded cells beside the grid
 * for rows without a partner. State changes cross-fade through CSS transitions.
 */
export function JoinGrid({
  x,
  y,
  rows,
  cols,
  colWidth,
  rowHeight,
  state,
  padRows = [],
  padCols = [],
  color = vc.blue,
  padColor = vc.yellow,
}: JoinGridProps) {
  const c = useCoords()
  const u = c.unit
  const r = Math.min(colWidth, rowHeight) * 0.22 * u
  const cx = (j: number) => c.x(x + (j + 0.5) * colWidth)
  const cy = (i: number) => c.y(y + (i + 0.5) * rowHeight)
  const padX = c.x(x + cols * colWidth + JOIN_PAD_GAP + colWidth / 2)
  const padY = c.y(y + rows * rowHeight + JOIN_PAD_GAP + rowHeight / 2)
  const padW = colWidth * 0.86 * u
  const padH = rowHeight * 0.62 * u
  const font = Math.max(10, 11.5 * u)

  const padCell = (px: number, py: number, key: string, shown: boolean) => (
    <g key={key} className={styles.fade} style={{ opacity: shown ? 1 : 0 }}>
      <rect
        x={px - padW / 2}
        y={py - padH / 2}
        width={padW}
        height={padH}
        rx={5 * u}
        style={{ fill: alpha(padColor, 0.14), stroke: padColor }}
        strokeWidth={1.25}
        strokeDasharray={`${4 * u} ${3 * u}`}
      />
      <text
        x={px}
        y={py}
        textAnchor="middle"
        dominantBaseline="central"
        className={styles.null}
        style={{ fontSize: font, fill: padColor }}
      >
        NULL
      </text>
    </g>
  )

  return (
    <g pointerEvents="none">
      {Array.from({ length: rows }, (_, i) => (
        <line
          key={`h${i}`}
          x1={c.x(x)}
          x2={c.x(x + cols * colWidth)}
          y1={cy(i)}
          y2={cy(i)}
          style={{ stroke: vc.grid }}
        />
      ))}
      {Array.from({ length: cols }, (_, j) => (
        <line
          key={`v${j}`}
          x1={cx(j)}
          x2={cx(j)}
          y1={c.y(y)}
          y2={c.y(y + rows * rowHeight)}
          style={{ stroke: vc.grid }}
        />
      ))}
      {Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => {
          const s = state(i, j)
          return (
            <circle
              key={`${i},${j}`}
              cx={cx(j)}
              cy={cy(i)}
              r={r}
              className={styles.pair}
              style={{
                fill:
                  s === 'match' || s === 'dim'
                    ? color
                    : s === 'candidate'
                      ? alpha(color, 0.38)
                      : 'var(--bg-elevated)',
                stroke: s === 'off' ? vc.gridStrong : color,
                opacity: s === 'dim' ? 0.3 : 1,
              }}
              strokeWidth={1.25}
            />
          )
        }),
      )}
      {Array.from({ length: rows }, (_, i) => padCell(padX, cy(i), `r${i}`, padRows.includes(i)))}
      {Array.from({ length: cols }, (_, j) => padCell(cx(j), padY, `c${j}`, padCols.includes(j)))}
    </g>
  )
}

interface TransposedHeaderProps {
  /** Left edge of the first column (aligned with the grid) and top edge, in stage units. */
  x: number
  y: number
  colWidth: number
  lineHeight: number
  /** Width of the column titles to the left of the values. */
  titleWidth: number
  title?: string
  /** One line per column of the table, e.g. order_id, then customer_id. */
  lines: readonly { label: string; values: readonly CellValue[] }[]
  /** Columns to tint, e.g. right rows without a partner. */
  highlight?: readonly number[]
  highlightColor?: string
}

/** A table drawn sideways above a JoinGrid: each table row becomes a column of values. */
export function TransposedHeader({
  x,
  y,
  colWidth,
  lineHeight,
  titleWidth,
  title,
  lines,
  highlight = [],
  highlightColor = vc.yellow,
}: TransposedHeaderProps) {
  const c = useCoords()
  const u = c.unit
  const cols = lines[0]?.values.length ?? 0
  const [left, top] = c.toPx([x - titleWidth, y])
  const w = (titleWidth + cols * colWidth) * u
  const h = lines.length * lineHeight * u
  const font = Math.max(12, 15 * u)
  return (
    <g className={styles.table}>
      {title && (
        <text
          x={c.x(x)}
          y={top - 9 * u}
          className={styles.title}
          style={{ fontSize: Math.max(10, 12.5 * u) }}
        >
          {title}
        </text>
      )}
      <rect x={left} y={top} width={w} height={h} rx={8 * u} className={styles.frame} />
      {highlight.map((j) => (
        <rect
          key={j}
          x={c.x(x + j * colWidth) + 1}
          y={top + 1}
          width={colWidth * u - 2}
          height={h - 2}
          style={{ fill: alpha(highlightColor, 0.16) }}
        />
      ))}
      <line x1={c.x(x)} x2={c.x(x)} y1={top} y2={top + h} className={styles.rule} />
      {lines.map((line, k) => {
        const ly = top + (k + 0.5) * lineHeight * u
        return (
          <g key={line.label}>
            <text
              x={c.x(x) - 10 * u}
              y={ly}
              textAnchor="end"
              dominantBaseline="central"
              className={styles.header}
              style={{ fontSize: font }}
            >
              {line.label}
            </text>
            {line.values.map((v, j) => (
              <text
                key={j}
                x={c.x(x + (j + 0.5) * colWidth)}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className={v === null ? styles.null : styles.cell}
                style={{ fontSize: font }}
              >
                {v === null ? 'NULL' : String(v)}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}
