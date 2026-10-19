import clsx from 'clsx'
import { useReducedMotion } from 'motion/react'
import { Box, Minus, Plus, Rotate3d, Scan } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { msg } from '@/i18n'
import { duration, ease } from '@/styles/motion'
import surfaces from '@/styles/surfaces.module.css'
import { IconButton } from '@/ui/atoms'
import { tween, type TweenHandle } from '../anim/tween'
import { Stage, type Highlight, type Insets } from '../stage'
import stageStyles from '../stage/Stage.module.css'
import {
  CAMERA_LIMITS,
  clampCamera,
  createProjection,
  defaultCamera,
  orbitBy,
  ProjectionContext,
  standardViews,
  type Camera,
} from './camera'
import { setSwayPreference, useSwayPreference } from './preferences'
import styles from './Stage3D.module.css'

const BUTTON_ZOOM = 1.5
const WHEEL_RATE = 0.0015
const PINCH_RATE = 0.01
/** Pointer travel before a press on the background turns into an orbit. */
const ORBIT_SLOP_PX = 3
/** Pixels of orbit per arrow key press. */
const KEY_STEP_PX = 18

/** Idle sway: a slow turn back and forth around the vertical axis. */
const SWAY = {
  /** Largest turn each way, in radians (about 11 degrees). */
  amplitude: 0.2,
  /** Seconds for one full swing there and back. */
  period: 26,
  /** Seconds to ease in or out. */
  ramp: 1.6,
  /** Seconds without interaction before it starts again. */
  idle: 6,
  /** Seconds after the stage appears before it starts. */
  delay: 1.5,
}

/** Momentum after an orbit drag: the turn keeps going and slows down with this time constant. */
const INERTIA = { decay: 0.3, minSpeed: 40, maxGapMs: 90 }

/**
 * Whether a press landed on the drawing, not on the panels or buttons over it (whose icons are
 * SVG too, so checking for an SVG target alone would capture their clicks).
 */
const onDrawing = (target: EventTarget) =>
  target instanceof SVGElement && !target.closest('button, a, input, [role="menu"]')

export interface CameraView {
  label: string
  camera: Omit<Camera, 'zoom'>
}

interface Stage3DProps {
  /** Radius around the origin that must be visible at zoom 1, in scene units. */
  radius: number
  /** A controlled camera; leave it out to let the stage keep its own. */
  camera?: Camera
  onCameraChange?: (c: Camera) => void
  /** The view the reset button returns to, and the starting view of an uncontrolled stage. */
  home?: Camera
  /** Extra entries for the views menu, such as a view along a plane. */
  views?: readonly CameraView[]
  /**
   * Turn slowly while idle (when the learner has not switched it off). Pass false during a step
   * whose picture depends on an exact view, such as an edge-on look at a plane.
   */
  sway?: boolean
  /** Linked hover between shapes and readouts (`useHighlight`). */
  highlight?: Highlight
  insets?: Partial<Insets>
  overlay?: ReactNode
  /** SVG content, drawn in order: later children are in front. */
  children: ReactNode
  ariaLabel?: string
}

/**
 * A 3D scene drawn in SVG with an orthographic orbit camera, so it keeps the look of the 2D stages:
 * the same strokes, colors and KaTeX labels. Dragging the background orbits (with momentum), the
 * wheel and the buttons zoom, a double click resets, and the arrow keys turn a focused stage. While
 * idle it sways slowly, which also gives the eye the depth that an orthographic picture lacks.
 * Primitives (`Vector3D`, `Plane3D`, ...) project their points through `useProjection()` and draw
 * with the 2D kit, in tree order.
 */
export function Stage3D({
  radius,
  camera: controlled,
  onCameraChange,
  home = defaultCamera,
  views = [],
  sway = true,
  highlight,
  insets,
  overlay,
  children,
  ariaLabel,
}: Stage3DProps) {
  const [own, setOwn] = useState(home)
  const camera = controlled ?? own
  const reduced = useReducedMotion() ?? false
  const swayPreference = useSwayPreference()
  const swayOn = sway && swayPreference && !reduced
  // Azimuth added by the sway, on top of the camera.
  const [offset, setOffset] = useState(0)
  const latest = useRef({ camera, onCameraChange, offset, swayOn })
  useLayoutEffect(() => {
    latest.current = { camera, onCameraChange, offset, swayOn }
  })
  const animation = useRef<TweenHandle | null>(null)

  const set = useCallback((c: Camera) => {
    const next = clampCamera(c)
    setOwn(next)
    latest.current.camera = next
    latest.current.onCameraChange?.(next)
  }, [])

  // Sway and momentum share one frame loop.
  const [mountedAt] = useState(() => performance.now())
  const motion = useRef({
    amp: 0,
    phase: 0,
    lastInteraction: mountedAt - (SWAY.idle - SWAY.delay) * 1000,
    velocity: null as { x: number; y: number } | null,
  })
  const frame = useRef<number | null>(null)
  const last = useRef(0)
  // The loop calls the latest `tick` through a ref, since `tick` schedules itself.
  const tickRef = useRef<(now: number) => void>(() => {})
  const loop = useRef((now: number) => tickRef.current(now))

  /** The learner touched the view: keep the swayed angle as the camera, and pause the sway. */
  const interact = useCallback(() => {
    const m = motion.current
    m.lastInteraction = performance.now()
    m.velocity = null
    const { camera: c, offset: o } = latest.current
    if (Math.abs(o) > 1e-6) set({ ...c, azimuth: c.azimuth + o })
    m.amp = 0
    m.phase = 0
    latest.current.offset = 0
    setOffset(0)
  }, [set])

  const tick = useCallback(
    (now: number) => {
      const m = motion.current
      const dt = Math.min(0.05, (now - last.current) / 1000)
      last.current = now
      let busy = false
      if (m.velocity) {
        const v = m.velocity
        set(orbitBy(latest.current.camera, v.x * dt, v.y * dt))
        const k = Math.exp(-dt / INERTIA.decay)
        v.x *= k
        v.y *= k
        m.lastInteraction = now
        if (Math.hypot(v.x, v.y) < INERTIA.minSpeed / 4) m.velocity = null
        else busy = true
      }
      const on = latest.current.swayOn
      const idle = now - m.lastInteraction > SWAY.idle * 1000
      const target = on && idle ? 1 : 0
      m.amp += (target - m.amp) * (1 - Math.exp(-dt / (SWAY.ramp / 3)))
      if (Math.abs(m.amp - target) < 1e-3) m.amp = target
      if (m.amp > 0) m.phase += (dt * 2 * Math.PI) / SWAY.period
      else m.phase = 0
      const o = m.amp * SWAY.amplitude * Math.sin(m.phase)
      latest.current.offset = o
      setOffset(o)
      if (on || m.amp > 0) busy = true
      frame.current = busy ? requestAnimationFrame(loop.current) : null
    },
    [set],
  )
  useLayoutEffect(() => {
    tickRef.current = tick
  }, [tick])
  const kick = useCallback(() => {
    if (frame.current !== null) return
    last.current = performance.now()
    frame.current = requestAnimationFrame(loop.current)
  }, [])
  // Restart the loop when the sway is switched on, or when it must ease out after being turned off.
  useEffect(() => {
    if (swayOn || motion.current.amp > 0) kick()
  }, [swayOn, kick])
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      animation.current?.stop()
    },
    [],
  )

  const apply = useCallback(
    (f: (c: Camera) => Camera) => {
      animation.current?.stop()
      interact()
      set(f(latest.current.camera))
    },
    [interact, set],
  )
  const animateTo = useCallback(
    (to: Camera) => {
      animation.current?.stop()
      interact()
      const from = latest.current.camera
      // Turn the short way around.
      const turn = Math.atan2(
        Math.sin(to.azimuth - from.azimuth),
        Math.cos(to.azimuth - from.azimuth),
      )
      animation.current = tween(0, 1, {
        duration: reduced ? 0 : duration.slow * 1.5,
        ease: ease.out,
        onUpdate: (p) => {
          motion.current.lastInteraction = performance.now()
          set({
            azimuth: from.azimuth + turn * p,
            elevation: from.elevation + (to.elevation - from.elevation) * p,
            zoom: from.zoom * (to.zoom / from.zoom) ** p,
          })
        },
      })
    },
    [interact, reduced, set],
  )

  const zoomBy = (factor: number) =>
    animateTo({ ...latest.current.camera, zoom: latest.current.camera.zoom * factor })
  const reset = () => animateTo(home)
  const showView = (v: Omit<Camera, 'zoom'>) =>
    animateTo({ ...v, zoom: latest.current.camera.zoom })

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

  const press = useRef<{
    id: number
    x: number
    y: number
    t: number
    moved: boolean
    vx: number
    vy: number
  } | null>(null)
  const [orbiting, setOrbiting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!onDrawing(e.target)) return
    setMenuOpen(false)
    // Any press on the drawing (a point drag too) stops the sway and the momentum.
    interact()
    animation.current?.stop()
    // Draggable points call preventDefault and handle their own presses.
    if (e.isDefaultPrevented() || (e.pointerType === 'mouse' && e.button !== 0)) return
    if (press.current) return
    press.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: e.timeStamp,
      moved: false,
      vx: 0,
      vy: 0,
    }
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
    // Pointer speed in pixels per second, smoothed, for the momentum after release.
    const dt = Math.max(1, e.timeStamp - p.t) / 1000
    p.vx = 0.6 * p.vx + 0.4 * (dx / dt)
    p.vy = 0.6 * p.vy + 0.4 * (dy / dt)
    p.x = e.clientX
    p.y = e.clientY
    p.t = e.timeStamp
    apply((c) => orbitBy(c, dx, dy))
  }
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current
    if (p?.id !== e.pointerId) return
    press.current = null
    setOrbiting(false)
    const recent = e.timeStamp - p.t < INERTIA.maxGapMs
    if (p.moved && recent && !reduced && Math.hypot(p.vx, p.vy) > INERTIA.minSpeed) {
      motion.current.velocity = { x: p.vx, y: p.vy }
      kick()
    }
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setMenuOpen(false)
    if (e.target !== e.currentTarget || e.metaKey || e.ctrlKey || e.altKey) return
    const keys: Record<string, () => void> = {
      ArrowLeft: () => apply((c) => orbitBy(c, -KEY_STEP_PX, 0)),
      ArrowRight: () => apply((c) => orbitBy(c, KEY_STEP_PX, 0)),
      ArrowUp: () => apply((c) => orbitBy(c, 0, -KEY_STEP_PX)),
      ArrowDown: () => apply((c) => orbitBy(c, 0, KEY_STEP_PX)),
      '+': () => zoomBy(BUTTON_ZOOM),
      '=': () => zoomBy(BUTTON_ZOOM),
      '-': () => zoomBy(1 / BUTTON_ZOOM),
      '0': reset,
    }
    const action = keys[e.key]
    if (!action) return
    // Marks the key as handled, so the page does not also change the step.
    e.preventDefault()
    action()
  }

  const allViews: readonly CameraView[] = [
    { label: msg.viz.viewHome, camera: home },
    { label: msg.viz.viewTop, camera: standardViews.top },
    { label: msg.viz.viewFront, camera: standardViews.front },
    { label: msg.viz.viewSide, camera: standardViews.side },
    ...views,
  ]

  const shown = useMemo(() => ({ ...camera, azimuth: camera.azimuth + offset }), [camera, offset])
  const projection = useMemo(() => createProjection(shown, radius), [shown, radius])
  const r = radius / camera.zoom
  const atHome =
    camera.azimuth === home.azimuth &&
    camera.elevation === home.elevation &&
    camera.zoom === home.zoom

  return (
    <div
      ref={ref}
      className={clsx(styles.scene, orbiting && styles.orbiting)}
      tabIndex={0}
      aria-label={msg.viz.scene3d}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
      onDoubleClick={(e) => {
        if (!e.isDefaultPrevented() && onDrawing(e.target)) reset()
      }}
    >
      <ProjectionContext.Provider value={projection}>
        <Stage
          domain={{ x: [-r, r], y: [-r, r] }}
          insets={insets}
          ariaLabel={ariaLabel}
          highlight={highlight}
          overlay={
            <>
              {overlay}
              <div
                className={clsx(surfaces.glass, stageStyles.zoom)}
                data-print-hide
                onPointerDown={interact}
              >
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
                  disabled={atHome && offset === 0}
                  onClick={reset}
                >
                  <Scan size={14} />
                </IconButton>
                <IconButton
                  label={msg.viz.views}
                  size="sm"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <Box size={14} />
                </IconButton>
                {!reduced && (
                  <IconButton
                    label={swayPreference ? msg.viz.swayOn : msg.viz.swayOff}
                    size="sm"
                    aria-pressed={swayPreference}
                    className={clsx(!swayPreference && styles.off)}
                    onClick={() => setSwayPreference(!swayPreference)}
                  >
                    <Rotate3d size={14} />
                  </IconButton>
                )}
                {menuOpen && (
                  <div className={clsx(surfaces.glass, styles.menu)} role="menu">
                    {allViews.map((v) => (
                      <button
                        key={v.label}
                        type="button"
                        role="menuitem"
                        className={styles.item}
                        onClick={() => {
                          setMenuOpen(false)
                          showView(v.camera)
                        }}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
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
