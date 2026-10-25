import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: vectors',
  summary:
    'Sixteen problems across the unit: combinations and their weights, distances, dot products, angles and projections, a distance or cosine in four or five dimensions, dependence relations, planes in normal and parametric form, lines meeting planes, bases and coordinates, and one proof about independence.',
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
  problemCount: 16,
})
