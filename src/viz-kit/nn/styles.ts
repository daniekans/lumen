import { vc } from '@/styles/viz-colors'
import type { EdgeStyle } from './NeuralNet'

/** Largest absolute value across a nested weight array, used to normalize edge widths. */
export const maxAbs = (values: readonly (readonly (readonly number[])[])[]) =>
  Math.max(1e-9, ...values.flat(2).map(Math.abs))

/**
 * The standard encoding for a weight: blue when positive, red when negative, wider and more
 * opaque as its magnitude grows. `emphasis` (0 to 1) fades the edge in and out for focus effects.
 */
export const weightEdge = (w: number, scale: number, emphasis = 1): EdgeStyle => {
  const m = Math.min(1, Math.abs(w) / scale)
  return {
    color: w >= 0 ? vc.blue : vc.red,
    width: 0.6 + 2.6 * m,
    opacity: (0.18 + 0.62 * m) * emphasis,
  }
}

/** Encoding for a gradient: a single highlight hue whose width follows its magnitude. */
export const gradientEdge = (g: number, scale: number, emphasis = 1): EdgeStyle => {
  const m = Math.min(1, Math.abs(g) / scale)
  return { color: vc.yellow, width: 0.6 + 3.2 * m, opacity: (0.12 + 0.8 * m) * emphasis }
}
