import clsx from 'clsx'
import type { ReactNode, Ref } from 'react'
import styles from './VizLayout.module.css'

interface VizLayoutProps {
  topBar: ReactNode
  /** The visualization itself, which fills the stage area. */
  stage: ReactNode
  /** Elements floating over the stage, such as the control dock. */
  floating?: ReactNode
  aside?: ReactNode
  /** The stage area (visualization and floating elements), the element shown in fullscreen. */
  stageRef?: Ref<HTMLDivElement>
  /** Shows the stage area over the whole window (the fallback when browser fullscreen fails). */
  fullscreen?: boolean
}

export const VizLayout = ({
  topBar,
  stage,
  floating,
  aside,
  stageRef,
  fullscreen = false,
}: VizLayoutProps) => (
  <div className={styles.layout} data-print-flow>
    <div className={styles.column} data-print-flow>
      {topBar}
      <div
        ref={stageRef}
        className={clsx(styles.stage, fullscreen && styles.fullscreen)}
        data-print-flow
      >
        {stage}
        {floating}
      </div>
    </div>
    {aside}
  </div>
)
