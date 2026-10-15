import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { Vec2 } from '@/lib/math'
import { Tex } from '@/ui/atoms'
import { vc } from '@/styles/viz-colors'
import { useStage } from '../stage'
import styles from './MathLabel.module.css'

type Anchor = 'center' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/** Where the label sits relative to its point, as a translate() of the label box. */
const anchorTransform: Record<Anchor, string> = {
  center: 'translate(-50%, -50%)',
  n: 'translate(-50%, -100%)',
  s: 'translate(-50%, 0)',
  e: 'translate(0, -50%)',
  w: 'translate(-100%, -50%)',
  ne: 'translate(0, -100%)',
  nw: 'translate(-100%, -100%)',
  se: 'translate(0, 0)',
  sw: 'translate(-100%, 0)',
}

const anchorOffset: Record<Anchor, Vec2> = {
  center: [0, 0],
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
  ne: [0.7, -0.7],
  nw: [-0.7, -0.7],
  se: [0.7, 0.7],
  sw: [-0.7, 0.7],
}

interface MathLabelProps {
  at: Vec2
  tex: string
  color?: string
  anchor?: Anchor
  /** Gap in pixels between the point and the label. */
  offset?: number
  size?: number
  opacity?: number
}

/**
 * KaTeX label positioned in stage units. It renders into the stage's HTML layer (KaTeX needs
 * HTML), so it can be placed anywhere inside SVG content.
 */
export function MathLabel({
  at,
  tex,
  color = vc.fg,
  anchor = 'center',
  offset = 10,
  size,
  opacity = 1,
}: MathLabelProps) {
  const { coords, labelLayer } = useStage()
  if (!labelLayer) return null
  const [x, y] = coords.toPx(at)
  const [ox, oy] = anchorOffset[anchor]
  const style: CSSProperties = {
    transform: `translate(${x + ox * offset}px, ${y + oy * offset}px) ${anchorTransform[anchor]}`,
    color,
    fontSize: size,
    opacity,
  }
  return createPortal(
    <div className={styles.label} style={style}>
      <Tex>{tex}</Tex>
    </div>,
    labelLayer,
  )
}
