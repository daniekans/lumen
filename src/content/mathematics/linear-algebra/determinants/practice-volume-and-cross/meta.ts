import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: volumes and cross products',
  summary:
    'Cross products, order and brackets with the basis vectors, right- and left-handed triples, the area of a triangle in space, the volume of a unit cell and of a tetrahedron, four points in one plane, the plane through three points, torque, the product rule with powers, scalars, transposes and inverses, and short proofs from the rules.',
  tags: [
    'cross product',
    'triple product',
    'volume',
    'plane',
    'torque',
    'product rule',
    'practice',
  ],
  level: 'core',
  order: 8,
  skills: ['cross-product', 'determinant', 'determinant-rules'],
})
