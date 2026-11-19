import type { Fn } from './calculus'
import type { Vec2 } from './vec2'

/** A rectangle on a stage that shows a graph with its own scales. */
export interface PlotBoxSpec {
  /** Bottom-left corner, in stage units. */
  at: Vec2
  /** Width and height, in stage units. */
  size: Vec2
  /** Data range shown along the bottom edge. */
  x: readonly [number, number]
  /** Data range shown along the left edge. */
  y: readonly [number, number]
}

export interface PlotBox extends PlotBoxSpec {
  /** Data point to stage point. */
  map: (p: Vec2) => Vec2
  /**
   * Samples of y = f(x) for x in [a, b], mapped to the stage. Samples outside the y range are
   * left out, so pick [a, b] where the graph stays inside the box.
   */
  curve: (f: Fn, a: number, b: number, samples?: number) => Vec2[]
}

/**
 * A graph fitted into a box. Stages keep one scale on both axes, so a diagram in centimeters and
 * a graph of a volume in cubic centimeters cannot share axes; the box gives the graph its own.
 */
export const plotBox = (spec: PlotBoxSpec): PlotBox => {
  const [x0, y0] = spec.at
  const [w, h] = spec.size
  const [a0, a1] = spec.x
  const [b0, b1] = spec.y
  const map = ([u, v]: Vec2): Vec2 => [
    x0 + ((u - a0) / (a1 - a0)) * w,
    y0 + ((v - b0) / (b1 - b0)) * h,
  ]
  const curve = (f: Fn, a: number, b: number, samples = 240) => {
    const pts: Vec2[] = []
    for (let k = 0; k <= samples; k++) {
      const u = a + ((b - a) * k) / samples
      const v = f(u)
      if (Number.isFinite(v) && v >= b0 && v <= b1) pts.push(map([u, v]))
    }
    return pts
  }
  return { ...spec, map, curve }
}
