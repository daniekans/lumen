import type { ReactNode } from 'react'
import { useEmphasis } from './highlight'

/**
 * Gives a hover key to shapes that have no `hoverKey` prop of their own (curves, segments,
 * points, rectangles). Hovering the group lights the key, so names in the code panel and readout
 * rows bound to it light up; when another key is active, the group dims. Render it inside a
 * `Stage`.
 */
export function HoverGroup({ hoverKey, children }: { hoverKey: string; children: ReactNode }) {
  const { hover, opacity } = useEmphasis(hoverKey)
  return (
    <g {...hover} style={{ opacity, transition: 'opacity 0.2s' }}>
      {children}
    </g>
  )
}
