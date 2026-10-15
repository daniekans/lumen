import clsx from 'clsx'
import { useRef, useState, type PointerEvent } from 'react'
import styles from './ResizeHandle.module.css'

interface ResizeHandleProps {
  /** Edge of the panel the handle sits on. Dragging away from the panel makes it wider. */
  edge: 'left' | 'right'
  width: number
  onResize: (width: number) => void
  onResizeStart?: () => void
  onResizeEnd?: () => void
  /** Double-click resets to this width. */
  defaultWidth?: number
  label: string
}

/** Vertical drag handle that resizes the panel it is attached to. */
export function ResizeHandle({
  edge,
  width,
  onResize,
  onResizeStart,
  onResizeEnd,
  defaultWidth,
  label,
}: ResizeHandleProps) {
  const start = useRef({ x: 0, width: 0 })
  const [active, setActive] = useState(false)
  const sign = edge === 'left' ? -1 : 1

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      className={clsx(styles.handle, styles[edge], active && styles.active)}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        start.current = { x: e.clientX, width }
        setActive(true)
        onResizeStart?.()
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        onResize(start.current.width + sign * (e.clientX - start.current.x))
      }}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setActive(false)
        onResizeEnd?.()
      }}
      onDoubleClick={() => defaultWidth && onResize(defaultWidth)}
    />
  )
}
