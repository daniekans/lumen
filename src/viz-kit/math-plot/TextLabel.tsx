import type { Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface TextLabelProps {
  at: Vec2
  children: string
  color?: string
  /** Font size in pixels. */
  size?: number
  align?: 'start' | 'middle' | 'end'
  mono?: boolean
  uppercase?: boolean
  opacity?: number
}

/** Plain SVG text positioned in stage units. Use MathLabel when the text contains math. */
export function TextLabel({
  at,
  children,
  color = vc.muted,
  size = 12,
  align = 'middle',
  mono = false,
  uppercase = false,
  opacity = 1,
}: TextLabelProps) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  return (
    <text
      x={x}
      y={y}
      textAnchor={align}
      dominantBaseline="central"
      pointerEvents="none"
      style={{
        fill: color,
        fontSize: size,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        letterSpacing: uppercase ? '0.08em' : undefined,
        textTransform: uppercase ? 'uppercase' : undefined,
        fontWeight: uppercase ? 600 : undefined,
        opacity,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      {children}
    </text>
  )
}
