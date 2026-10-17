import { createContext, useContext } from 'react'
import type { Vec2 } from '@/lib/math'

export interface Domain {
  x: readonly [number, number]
  y: readonly [number, number]
}

export interface Coords {
  width: number
  height: number
  /** Pixels per unit. Uniform on both axes so circles stay circles. */
  unit: number
  /** Zoom of a pannable stage relative to the fitted domain; 1 when the view is not changed. */
  zoom: number
  yUp: boolean
  /** The full visible range, which is at least the requested domain. */
  view: Domain
  x: (v: number) => number
  y: (v: number) => number
  toPx: (p: Vec2) => Vec2
  fromPx: (px: number, py: number) => Vec2
}

export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

/** A zoom factor and an offset of the view center from the domain center, in stage units. */
export interface View {
  zoom: number
  pan: Vec2
}

export const identityView: View = { zoom: 1, pan: [0, 0] }

export const isIdentityView = (v: View) => v.zoom === 1 && v.pan[0] === 0 && v.pan[1] === 0

/** Default stage insets. The larger bottom inset keeps content clear of the control dock. */
export const defaultInsets: Insets = { top: 32, right: 32, bottom: 112, left: 32 }

/**
 * Fits `domain` inside the box left after removing `insets`, with a uniform scale, centered in
 * that box. The visible view still covers the whole surface, so grids extend under the insets.
 * A `view` then zooms and pans relative to that fit.
 */
export const createCoords = (
  domain: Domain,
  width: number,
  height: number,
  insets: Insets,
  yUp: boolean,
  view: View = identityView,
): Coords => {
  const [x0, x1] = domain.x
  const [y0, y1] = domain.y
  const innerW = width - insets.left - insets.right
  const innerH = height - insets.top - insets.bottom
  const fit = Math.max(1e-6, Math.min(innerW / (x1 - x0), innerH / (y1 - y0)))
  const unit = fit * view.zoom
  const cx = (x0 + x1) / 2 + view.pan[0]
  const cy = (y0 + y1) / 2 + view.pan[1]
  // Pixel position of the domain center.
  const px0 = insets.left + innerW / 2
  const py0 = insets.top + innerH / 2
  const x = (v: number) => px0 + (v - cx) * unit
  const y = yUp ? (v: number) => py0 - (v - cy) * unit : (v: number) => py0 + (v - cy) * unit
  const fromPx = (px: number, py: number): Vec2 => [
    cx + (px - px0) / unit,
    yUp ? cy - (py - py0) / unit : cy + (py - py0) / unit,
  ]
  const [vx0, vyA] = fromPx(0, 0)
  const [vx1, vyB] = fromPx(width, height)
  return {
    width,
    height,
    unit,
    zoom: view.zoom,
    yUp,
    view: { x: [vx0, vx1], y: [Math.min(vyA, vyB), Math.max(vyA, vyB)] },
    x,
    y,
    toPx: (p) => [x(p[0]), y(p[1])],
    fromPx,
  }
}

export const ZOOM_LIMITS = { min: 0.25, max: 10 } as const

/**
 * Keeps a view usable: the zoom inside `ZOOM_LIMITS`, and the view center no further from the
 * domain center than the domain's own width and height, so the content cannot be lost off screen.
 */
export const clampView = (v: View, domain: Domain): View => {
  const w = domain.x[1] - domain.x[0]
  const h = domain.y[1] - domain.y[0]
  return {
    zoom: Math.min(ZOOM_LIMITS.max, Math.max(ZOOM_LIMITS.min, v.zoom)),
    pan: [Math.min(w, Math.max(-w, v.pan[0])), Math.min(h, Math.max(-h, v.pan[1]))],
  }
}

/**
 * Multiplies the zoom by `factor` while the stage point under the pixel (px, py) stays where it
 * is, as when zooming with the mouse wheel. `coords` is the mapping before the zoom.
 */
export const zoomViewAt = (
  v: View,
  coords: Coords,
  domain: Domain,
  factor: number,
  px: number,
  py: number,
): View => {
  // The view center C keeps its pixel, and a point m sits (m - C) * unit away from it. Keeping
  // that distance as the unit grows by `factor` moves C to C + (m - C)(1 - 1 / factor).
  const [mx, my] = coords.fromPx(px, py)
  const cx = (domain.x[0] + domain.x[1]) / 2 + v.pan[0]
  const cy = (domain.y[0] + domain.y[1]) / 2 + v.pan[1]
  const k = 1 - 1 / factor
  return { zoom: v.zoom * factor, pan: [v.pan[0] + (mx - cx) * k, v.pan[1] + (my - cy) * k] }
}

/** Moves the view so the content follows a pointer that moved by (dx, dy) pixels. */
export const panViewBy = (v: View, coords: Coords, dx: number, dy: number): View => ({
  zoom: v.zoom,
  pan: [v.pan[0] - dx / coords.unit, v.pan[1] + (coords.yUp ? dy : -dy) / coords.unit],
})

export interface StageContextValue {
  coords: Coords
  svg: SVGSVGElement | null
  /** HTML layer above the SVG for KaTeX labels and other DOM content positioned in stage space. */
  labelLayer: HTMLDivElement | null
}

export const StageContext = createContext<StageContextValue | null>(null)

export const useStage = () => {
  const ctx = useContext(StageContext)
  if (!ctx) throw new Error('useStage must be used inside <Stage>')
  return ctx
}

export const useCoords = () => useStage().coords
