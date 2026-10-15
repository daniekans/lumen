import type { ReactNode } from 'react'
import { RichText } from '../atoms'
import styles from './Readout.module.css'

interface ReadoutProps {
  /** Plain text with optional $TeX$. */
  label: string
  value: ReactNode
  color?: string
}

export function Readout({ label, value, color }: ReadoutProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>
        {color && <span className={styles.swatch} style={{ background: color }} />}
        <RichText>{label}</RichText>
      </span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}

/** Glass panel grouping several readouts. */
export const ReadoutPanel = ({ children }: { children: ReactNode }) => (
  <div className={styles.readouts}>{children}</div>
)
