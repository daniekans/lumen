import type { Vec2 } from '@/lib/math'

export interface NetworkLayout {
  sizes: readonly number[]
  /** neurons[l][i] is the center of neuron i in layer l, in stage units. */
  neurons: Vec2[][]
  radius: number
}

interface LayoutOptions {
  width: number
  height: number
  radius?: number
  /** Vertical distance between neuron centers. Defaults to fitting the tallest layer. */
  spacing?: number
}

/** Places layers in evenly spaced columns, each column vertically centered. */
export const layoutNetwork = (
  sizes: readonly number[],
  { width, height, radius = 22, spacing }: LayoutOptions,
): NetworkLayout => {
  const tallest = Math.max(...sizes)
  const gap = spacing ?? Math.min(radius * 3.4, (height - 2 * radius) / Math.max(1, tallest - 1))
  const neurons = sizes.map((n, l) => {
    const x =
      sizes.length === 1 ? width / 2 : radius + ((width - 2 * radius) * l) / (sizes.length - 1)
    const top = height / 2 - ((n - 1) * gap) / 2
    return Array.from({ length: n }, (_, i): Vec2 => [x, top + i * gap])
  })
  return { sizes, neurons, radius }
}
