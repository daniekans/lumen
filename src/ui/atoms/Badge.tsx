import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export const Badge = ({ children }: { children: ReactNode }) => (
  <span className={styles.badge}>{children}</span>
)
