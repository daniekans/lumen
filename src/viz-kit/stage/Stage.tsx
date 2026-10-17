import clsx from 'clsx'
import { Minus, Plus, Scan } from 'lucide-react'
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { msg } from '@/i18n'
import surfaces from '@/styles/surfaces.module.css'
import { IconButton } from '@/ui/atoms'
import {
  createCoords,
  defaultInsets,
  isIdentityView,
  StageContext,
  ZOOM_LIMITS,
  type Domain,
  type Insets,
  type View,
} from './coords'
import styles from './Stage.module.css'
import { useStageView } from './useStageView'

interface StageProps {
  /** Region of the plane (or diagram space) that must always be visible. */
  domain: Domain
  /** Math convention (y grows upward). Use false for diagrams laid out in screen space. */
  yUp?: boolean
  /** Space kept free around the domain, in pixels. Defaults leave room for the control dock. */
  insets?: Partial<Insets>
  /** HTML content rendered above the drawing, usually <Overlay> panels. */
  overlay?: ReactNode
  /** SVG content. */
  children: ReactNode
  className?: string
  ariaLabel?: string
  /**
   * Lets the learner pan (drag the background) and zoom (wheel, pinch, buttons). For stages with
   * axes; diagrams leave it off. Draggable points keep working, since they handle their own presses.
   */
  zoomable?: boolean
}

/**
 * Responsive drawing surface. It measures its container and maps a logical domain to pixels with
 * a uniform scale, so primitives work in math units and strokes stay crisp at any size.
 * Future renderers (canvas layers, WebGL/3D) can mount next to the SVG and read the same coords.
 */
export function Stage({
  domain,
  yUp = true,
  insets,
  overlay,
  children,
  className,
  ariaLabel,
  zoomable = false,
}: StageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [svg, setSvg] = useState<SVGSVGElement | null>(null)
  const [labelLayer, setLabelLayer] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [dx0, dx1] = domain.x
  const [dy0, dy1] = domain.y
  const { top, right, bottom, left } = { ...defaultInsets, ...insets }
  const fitted = useMemo<Domain>(() => ({ x: [dx0, dx1], y: [dy0, dy1] }), [dx0, dx1, dy0, dy1])
  const coordsFor = useCallback(
    (v: View) =>
      createCoords(fitted, size.width, size.height, { top, right, bottom, left }, yUp, v),
    [fitted, size.width, size.height, top, right, bottom, left, yUp],
  )
  const pan = useStageView({ enabled: zoomable, svg, domain: fitted, coordsFor })
  const coords = useMemo(() => coordsFor(pan.view), [coordsFor, pan.view])
  const ctx = useMemo(() => ({ coords, svg, labelLayer }), [coords, svg, labelLayer])
  const ready = size.width > 0 && size.height > 0

  return (
    <div ref={ref} className={[styles.stage, className].filter(Boolean).join(' ')}>
      <StageContext.Provider value={ctx}>
        <svg
          ref={setSvg}
          className={clsx(styles.svg, zoomable && styles.zoomable, pan.panning && styles.panning)}
          width={size.width}
          height={size.height}
          role="img"
          aria-label={ariaLabel}
          {...pan.handlers}
        >
          {ready && children}
        </svg>
        <div ref={setLabelLayer} className={styles.labels} />
        {ready && overlay}
        {ready && zoomable && (
          <div className={clsx(surfaces.glass, styles.zoom)} data-print-hide>
            <IconButton
              label={msg.viz.zoomIn}
              size="sm"
              disabled={pan.view.zoom >= ZOOM_LIMITS.max}
              onClick={pan.zoomIn}
            >
              <Plus size={14} />
            </IconButton>
            <IconButton
              label={msg.viz.zoomOut}
              size="sm"
              disabled={pan.view.zoom <= ZOOM_LIMITS.min}
              onClick={pan.zoomOut}
            >
              <Minus size={14} />
            </IconButton>
            <IconButton
              label={msg.viz.resetView}
              size="sm"
              disabled={isIdentityView(pan.view)}
              onClick={pan.reset}
            >
              <Scan size={14} />
            </IconButton>
          </div>
        )}
      </StageContext.Provider>
    </div>
  )
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const cornerClass: Record<Corner, string | undefined> = {
  'top-left': styles.topLeft,
  'top-right': styles.topRight,
  'bottom-left': styles.bottomLeft,
  'bottom-right': styles.bottomRight,
}

/** HTML panel pinned to a corner of the stage, for readouts and legends. */
export const Overlay = ({ corner, children }: { corner: Corner; children: ReactNode }) => (
  <div className={[styles.overlay, cornerClass[corner]].join(' ')}>{children}</div>
)
