import { fmt, type Mat2 } from '@/lib/math'
import { Tex } from '@/ui/atoms'
import styles from './MatrixView.module.css'

interface MatrixViewProps {
  m: Mat2
  /** Colors of the first and second column. */
  colors: readonly [string, string]
}

/** 2x2 matrix with each column tinted like the basis vector it describes. */
export function MatrixView({ m, colors }: MatrixViewProps) {
  const cells = [m.i[0], m.j[0], m.i[1], m.j[1]]
  return (
    <div className={styles.row}>
      <Tex>{'A ='}</Tex>
      <div className={styles.matrix} role="table" aria-label="Matrix A">
        {cells.map((v, k) => (
          <span key={k} className={styles.cell} style={{ color: colors[k % 2] }}>
            {fmt(v)}
          </span>
        ))}
      </div>
    </div>
  )
}
