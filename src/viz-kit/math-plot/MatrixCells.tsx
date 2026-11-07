import { fmtShort, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { cellCenter } from './matrixLayout'
import { Path } from './Path'

export interface MatrixBand {
  /** Row or column index. */
  index: number
  color: string
  opacity?: number
}

interface MatrixCellsProps {
  /** Entries row by row; a string is drawn as it is, null leaves the cell empty. */
  values: readonly (readonly (number | string | null)[])[]
  /** Top-left corner of the matrix, in stage units (y up). */
  origin: Vec2
  /** Side of a cell, in stage units. */
  cell?: number
  /**
   * Where a point of the layout is drawn, for animations that move the whole matrix (a fold
   * across a diagonal for the transpose). Cells, bands and brackets all go through it.
   */
  place?: (p: Vec2) => Vec2
  color?: (i: number, j: number) => string | undefined
  opacity?: (i: number, j: number) => number
  rowBands?: readonly MatrixBand[]
  colBands?: readonly MatrixBand[]
  /** Cells filled with a tint, such as the entry being computed. */
  cellBands?: readonly (MatrixBand & { col: number })[]
  /** Font size as a share of the cell, in pixels per pixel of cell. */
  fontScale?: number
  digits?: number
  /** Opacity of the brackets, which `place` does not move: they hug the placed cells. */
  bracketOpacity?: number
}

/**
 * A matrix drawn on the stage as a grid of numbers between brackets, in stage units, so several
 * matrices can be laid out together (a product with `B` above and `A` to the left of `AB`, where
 * row i and column j meet at entry (i, j)). Rows, columns and cells can be tinted.
 */
export function MatrixCells({
  values,
  origin,
  cell = 1,
  place = (p) => p,
  color,
  opacity,
  rowBands = [],
  colBands = [],
  cellBands = [],
  fontScale = 0.36,
  digits = 2,
  bracketOpacity = 1,
}: MatrixCellsProps) {
  const c = useCoords()
  const m = values.length
  const n = values[0]?.length ?? 0
  const [x0, y0] = origin
  const x1 = x0 + n * cell
  const y1 = y0 - m * cell
  const rect = (a: Vec2, b: Vec2): Vec2[] =>
    [a, [b[0], a[1]] as Vec2, b, [a[0], b[1]] as Vec2].map(place)
  // The brackets hug the cells where `place` puts them, so a folded matrix keeps upright brackets.
  const corners = [place([x0, y0]), place([x1, y1])]
  const bx0 = Math.min(corners[0]![0], corners[1]![0])
  const bx1 = Math.max(corners[0]![0], corners[1]![0])
  const by0 = Math.max(corners[0]![1], corners[1]![1])
  const by1 = Math.min(corners[0]![1], corners[1]![1])
  const pad = 0.08 * cell
  const tick = 0.18 * cell
  const size = Math.max(9, c.unit * cell * fontScale)

  return (
    <g>
      {rowBands.map((b, k) => (
        <Path
          key={`r${k}`}
          points={rect([x0, y0 - b.index * cell], [x1, y0 - (b.index + 1) * cell])}
          closed
          color="none"
          width={0}
          fill={b.color}
          fillOpacity={b.opacity ?? 0.18}
        />
      ))}
      {colBands.map((b, k) => (
        <Path
          key={`c${k}`}
          points={rect([x0 + b.index * cell, y0], [x0 + (b.index + 1) * cell, y1])}
          closed
          color="none"
          width={0}
          fill={b.color}
          fillOpacity={b.opacity ?? 0.18}
        />
      ))}
      {cellBands.map((b, k) => (
        <Path
          key={`e${k}`}
          points={rect(
            [x0 + b.col * cell, y0 - b.index * cell],
            [x0 + (b.col + 1) * cell, y0 - (b.index + 1) * cell],
          )}
          closed
          color="none"
          width={0}
          fill={b.color}
          fillOpacity={b.opacity ?? 0.25}
        />
      ))}
      {bracketOpacity > 0.01 &&
        [-1, 1].map((side) => {
          const [bx, by] = side < 0 ? [bx0 - pad, tick] : [bx1 + pad, -tick]
          return (
            <Path
              key={side}
              points={[
                [bx + by, by0 + pad],
                [bx, by0 + pad],
                [bx, by1 - pad],
                [bx + by, by1 - pad],
              ]}
              color={vc.muted}
              width={1.5}
              opacity={bracketOpacity}
            />
          )
        })}
      {values.map((row, i) =>
        row.map((v, j) => {
          if (v === null) return null
          const [px, py] = c.toPx(place(cellCenter(origin, cell, i, j)))
          return (
            <text
              key={`${i}-${j}`}
              x={px}
              y={py}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
              style={{
                fill: color?.(i, j) ?? vc.fg,
                fontSize: size,
                fontFamily: 'var(--font-mono)',
                opacity: opacity?.(i, j) ?? 1,
                transition: 'opacity var(--dur-base) var(--ease-out)',
              }}
            >
              {typeof v === 'number' ? fmtShort(v, digits) : v}
            </text>
          )
        }),
      )}
    </g>
  )
}
