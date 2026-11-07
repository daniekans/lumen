import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: matrix products',
  summary:
    'Products of matrices, square or not, and their shapes; single entries; powers of a rotation; the matrix of one described map after another; rotations, reflections, projections, shears and scalings; transposes; totals from a join of sparse tables; two linear layers as one.',
  tags: [
    'matrix multiplication',
    'matrix product',
    'rotation',
    'projection',
    'transpose',
    'practice',
  ],
  level: 'core',
  order: 8,
  skills: ['standard-maps', 'matrix-multiplication'],
})
