import type { Vec2 } from '@/lib/math'

/** The center of cell (i, j) of a matrix whose top-left corner is `origin`. */
export const cellCenter = (origin: Vec2, cell: number, i: number, j: number): Vec2 => [
  origin[0] + (j + 0.5) * cell,
  origin[1] - (i + 0.5) * cell,
]
