import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useStage } from './coords'

interface HtmlBoxProps {
  /** Corner of the box with the smallest coordinates, in stage units. */
  x: number
  y: number
  /** Size in stage units. */
  width: number
  height: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * HTML content laid out in stage units, for text-heavy panels that belong to a diagram (prompts,
 * tables, code). It scales its box with the stage but keeps fonts at their CSS size.
 */
export function HtmlBox({ x, y, width, height, className, style, children }: HtmlBoxProps) {
  const { coords, labelLayer } = useStage()
  if (!labelLayer) return null
  const [x0, y0] = coords.toPx([x, y])
  const [x1, y1] = coords.toPx([x + width, y + height])
  return createPortal(
    <div
      className={className}
      style={{
        position: 'absolute',
        left: Math.min(x0, x1),
        top: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0),
        pointerEvents: 'auto',
        ...style,
      }}
    >
      {children}
    </div>,
    labelLayer,
  )
}
