import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Areas scale by one factor',
  summary:
    'A linear map of the plane multiplies every area by the same factor: the area of the parallelogram its columns span. With a sign for orientation, that factor is the determinant $\\det A$. It reaches $0$ when the plane collapses, and near a point a curved map scales small areas by a local determinant.',
  tags: ['determinant', 'area', 'orientation', 'linear map', 'parallelogram'],
  level: 'core',
  order: 1,
  skills: ['determinant'],
  steps: [
    {
      id: 'square',
      title: 'The unit square',
      caption:
        'The unit square, spanned by $\\hat{\\imath}$ and $\\hat{\\jmath}$, lands on the parallelogram spanned by the columns of $A$. Here its area is $3$: the map multiplies this area by $3$. Drag the tips of the columns.',
    },
    {
      id: 'grid-squares',
      title: 'Every grid square',
      caption:
        'Every square of the grid is the unit square shifted, so it lands on the same parallelogram shifted: the same area, $3$. One factor for the whole plane.',
    },
    {
      id: 'any-region',
      title: 'Any region',
      caption:
        'A disk is filled ever more closely by small squares, and each one lands on a parallelogram with $3$ times its area. So the disk, area $\\pi$, lands on an ellipse of area $3\\pi$. Make the squares smaller.',
    },
    {
      id: 'sign',
      title: 'Through zero to a flip',
      caption:
        'Move $A\\hat{\\jmath}$ across the line of $A\\hat{\\imath}$: the area shrinks to $0$ and grows again, but now the letter reads as in a mirror and the turn from the first column to the second is clockwise. The determinant records this with a sign: $3$ becomes $-3$.',
    },
    {
      id: 'collapse',
      title: 'Collapse',
      caption:
        'When the columns lie on one line, the whole plane lands on that line and every area becomes $0$: $\\det A = 0$. With both columns $\\mathbf{0}$ it lands on a single point.',
    },
    {
      id: 'curved',
      title: 'Zooming into a curved map',
      caption:
        'This map bends the grid, so different places scale areas differently. Shrink the square: near $\\mathbf{p}$ the map looks more and more like a linear map $J$, and the area ratio approaches $\\det J$. Try each point.',
    },
  ],
})
