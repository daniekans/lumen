import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Linear transformations',
  description: 'Matrices as functions of the plane, composition and the determinant.',
  order: 2,
  skills: [
    { id: 'matrix-columns', title: 'Columns as images of the basis vectors' },
    { id: 'determinant', title: 'The determinant as signed area' },
  ],
})
