import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: vector arithmetic',
  summary:
    'Linear combinations, solving vector equations, exact lengths, unit vectors, distances, a missing component from a length, and the weights that combine two vectors into a target, in 2D and 3D.',
  tags: ['vector', 'linear combination', 'length', 'unit vector', 'distance', 'practice'],
  level: 'core',
  order: 4,
  skills: ['vector-arithmetic', 'vector-length', 'linear-combinations'],
})
