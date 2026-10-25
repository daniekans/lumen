import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Linear maps and matrices',
  description:
    'Functions of space that keep linear combinations, the matrix that records where the basis lands, a matrix times a vector read by columns and by rows, and the layers of a neural network.',
  order: 2,
  skills: [
    {
      id: 'linear-maps',
      title: 'Decide whether a map is linear, and find images from the images of a basis',
    },
    { id: 'matrix-columns', title: 'Write the matrix of a map from where the basis lands' },
    {
      id: 'matrix-vector',
      title: 'Multiply a matrix and a vector, by columns and by rows, and read shapes',
    },
  ],
  terms: [
    {
      id: 'linear-transformation',
      title: 'Linear map',
      tex: 'T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v}),\\ T(c\\mathbf{v}) = cT(\\mathbf{v})',
      summary:
        'A function $T$ from $\\mathbb{R}^n$ to $\\mathbb{R}^m$ that keeps sums and multiples: $T(\\mathbf{u} + \\mathbf{v}) = T(\\mathbf{u}) + T(\\mathbf{v})$ and $T(c\\mathbf{v}) = cT(\\mathbf{v})$ for all vectors and scalars. Also called a linear transformation.',
      introducedIn: 'linear-maps',
    },
    {
      id: 'matrix',
      title: 'Matrix',
      tex: 'A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
      summary:
        'A table of numbers with $m$ rows and $n$ columns. The matrix of a linear map $\\mathbb{R}^n \\to \\mathbb{R}^m$ has as its columns the images of the standard basis vectors.',
      introducedIn: 'matrix-transformations',
    },
    {
      id: 'matrix-vector-product',
      title: 'Matrix times vector',
      tex: 'A\\mathbf{x} = x_1\\mathbf{a}_1 + \\cdots + x_n\\mathbf{a}_n',
      summary:
        'For an $m \\times n$ matrix $A$ with columns $\\mathbf{a}_1, \\ldots, \\mathbf{a}_n$ and $\\mathbf{x}$ in $\\mathbb{R}^n$: the combination of the columns with the components of $\\mathbf{x}$ as weights. Entry $i$ is also the dot product of row $i$ with $\\mathbf{x}$.',
      introducedIn: 'matrix-vector-product',
    },
    {
      id: 'identity-matrix',
      title: 'Identity matrix',
      tex: 'I',
      summary:
        'The square matrix with $1$ on the diagonal and $0$ elsewhere. Its columns are the standard basis, so $I\\mathbf{x} = \\mathbf{x}$ for every $\\mathbf{x}$.',
      introducedIn: 'matrix-vector-product',
    },
    {
      id: 'affine-map',
      title: 'Affine map',
      tex: '\\mathbf{x} \\mapsto A\\mathbf{x} + \\mathbf{b}',
      summary:
        'A linear map followed by a shift by $\\mathbf{b}$. When $\\mathbf{b} \\ne \\mathbf{0}$ it is not linear, since it moves the origin. A layer of a neural network, before its activation, is affine.',
      introducedIn: 'matrix-vector-product',
    },
  ],
})
