import { useReducedMotion } from 'motion/react'
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { duration, ease } from '@/styles/motion'
import { tween, type TweenHandle } from '../anim/tween'
import { VizRuntimeContext } from '../runtime/context'
import {
  clampView,
  identityView,
  panViewBy,
  zoomViewAt,
  type Coords,
  type Domain,
  type View,
} from './coords'

const BUTTON_ZOOM = 1.5
/** Wheel zoom per pixel of scroll; trackpad pinches arrive as wheel events with ctrlKey. */
const WHEEL_RATE = 0.0015
const PINCH_RATE = 0.01
/** Pointer travel before a press on the background turns into a pan. */
const PAN_SLOP_PX = 3

type Pointers = Map<number, { x: number; y: number }>

const spread = (ps: Pointers) => {
  const [a, b] = [...ps.values()]
  if (!a || !b) return null
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }
}

/**
 * Pan and zoom for a Stage: wheel and pinch zoom about the pointer, dragging the background pans.
 * Presses already handled by a draggable element (which calls preventDefault) are left alone.
 * The view resets when the step changes, since a step may change the domain.
 */
export const useStageView = ({
  enabled,
  svg,
  domain,
  coordsFor,
}: {
  enabled: boolean
  svg: SVGSVGElement | null
  domain: Domain
  /** The mapping for a view at the current size and domain. */
  coordsFor: (v: View) => Coords
}) => {
  const [view, setView] = useState<View>(identityView)
  // A new step starts from the fitted view, since a step may change the domain.
  const stepIndex = useContext(VizRuntimeContext)?.stepIndex
  const [viewStep, setViewStep] = useState(stepIndex)
  if (viewStep !== stepIndex) {
    setViewStep(stepIndex)
    setView(identityView)
  }
  const [panning, setPanning] = useState(false)
  const reduced = useReducedMotion() ?? false
  const latest = useRef({ view, domain, coordsFor })
  useLayoutEffect(() => {
    latest.current = { view, domain, coordsFor }
  })
  const animation = useRef<TweenHandle | null>(null)
  const pointers = useRef<Pointers>(new Map())
  const pressed = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  const apply = useCallback((next: (v: View) => View) => {
    animation.current?.stop()
    setView((v) => clampView(next(v), latest.current.domain))
  }, [])

  const animateTo = useCallback(
    (target: View) => {
      animation.current?.stop()
      const from = latest.current.view
      const to = clampView(target, latest.current.domain)
      const mix = (p: number): View => ({
        // Geometric in the zoom so zooming in and out feel the same speed.
        zoom: from.zoom * (to.zoom / from.zoom) ** p,
        pan: [
          from.pan[0] + (to.pan[0] - from.pan[0]) * p,
          from.pan[1] + (to.pan[1] - from.pan[1]) * p,
        ],
      })
      animation.current = tween(0, 1, {
        duration: reduced ? 0 : duration.slow,
        ease: ease.out,
        onUpdate: (p) => setView(mix(p)),
      })
    },
    [reduced],
  )

  const zoomBy = useCallback(
    (factor: number) => {
      const v = latest.current.view
      animateTo({ zoom: v.zoom * factor, pan: v.pan })
    },
    [animateTo],
  )
  const reset = useCallback(() => animateTo(identityView), [animateTo])

  // Stops a running zoom animation when the step changes (the view was reset above) and on unmount.
  useEffect(() => () => animation.current?.stop(), [stepIndex])

  // Wheel listeners must be non-passive to stop the page from scrolling or zooming.
  useEffect(() => {
    if (!enabled || !svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = svg.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1
      const factor = Math.exp(-e.deltaY * lines * (e.ctrlKey ? PINCH_RATE : WHEEL_RATE))
      apply((v) =>
        zoomViewAt(v, latest.current.coordsFor(v), latest.current.domain, factor, px, py),
      )
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [enabled, svg, apply])

  const local = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.isDefaultPrevented() || (e.pointerType === 'mouse' && e.button !== 0)) return
    const p = local(e)
    pointers.current.set(e.pointerId, p)
    pressed.current = { ...p, moved: pointers.current.size > 1 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const ps = pointers.current
    const prev = ps.get(e.pointerId)
    if (!prev) return
    const p = local(e)
    const press = pressed.current
    if (press && !press.moved) {
      if (Math.hypot(p.x - press.x, p.y - press.y) < PAN_SLOP_PX) return
      press.moved = true
      setPanning(true)
    }
    const before = spread(ps)
    ps.set(e.pointerId, p)
    const after = spread(ps)
    if (before && after) {
      // Two fingers: zoom by the change in their distance about their midpoint, then follow it.
      apply((v) => {
        const zoomed = zoomViewAt(
          v,
          latest.current.coordsFor(v),
          latest.current.domain,
          before.d > 0 ? after.d / before.d : 1,
          after.x,
          after.y,
        )
        return panViewBy(
          zoomed,
          latest.current.coordsFor(zoomed),
          after.x - before.x,
          after.y - before.y,
        )
      })
    } else if (ps.size === 1) {
      apply((v) => panViewBy(v, latest.current.coordsFor(v), p.x - prev.x, p.y - prev.y))
    }
  }

  const onPointerEnd = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.delete(e.pointerId)) return
    if (pointers.current.size === 0) {
      pressed.current = null
      setPanning(false)
    }
  }

  return {
    view: enabled ? view : identityView,
    panning,
    zoomIn: () => zoomBy(BUTTON_ZOOM),
    zoomOut: () => zoomBy(1 / BUTTON_ZOOM),
    reset,
    handlers: enabled
      ? {
          onPointerDown,
          onPointerMove,
          onPointerUp: onPointerEnd,
          onPointerCancel: onPointerEnd,
          onDoubleClick: (e: MouseEvent<SVGSVGElement>) => {
            if (!e.isDefaultPrevented()) reset()
          },
        }
      : {},
  }
}
