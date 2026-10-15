import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createCoords, defaultInsets, StageContext, type Domain, type Insets } from './coords'
import styles from './Stage.module.css'

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
  const coords = useMemo(
    () =>
      createCoords(
        { x: [dx0, dx1], y: [dy0, dy1] },
        size.width,
        size.height,
        { top, right, bottom, left },
        yUp,
      ),
    [dx0, dx1, dy0, dy1, size.width, size.height, top, right, bottom, left, yUp],
  )
  const ctx = useMemo(() => ({ coords, svg, labelLayer }), [coords, svg, labelLayer])
  const ready = size.width > 0 && size.height > 0

  return (
    <div ref={ref} className={[styles.stage, className].filter(Boolean).join(' ')}>
      <StageContext.Provider value={ctx}>
        <svg
          ref={setSvg}
          className={styles.svg}
          width={size.width}
          height={size.height}
          role="img"
          aria-label={ariaLabel}
        >
          {ready && children}
        </svg>
        <div ref={setLabelLayer} className={styles.labels} />
        {ready && overlay}
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
