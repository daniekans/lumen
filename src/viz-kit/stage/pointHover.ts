import type { Vec2 } from '@/lib/math'

/** How close the pointer must be to a point, in pixels, to show its coordinates. */
export const HOVER_RADIUS = 14

/**
 * Points that show their coordinates on hover. Each one registers its pixel position, and the
 * stage picks the nearest to the pointer. Nothing is added to the drawing, so hovering never
 * takes presses away from draggable shapes or from panning.
 */
export interface PointHover {
  /** On for coordinate planes (zoomable stages); a Point can override it. */
  coordinates: boolean
  /** Id of the point under the pointer, if any. */
  hovered: string | null
  register: (id: string, target: HoverTarget | null) => void
}

export interface HoverTarget {
  /** Position in pixels. */
  px: Vec2
  /** The point's element, to skip points faded out by an ancestor group. */
  el?: Element | null
}

/** Below this rendered opacity a point counts as hidden. */
const VISIBLE = 0.2

/** Opacity of an element as drawn: its own times its ancestors', up to the svg. */
const renderedOpacity = (el: Element) => {
  let o = 1
  for (let e: Element | null = el; e && e.tagName !== 'svg'; e = e.parentElement)
    o *= Number(getComputedStyle(e).opacity) || 0
  return o
}

export const createHoverRegistry = () => {
  const targets = new Map<string, HoverTarget>()
  return {
    set: (id: string, t: HoverTarget | null) => (t ? targets.set(id, t) : targets.delete(id)),
    /** The visible registered point nearest to (x, y) within `radius` pixels. */
    nearest: (x: number, y: number, radius = HOVER_RADIUS): string | null => {
      let best: string | null = null
      let bestD = radius
      for (const [
        id,
        {
          px: [px, py],
          el,
        },
      ] of targets) {
        const d = Math.hypot(px - x, py - y)
        if (d <= bestD && (!el || renderedOpacity(el) >= VISIBLE)) {
          best = id
          bestD = d
        }
      }
      return best
    },
  }
}
