import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  title: 'Matrices as transformations',
  summary:
    'A 2x2 matrix moves the whole plane. Its columns say where the basis vectors land, and its determinant says how areas scale.',
  tags: ['matrix', 'linear transformation', 'basis', 'determinant', 'shear', 'rotation'],
  level: 'intro',
  skills: ['matrix-columns', 'determinant'],
  order: 1,
  steps: [
    {
      id: 'basis',
      title: 'Two basis vectors',
      caption:
        'Every vector in the plane is a combination $x\\hat{\\imath} + y\\hat{\\jmath}$ of $\\hat{\\imath} = (1, 0)$ and $\\hat{\\jmath} = (0, 1)$. Here $\\mathbf{v} = 2\\hat{\\imath} + \\hat{\\jmath}$.',
    },
    {
      id: 'columns',
      title: 'Columns are where the basis lands',
      caption:
        'A matrix stores the new positions of $\\hat{\\imath}$ and $\\hat{\\jmath}$ as its columns. Then $A\\mathbf{v} = 2\\,A\\hat{\\imath} + A\\hat{\\jmath}$: the same recipe, new ingredients.',
    },
    {
      id: 'grid',
      title: 'Grid lines stay parallel',
      caption:
        'Under a linear map the origin stays fixed and grid lines remain straight, parallel and evenly spaced. This shear keeps $\\hat{\\imath}$ and tilts $\\hat{\\jmath}$.',
    },
    {
      id: 'area',
      title: 'Determinant as area',
      caption:
        'The unit square becomes a parallelogram. Its area is $\\det A = ad - bc$, and every other region scales by the same factor.',
    },
    {
      id: 'sign',
      title: 'Negative and zero determinants',
      caption:
        'When $\\det A < 0$ the plane is flipped over. When $\\det A = 0$ it collapses onto a line and the map cannot be undone.',
    },
  ],
})
