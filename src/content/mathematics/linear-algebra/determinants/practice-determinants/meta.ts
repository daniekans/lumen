import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: determinants',
  summary:
    '$2 \\times 2$, $3 \\times 3$ and triangular determinants, $4 \\times 4$ by elimination, the effect of row operations, the $k$ that collapses a map, points on one line, the orientation of a triangle, the area of a plot from its corners and the area of an image.',
  tags: [
    'determinant',
    'cofactor expansion',
    'elimination',
    'row operations',
    'shoelace formula',
    'practice',
  ],
  level: 'core',
  order: 5,
  skills: ['determinant', 'determinant-rules', 'computing-determinants'],
})
