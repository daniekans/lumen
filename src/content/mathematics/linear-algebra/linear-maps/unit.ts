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
    {
      id: 'standard-maps',
      title: 'Write and recognize rotations, reflections, shears, scalings and projections',
    },
    {
      id: 'matrix-multiplication',
      title: 'Multiply matrices, compose maps, and use powers, the identity and transposes',
    },
    {
      id: 'maps-in-3d',
      title: 'Write 3D rotations and maps between spaces of different sizes',
    },
    {
      id: 'kernel-and-image',
      title: 'Find kernel vectors, the image and the rank of a map',
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
    {
      id: 'rotation-matrix',
      title: 'Rotation matrix',
      tex: 'R_\\theta = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}',
      summary:
        'The matrix of the rotation of the plane by $\\theta$ counterclockwise. Its columns are where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land on the unit circle. It keeps lengths, angles, areas and orientation.',
      introducedIn: 'gallery-of-maps',
    },
    {
      id: 'projection-matrix',
      title: 'Projection matrix',
      tex: 'P\\mathbf{x} = \\frac{\\mathbf{u} \\cdot \\mathbf{x}}{\\mathbf{u} \\cdot \\mathbf{u}}\\,\\mathbf{u}',
      summary:
        'The matrix of the orthogonal projection onto the line along $\\mathbf{u}$: each vector goes to the foot of its perpendicular on the line. Its entries are $\\frac{u_iu_j}{\\mathbf{u} \\cdot \\mathbf{u}}$, and projecting twice gives the same as once.',
      introducedIn: 'gallery-of-maps',
    },
    {
      id: 'matrix-product',
      title: 'Matrix product',
      tex: 'AB = \\begin{bmatrix} A\\mathbf{b}_1 & \\cdots & A\\mathbf{b}_p \\end{bmatrix}',
      summary:
        'For an $m \\times n$ matrix $A$ and an $n \\times p$ matrix $B$: the $m \\times p$ matrix of the map "first $B$, then $A$". Its column $j$ is $A$ times column $j$ of $B$, and its entry $(i, j)$ is row $i$ of $A$ dotted with column $j$ of $B$.',
      introducedIn: 'composition',
    },
    {
      id: 'transpose',
      title: 'Transpose',
      tex: 'A^T',
      summary:
        'The matrix $A$ with rows and columns swapped: entry $(i, j)$ of $A^T$ is entry $(j, i)$ of $A$. An $m \\times n$ matrix has an $n \\times m$ transpose, and $(AB)^T = B^TA^T$.',
      introducedIn: 'matrix-multiplication',
    },
    {
      id: 'subspace',
      title: 'Subspace',
      summary:
        'A set of vectors that contains $\\mathbf{0}$ and every sum and multiple of its vectors. In space: the origin alone, a line or a plane through the origin, or all of space.',
      introducedIn: 'kernel-and-image-preview',
    },
    {
      id: 'kernel',
      title: 'Kernel',
      tex: '\\ker A',
      summary:
        'The inputs a linear map sends to $\\mathbf{0}$: all $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{0}$. A subspace of the input space. Two inputs have the same output exactly when they differ by a kernel vector. Also called the null space.',
      introducedIn: 'kernel-and-image-preview',
    },
    {
      id: 'image',
      title: 'Image',
      tex: '\\operatorname{im} A',
      summary:
        'The outputs a linear map can reach: all $A\\mathbf{x}$. It is the span of the columns of $A$, a subspace of the output space. Also called the column space.',
      introducedIn: 'kernel-and-image-preview',
    },
    {
      id: 'rank',
      title: 'Rank',
      tex: '\\operatorname{rank} A',
      summary:
        'The dimension of the image of $A$: the number of independent directions it can reach, which is the largest number of independent columns of $A$.',
      introducedIn: 'kernel-and-image-preview',
    },
  ],
})
