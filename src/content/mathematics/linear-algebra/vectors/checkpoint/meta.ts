import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: vectors',
  summary:
    'Fourteen problems across the unit: combinations and their weights, lengths and distances, dot products, angles and projections, independence, planes and lines in space, coordinates in a basis, and one proof about independence.',
  tags: [
    'vector',
    'linear combination',
    'dot product',
    'linear independence',
    'basis',
    'checkpoint',
  ],
  level: 'core',
  order: 11,
  skills: [
    'vector-arithmetic',
    'vector-length',
    'linear-combinations',
    'dot-product',
    'span-and-independence',
    'lines-and-planes',
    'basis-coordinates',
  ],
  problemCount: 14,
})
