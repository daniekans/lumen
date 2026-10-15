import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import type { Vec2 } from '@/lib/math'
import { useStage } from '../stage'

/**
 * Pointer-based dragging in stage coordinates (mouse, pen and touch). The callback receives the
 * pointer position in math units; constrain or snap it before storing.
 */
export const useDrag = (onDrag: (p: Vec2) => void, { onEnd }: { onEnd?: () => void } = {}) => {
  const { svg, coords } = useStage()
  const [dragging, setDragging] = useState(false)
  const latest = useRef({ onDrag, coords })
  useLayoutEffect(() => {
    latest.current = { onDrag, coords }
  })

  const toLocal = (e: PointerEvent): Vec2 => {
    const rect = svg?.getBoundingClientRect()
    return latest.current.coords.fromPx(e.clientX - (rect?.left ?? 0), e.clientY - (rect?.top ?? 0))
  }

  return {
    dragging,
    handlers: {
      onPointerDown: (e: PointerEvent<SVGElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
        latest.current.onDrag(toLocal(e))
      },
      onPointerMove: (e: PointerEvent<SVGElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        latest.current.onDrag(toLocal(e))
      },
      onPointerUp: (e: PointerEvent<SVGElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setDragging(false)
        onEnd?.()
      },
      onPointerCancel: () => setDragging(false),
    },
  }
}
