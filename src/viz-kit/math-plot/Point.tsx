import clsx from 'clsx'
import { useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { fmtPoint, type Vec2 } from '@/lib/math'
import surfaces from '@/styles/surfaces.module.css'
import { alpha, vc } from '@/styles/viz-colors'
import { useDrag } from '../interaction/useDrag'
import { useStage } from '../stage'
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
  /**
   * Shows the point's coordinates on hover. On by default on coordinate planes (zoomable stages),
   * off on diagrams. A function formats them, e.g. as a complex number.
   */
  coords?: boolean | ((at: Vec2) => string)
}

export function Point({
  at,
  color = vc.fg,
  r = 5,
  onDrag,
  hollow = false,
  label,
  coords,
}: PointProps) {
  const { coords: c, labelLayer, hover } = useStage()
  const id = useId()
  const [x, y] = c.toPx(at)
  const show = coords ?? hover.coordinates
  const ref = useRef<SVGGElement>(null)
  const { register } = hover
  useLayoutEffect(() => {
    register(id, show ? { px: [x, y], el: ref.current } : null)
  }, [register, id, show, x, y])
  useLayoutEffect(() => () => register(id, null), [register, id])
  const hovered = show && hover.hovered === id
  // The coordinates, shown while hovered (and, for a draggable point, while dragged).
  const tip =
    show &&
    labelLayer &&
    createPortal(
      <span className={clsx(surfaces.glass, styles.coords)} style={{ left: x, top: y }}>
        {typeof show === 'function' ? show(at) : fmtPoint(at)}
      </span>,
      labelLayer,
    )
  const dot = (
    <circle
      cx={x}
      cy={y}
      r={r}
      style={{ fill: hollow ? 'var(--bg)' : color, stroke: color }}
      strokeWidth={hollow ? 2 : 0}
    />
  )
  if (!onDrag)
    return (
      <g ref={ref} pointerEvents="none">
        {hovered && <circle cx={x} cy={y} r={r + 6} style={{ fill: alpha(color, 0.18) }} />}
        {dot}
        {hovered && tip}
      </g>
    )
  return (
    <DraggablePoint
      gRef={ref}
      tip={tip}
      hovered={hovered}
      x={x}
      y={y}
      r={r}
      color={color}
      onDrag={onDrag}
      label={label}
    >
      {dot}
    </DraggablePoint>
  )
}

function DraggablePoint({
  gRef,
  tip,
  hovered,
  x,
  y,
  r,
  color,
  onDrag,
  label,
  children,
}: {
  gRef: RefObject<SVGGElement | null>
  tip: ReactNode
  hovered: boolean
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
      ref={gRef}
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
      {/* A thin ring marks the point as draggable before any hover; touch screens have none. */}
      <circle
        cx={x}
        cy={y}
        r={r + 4}
        style={{ fill: 'none', stroke: alpha(color, 0.55) }}
        strokeWidth={1.5}
      />
      {/* Generous invisible hit area so small points are easy to grab. */}
      <circle cx={x} cy={y} r={Math.max(18, r + 10)} fill="transparent" />
      {children}
      {(hovered || dragging) && tip}
    </g>
  )
}
