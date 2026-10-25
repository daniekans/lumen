import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: dot products and span',
  summary:
    'Dot products, angles, orthogonality and projections; cosine and distance of feature vectors in four or five dimensions; weights in a span and dependence relations; planes in normal and parametric form, where a line meets a plane, and short proofs.',
  tags: [
    'dot product',
    'angle',
    'orthogonal',
    'projection',
    'span',
    'linear independence',
    'plane',
    'practice',
  ],
  level: 'core',
  order: 8,
  skills: ['dot-product', 'span-and-independence', 'lines-and-planes'],
})
