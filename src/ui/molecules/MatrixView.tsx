import { fmtShort } from '@/lib/math'
import { Tex } from '../atoms'
import styles from './MatrixView.module.css'

interface MatrixViewProps {
  /** Entries row by row. */
  rows: readonly (readonly number[])[]
  /** TeX shown before the matrix, such as `A =`. */
  name?: string
  /** A color per column, such as the color of the basis vector the column describes. */
  colors?: readonly (string | undefined)[]
  /** Accessible name of the table. */
  label?: string
}

/** A matrix in a readout panel, its columns tinted like the vectors they describe. */
export function MatrixView({ rows, name, colors, label }: MatrixViewProps) {
  const cols = rows[0]?.length ?? 0
  return (
    <div className={styles.row}>
      {name && <Tex>{name}</Tex>}
      <div
        className={styles.matrix}
        style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
        role="table"
        aria-label={label ?? name}
      >
        {rows.flatMap((row, i) =>
          row.map((v, j) => (
            <span key={`${i}-${j}`} className={styles.cell} style={{ color: colors?.[j] }}>
              {fmtShort(v, 2)}
            </span>
          )),
        )}
      </div>
    </div>
  )
}
