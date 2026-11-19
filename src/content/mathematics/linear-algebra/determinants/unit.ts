import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Determinants',
  description:
    'The one factor by which a linear map scales every area or volume, with a sign for orientation; the three rules that fix it, how to compute it, the product rule, and the cross product.',
  order: 3,
  skills: [
    {
      id: 'determinant',
      title:
        'Read the determinant as a signed area or volume factor, from a picture or the columns',
    },
    {
      id: 'determinant-rules',
      title: 'Use the rules of the determinant: column and row operations, products, the transpose',
    },
    {
      id: 'computing-determinants',
      title: 'Compute determinants by formula, cofactors and elimination, and areas of polygons',
    },
    { id: 'cross-product', title: 'Compute and use the cross product and the triple product' },
  ],
  terms: [
    {
      id: 'determinant',
      title: 'Determinant',
      tex: '\\det A',
      summary:
        'For a square matrix $A$: the factor by which the map $\\mathbf{x} \\mapsto A\\mathbf{x}$ scales every area (in the plane) or volume (in space), with a minus sign when the map flips orientation. For a $2 \\times 2$ matrix it is the signed area of the parallelogram of the columns.',
      introducedIn: 'area-scaling',
    },
    {
      id: 'orientation',
      title: 'Orientation',
      summary:
        'Whether the turn from the first column to the second (in the plane) is counterclockwise, or whether three vectors in space are right-handed. A map with $\\det A < 0$ flips it, as a mirror does.',
      introducedIn: 'area-scaling',
    },
    {
      id: 'parallelepiped',
      title: 'Parallelepiped',
      summary:
        'The solid spanned by three vectors of space from one corner: all $a\\mathbf{u} + b\\mathbf{v} + c\\mathbf{w}$ with $0 \\le a, b, c \\le 1$. A box whose faces are parallelograms; the image of the unit cube under a $3 \\times 3$ matrix.',
      introducedIn: 'volume-in-3d',
    },
    {
      id: 'right-handed',
      title: 'Right-handed',
      summary:
        'Three vectors $\\mathbf{u}$, $\\mathbf{v}$, $\\mathbf{w}$ of space are right-handed when, with the fingers of the right hand curling from $\\mathbf{u}$ to $\\mathbf{v}$ (the shorter way), $\\mathbf{w}$ lies on the side the thumb points to. $\\hat{\\imath}, \\hat{\\jmath}, \\hat{k}$ are right-handed; $\\det[\\mathbf{u}\\ \\mathbf{v}\\ \\mathbf{w}] > 0$ exactly when the triple is.',
      introducedIn: 'volume-in-3d',
    },
    {
      id: 'minor',
      title: 'Minor',
      tex: '\\det M_{ij}',
      summary:
        'For entry $(i, j)$ of a square matrix: the determinant of the matrix $M_{ij}$ left when row $i$ and column $j$ are removed.',
      introducedIn: 'computing-determinants',
    },
    {
      id: 'cofactor',
      title: 'Cofactor',
      tex: 'C_{ij}',
      summary:
        'The minor with the sign of a checkerboard: $C_{ij} = (-1)^{i + j}\\det M_{ij}$. Cofactor expansion along row $i$ gives $\\det A = \\sum_j a_{ij}C_{ij}$, and the same along any column.',
      introducedIn: 'computing-determinants',
    },
    {
      id: 'triangular-matrix',
      title: 'Triangular matrix',
      summary:
        'A square matrix with only zeros below its diagonal (upper triangular) or only zeros above it (lower triangular). Its determinant is the product of the diagonal entries.',
      introducedIn: 'computing-determinants',
    },
  ],
})
