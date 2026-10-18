import clsx from 'clsx'
import { useReducedMotion } from 'motion/react'
import { Minus, Plus, Scan } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { msg } from '@/i18n'
import { duration, ease } from '@/styles/motion'
import surfaces from '@/styles/surfaces.module.css'
import { IconButton } from '@/ui/atoms'
import { tween, type TweenHandle } from '../anim/tween'
import { Stage, type Insets } from '../stage'
import stageStyles from '../stage/Stage.module.css'
import {
  CAMERA_LIMITS,
  clampCamera,
  createProjection,
  defaultCamera,
  orbitBy,
  ProjectionContext,
  type Camera,
} from './camera'
import styles from './Stage3D.module.css'

const BUTTON_ZOOM = 1.5
const WHEEL_RATE = 0.0015
const PINCH_RATE = 0.01
/** Pointer travel before a press on the background turns into an orbit. */
const ORBIT_SLOP_PX = 3

interface Stage3DProps {
  /** Radius around the origin that must be visible at zoom 1, in scene units. */
  radius: number
  /** A controlled camera; leave it out to let the stage keep its own. */
  camera?: Camera
  onCameraChange?: (c: Camera) => void
  /** The view the reset button returns to, and the starting view of an uncontrolled stage. */
  home?: Camera
  insets?: Partial<Insets>
  overlay?: ReactNode
  /** SVG content, drawn in order: later children are in front. */
  children: ReactNode
  ariaLabel?: string
}

/**
 * A 3D scene drawn in SVG with an orthographic orbit camera, so it keeps the look of the 2D stages:
 * the same strokes, colors and KaTeX labels. Dragging the background orbits, the wheel and the
 * buttons zoom, a double click resets. Primitives (`Vector3D`, `Segment3D`, ...) project their
 * points through `useProjection()` and draw with the 2D kit, in tree order.
 */
export function Stage3D({
  radius,
  camera: controlled,
  onCameraChange,
  home = defaultCamera,
  insets,
  overlay,
  children,
  ariaLabel,
}: Stage3DProps) {
  const [own, setOwn] = useState(home)
  const camera = controlled ?? own
  const reduced = useReducedMotion() ?? false
  const latest = useRef({ camera, onCameraChange })
  useLayoutEffect(() => {
    latest.current = { camera, onCameraChange }
  })
  const animation = useRef<TweenHandle | null>(null)

  const set = useCallback((c: Camera) => {
    const next = clampCamera(c)
    setOwn(next)
    latest.current.onCameraChange?.(next)
  }, [])
  const apply = useCallback(
    (f: (c: Camera) => Camera) => {
      animation.current?.stop()
      set(f(latest.current.camera))
    },
    [set],
  )
  const animateTo = useCallback(
    (to: Camera) => {
      animation.current?.stop()
      const from = latest.current.camera
      // Turn the short way around.
      const turn = Math.atan2(
        Math.sin(to.azimuth - from.azimuth),
        Math.cos(to.azimuth - from.azimuth),
      )
      animation.current = tween(0, 1, {
        duration: reduced ? 0 : duration.slow,
        ease: ease.out,
        onUpdate: (p) =>
          set({
            azimuth: from.azimuth + turn * p,
            elevation: from.elevation + (to.elevation - from.elevation) * p,
            zoom: from.zoom * (to.zoom / from.zoom) ** p,
          }),
      })
    },
    [reduced, set],
  )
  useEffect(() => () => animation.current?.stop(), [])

  const zoomBy = (factor: number) =>
    animateTo({ ...latest.current.camera, zoom: latest.current.camera.zoom * factor })
  const reset = () => animateTo(home)

  const ref = useRef<HTMLDivElement>(null)
  // Wheel listeners must be non-passive to stop the page from scrolling or zooming.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1
      const factor = Math.exp(-e.deltaY * lines * (e.ctrlKey ? PINCH_RATE : WHEEL_RATE))
      apply((c) => ({ ...c, zoom: c.zoom * factor }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [apply])

  const press = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const [orbiting, setOrbiting] = useState(false)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Draggable points call preventDefault, and the overlay panels handle their own presses.
    if (e.isDefaultPrevented() || (e.pointerType === 'mouse' && e.button !== 0)) return
    if (!(e.target instanceof SVGElement)) return
    if (press.current) return
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (!p.moved) {
      if (Math.hypot(dx, dy) < ORBIT_SLOP_PX) return
      p.moved = true
      setOrbiting(true)
    }
    p.x = e.clientX
    p.y = e.clientY
    apply((c) => orbitBy(c, dx, dy))
  }
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    if (press.current?.id !== e.pointerId) return
    press.current = null
    setOrbiting(false)
  }

  const projection = useMemo(() => createProjection(camera), [camera])
  const r = radius / camera.zoom

  return (
    <div
      ref={ref}
      className={clsx(styles.scene, orbiting && styles.orbiting)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onDoubleClick={(e) => {
        if (!e.isDefaultPrevented() && e.target instanceof SVGElement) reset()
      }}
    >
      <ProjectionContext.Provider value={projection}>
        <Stage
          domain={{ x: [-r, r], y: [-r, r] }}
          insets={insets}
          ariaLabel={ariaLabel}
          overlay={
            <>
              {overlay}
              <div className={clsx(surfaces.glass, stageStyles.zoom)} data-print-hide>
                <IconButton
                  label={msg.viz.zoomIn}
                  size="sm"
                  disabled={camera.zoom >= CAMERA_LIMITS.zoom.max}
                  onClick={() => zoomBy(BUTTON_ZOOM)}
                >
                  <Plus size={14} />
                </IconButton>
                <IconButton
                  label={msg.viz.zoomOut}
                  size="sm"
                  disabled={camera.zoom <= CAMERA_LIMITS.zoom.min}
                  onClick={() => zoomBy(1 / BUTTON_ZOOM)}
                >
                  <Minus size={14} />
                </IconButton>
                <IconButton
                  label={msg.viz.resetView}
                  size="sm"
                  disabled={
                    camera.azimuth === home.azimuth &&
                    camera.elevation === home.elevation &&
                    camera.zoom === home.zoom
                  }
                  onClick={reset}
                >
                  <Scan size={14} />
                </IconButton>
              </div>
            </>
          }
        >
          {children}
        </Stage>
      </ProjectionContext.Provider>
    </div>
  )
}
