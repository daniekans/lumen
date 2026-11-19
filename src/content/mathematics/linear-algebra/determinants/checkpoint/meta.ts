import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: determinants',
  summary:
    'Fifteen problems across the unit: $3 \\times 3$ and $4 \\times 4$ determinants, row operations, the value that collapses a map, points on one line, a polygon and an image area, cross products, areas and volumes in space, points in one plane, the plane through three points, torque, the product rule, and one proof: dependent columns give $\\det A = 0$.',
  tags: ['determinant', 'cross product', 'volume', 'product rule', 'checkpoint'],
  level: 'core',
  order: 9,
  skills: ['determinant', 'determinant-rules', 'computing-determinants', 'cross-product'],
  problemCount: 15,
})
