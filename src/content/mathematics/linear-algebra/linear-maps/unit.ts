import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Linear transformations',
  description: 'Matrices as functions of the plane, composition and the determinant.',
  order: 2,
  skills: [
    { id: 'matrix-columns', title: 'Columns as images of the basis vectors' },
    { id: 'determinant', title: 'The determinant as signed area' },
  ],
  terms: [
    {
      id: 'linear-transformation',
      title: 'Linear transformation',
      summary:
        'A function of the plane that fixes the origin and keeps grid lines straight, parallel and evenly spaced, so $A(x\\mathbf{v} + y\\mathbf{w}) = x\\,A\\mathbf{v} + y\\,A\\mathbf{w}$.',
      introducedIn: 'matrix-transformations',
    },
    {
      id: 'basis-vectors',
      title: 'Basis vectors',
      tex: '\\hat{\\imath},\\ \\hat{\\jmath}',
      summary:
        'The unit vectors along the axes. Every vector is $x\\hat{\\imath} + y\\hat{\\jmath}$, so a linear transformation is fixed by where these two land.',
      introducedIn: 'matrix-transformations',
    },
    {
      id: 'matrix',
      title: 'Matrix',
      tex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      summary:
        'A grid of numbers that describes a linear transformation. Its columns are the images of the basis vectors: $A\\hat{\\imath} = (a, c)$ and $A\\hat{\\jmath} = (b, d)$.',
      introducedIn: 'matrix-transformations',
    },
    {
      id: 'determinant',
      title: 'Determinant',
      tex: '\\det A = ad - bc',
      summary:
        'The signed factor by which a transformation scales areas. Negative means the plane is flipped; zero means it collapses and $A$ has no inverse.',
      introducedIn: 'matrix-transformations',
    },
  ],
})
