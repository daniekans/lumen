import type { ReactNode } from 'react'
import type { Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { useDrag } from '../interaction/useDrag'
import { useCoords } from '../stage'
import styles from './Point.module.css'

interface PointProps {
  at: Vec2
  color?: string
  r?: number
  /** Makes the point draggable. Receives the pointer position in stage units. */
  onDrag?: (p: Vec2) => void
  /** Draw as a hollow ring instead of a filled dot. */
  hollow?: boolean
  label?: string
}

export function Point({ at, color = vc.fg, r = 5, onDrag, hollow = false, label }: PointProps) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  const dot = (
    <circle
      cx={x}
      cy={y}
      r={r}
      style={{ fill: hollow ? 'var(--bg)' : color, stroke: color }}
      strokeWidth={hollow ? 2 : 0}
    />
  )
  if (!onDrag) return <g pointerEvents="none">{dot}</g>
  return (
    <DraggablePoint x={x} y={y} r={r} color={color} onDrag={onDrag} label={label}>
      {dot}
    </DraggablePoint>
  )
}

function DraggablePoint({
  x,
  y,
  r,
  color,
  onDrag,
  label,
  children,
}: {
  x: number
  y: number
  r: number
  color: string
  onDrag: (p: Vec2) => void
  label?: string
  children: ReactNode
}) {
  const { dragging, handlers } = useDrag(onDrag)
  return (
    <g
      className={[styles.point, dragging && styles.dragging].filter(Boolean).join(' ')}
      {...handlers}
      aria-label={label}
    >
      <circle
        className={styles.halo}
        cx={x}
        cy={y}
        r={dragging ? r + 10 : r + 7}
        style={{ fill: alpha(color, 0.18) }}
      />
      {/* Generous invisible hit area so small points are easy to grab. */}
      <circle cx={x} cy={y} r={Math.max(18, r + 10)} fill="transparent" />
      {children}
    </g>
  )
}
