import clsx from 'clsx'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import styles from './Diagram.module.css'
import { curveTangent, type Curve } from './geometry'

interface DiagramEdgeProps {
  curve: Curve
  state?: 'idle' | 'active' | 'done' | 'dim'
  color?: string
  arrow?: boolean
}

/** Connector with an arrowhead. While active, a dashed overlay flows along it. */
export function DiagramEdge({
  curve,
  state = 'idle',
  color = vc.blue,
  arrow = true,
}: DiagramEdgeProps) {
  const c = useCoords()
  const [p0, p1, p2, p3] = [curve.p0, curve.p1, curve.p2, curve.p3].map(c.toPx) as [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ]
  const d = `M${p0}C${p1} ${p2} ${p3}`
  const stroke = state === 'active' ? color : state === 'done' ? vc.axis : vc.gridStrong
  const [tx, ty] = curveTangent(curve, 1)
  const len = Math.hypot(tx, ty) || 1
  const ux = tx / len
  const uy = (c.yUp ? -ty : ty) / len
  const h = 8
  const head = `M${p3[0]},${p3[1]}L${p3[0] - ux * h - uy * h * 0.45},${p3[1] - uy * h + ux * h * 0.45}L${p3[0] - ux * h + uy * h * 0.45},${p3[1] - uy * h - ux * h * 0.45}Z`
  return (
    <g className={styles.edge} style={{ opacity: state === 'dim' ? 0.3 : 1 }} pointerEvents="none">
      <path d={d} style={{ stroke, fill: 'none' }} strokeWidth={1.5} />
      <path
        d={d}
        className={clsx(state === 'active' && styles.flow)}
        style={{ stroke: color, fill: 'none', opacity: state === 'active' ? 0.9 : 0 }}
        strokeWidth={2}
        strokeDasharray="4 12"
        strokeLinecap="round"
      />
      {arrow && (
        <path d={head} style={{ fill: stroke, stroke }} strokeWidth={1} strokeLinejoin="round" />
      )}
    </g>
  )
}
