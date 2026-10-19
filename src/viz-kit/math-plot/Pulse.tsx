import { useState } from 'react'
import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import styles from './Pulse.module.css'

interface PulseProps {
  at: Vec2
  /** The pulse plays once each time this turns true, such as when a target is reached. */
  when: boolean
  color?: string
  /** Largest radius of the ring, in pixels. */
  r?: number
}

/**
 * A ring that expands from a point and fades, once, to mark a moment worth noticing: a vector
 * landing in a plane, a dot product reaching 0. Use it for events, never as a loop.
 */
export function Pulse({ at, when, color = vc.fg, r = 30 }: PulseProps) {
  const c = useCoords()
  // Each rise of `when` mounts a new ring, which plays its CSS animation once.
  const [count, setCount] = useState(0)
  const [was, setWas] = useState(when)
  if (when !== was) {
    setWas(when)
    if (when) setCount((n) => n + 1)
  }
  if (count === 0) return null
  const [x, y] = c.toPx(at)
  return (
    <g key={count} pointerEvents="none">
      <circle className={styles.ring} cx={x} cy={y} r={r} style={{ stroke: color }} />
      <circle
        className={`${styles.ring} ${styles.late}`}
        cx={x}
        cy={y}
        r={r}
        style={{ stroke: color }}
      />
    </g>
  )
}
