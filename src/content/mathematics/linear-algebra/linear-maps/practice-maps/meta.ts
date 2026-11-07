import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: maps in 3D, kernel and image',
  summary:
    'Rotations about the axes as matrices and applied to vectors, maps between spaces of different sizes, kernel vectors, the rank, whether a vector is in the image, kernels and images of described maps, weights that give the same predictions, and short proofs.',
  tags: ['rotation matrix', '3D', 'kernel', 'image', 'rank', 'practice'],
  level: 'core',
  order: 11,
  skills: ['maps-in-3d', 'kernel-and-image'],
})
