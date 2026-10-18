import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: dot products and span',
  summary:
    'Dot products, angles, orthogonality and projections; whether a vector is in a span and whether two or three vectors are independent; equations of planes and where a line meets a plane.',
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
