import clsx from 'clsx'
import { alpha, vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import styles from './Diagram.module.css'
import type { Box } from './geometry'

export type NodeState = 'idle' | 'active' | 'done' | 'dim'

interface DiagramNodeProps {
  box: Box
  label: string
  sublabel?: string
  state?: NodeState
  color?: string
  onClick?: () => void
  onHover?: (hovered: boolean) => void
}

/** Rounded box with a label. State changes (idle, active, done, dim) cross-fade via CSS. */
export function DiagramNode({
  box,
  label,
  sublabel,
  state = 'idle',
  color = vc.blue,
  onClick,
  onHover,
}: DiagramNodeProps) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx([box.x - box.w / 2, box.y - box.h / 2])
  const active = state === 'active'
  return (
    <g
      className={clsx(styles.node, onClick && styles.interactive)}
      style={{ opacity: state === 'dim' ? 0.32 : 1 }}
      onClick={onClick}
      onPointerEnter={onHover && (() => onHover(true))}
      onPointerLeave={onHover && (() => onHover(false))}
    >
      <rect
        x={x}
        y={y}
        width={box.w * u}
        height={box.h * u}
        rx={10 * u}
        style={{
          stroke: active ? color : state === 'done' ? vc.axis : vc.gridStrong,
          fill: active ? alpha(color, 0.14) : 'var(--bg-elevated)',
        }}
        strokeWidth={active ? 1.75 : 1.25}
      />
      <text
        x={c.x(box.x)}
        y={c.y(box.y) + (sublabel ? -7 * u : 0)}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fill: active ? vc.fg : state === 'done' ? vc.fg : vc.muted,
          fontSize: 14.5 * u,
          fontWeight: 500,
        }}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={c.x(box.x)}
          y={c.y(box.y) + 11 * u}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: vc.subtle, fontSize: 11.5 * u, fontFamily: 'var(--font-mono)' }}
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}
