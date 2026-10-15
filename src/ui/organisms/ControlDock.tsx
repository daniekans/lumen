import clsx from 'clsx'
import type { Ref } from 'react'
import styles from './ControlDock.module.css'
import surfaces from '@/styles/surfaces.module.css'

/**
 * Floating glass bar at the bottom of the stage. It is an empty portal target; each
 * visualization fills it through <VizControls>. It hides itself while empty.
 */
export const ControlDock = ({ ref }: { ref: Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={clsx(surfaces.glass, styles.dock)}
    role="toolbar"
    aria-label="Visualization controls"
  />
)
