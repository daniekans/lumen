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

/** Default stage insets. The larger bottom inset keeps content clear of the control dock. */
export const defaultInsets: Insets = { top: 32, right: 32, bottom: 112, left: 32 }

/**
 * Fits `domain` inside the box left after removing `insets`, with a uniform scale, centered in
 * that box. The visible view still covers the whole surface, so grids extend under the insets.
 */
export const createCoords = (
  domain: Domain,
  width: number,
  height: number,
  insets: Insets,
  yUp: boolean,
): Coords => {
  const [x0, x1] = domain.x
  const [y0, y1] = domain.y
  const innerW = width - insets.left - insets.right
  const innerH = height - insets.top - insets.bottom
  const unit = Math.max(1e-6, Math.min(innerW / (x1 - x0), innerH / (y1 - y0)))
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
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
    yUp,
    view: { x: [vx0, vx1], y: [Math.min(vyA, vyB), Math.max(vyA, vyB)] },
    x,
    y,
    toPx: (p) => [x(p[0]), y(p[1])],
    fromPx,
  }
}

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
