import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The dot product',
  summary:
    "Multiply matching components and add: one number that measures how much two vectors point the same way. It equals the shadow of one vector on the other times the other length, and the lengths times the cosine of the angle, so for nonzero vectors a zero dot product means perpendicular. As a weighted sum it computes a bill or a model's score, and cosine similarity compares feature vectors with it.",
  tags: [
    'dot product',
    'inner product',
    'projection',
    'angle between vectors',
    'orthogonal',
    'cosine similarity',
    'weighted sum',
    'Cauchy-Schwarz inequality',
    'triangle inequality',
  ],
  level: 'core',
  order: 5,
  skills: ['dot-product'],
  steps: [
    {
      id: 'components',
      title: 'Multiply and add',
      caption:
        'Multiply matching components and add the products: $\\mathbf{v} \\cdot \\mathbf{w} = v_1 w_1 + v_2 w_2$. The result is a number, not a vector. Drag either tip.',
    },
    {
      id: 'projection',
      title: 'Shadow times length',
      caption:
        'Drop a perpendicular from the tip of $\\mathbf{w}$ to the line of $\\mathbf{v}$. The shadow it marks, with a sign, times $\\lVert \\mathbf{v} \\rVert$ is the same number $\\mathbf{v} \\cdot \\mathbf{w}$. A shadow pointing backward makes it negative.',
    },
    {
      id: 'angle',
      title: 'The angle',
      caption:
        'For nonzero vectors, the shadow of $\\mathbf{w}$ is $\\lVert \\mathbf{w} \\rVert \\cos\\theta$, so $\\mathbf{v} \\cdot \\mathbf{w} = \\lVert \\mathbf{v} \\rVert \\lVert \\mathbf{w} \\rVert \\cos\\theta$. As $\\mathbf{w}$ turns, the sign follows the angle: positive below $90^\\circ$, negative above.',
    },
    {
      id: 'orthogonal',
      title: 'Perpendicular',
      caption:
        'At $90^\\circ$ the shadow is a point and $\\mathbf{v} \\cdot \\mathbf{w} = 0$. Here $(3, 1) \\cdot (-1, 3) = -3 + 3 = 0$: for nonzero vectors, a zero dot product is the test for perpendicular, or orthogonal, vectors.',
    },
    {
      id: 'bound',
      title: 'Never more than the lengths',
      caption:
        'A shadow is never longer than the vector, so $\\lvert \\mathbf{v} \\cdot \\mathbf{w} \\rvert \\le \\lVert \\mathbf{v} \\rVert \\lVert \\mathbf{w} \\rVert$, with equality exactly when one is a multiple of the other. This is the Cauchy-Schwarz inequality.',
    },
    {
      id: 'similarity',
      title: 'Cosine similarity',
      caption:
        'Each document is a vector of word counts. Dividing the dot product by both lengths leaves $\\cos\\theta$, which compares directions and ignores length: a long and a short article on the same topic score close to $1$. Drag the query $\\mathbf{q}$.',
    },
  ],
})
