import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: linear maps and matrices',
  summary:
    'Sixteen problems across the unit: products of matrices and vectors, matrices of described maps, images from the images of a basis, a failing rule of linearity, a layer, products and powers, composed and standard maps, transposes, rotations in space, maps between spaces of different sizes, kernel vectors, the rank, reachable vectors, and one proof about composition.',
  tags: ['linear map', 'matrix', 'matrix multiplication', 'kernel', 'rank', 'checkpoint'],
  level: 'core',
  order: 12,
  skills: [
    'linear-maps',
    'matrix-columns',
    'matrix-vector',
    'standard-maps',
    'matrix-multiplication',
    'maps-in-3d',
    'kernel-and-image',
  ],
  problemCount: 16,
})
