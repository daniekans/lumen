import type { ReactNode } from 'react'
import styles from './VizLayout.module.css'

interface VizLayoutProps {
  topBar: ReactNode
  /** The visualization itself, which fills the stage area. */
  stage: ReactNode
  /** Elements floating over the stage, such as the control dock. */
  floating?: ReactNode
  aside?: ReactNode
}

export const VizLayout = ({ topBar, stage, floating, aside }: VizLayoutProps) => (
  <div className={styles.layout}>
    <div className={styles.column}>
      {topBar}
      <div className={styles.stage}>
        {stage}
        {floating}
      </div>
    </div>
    {aside}
  </div>
)
