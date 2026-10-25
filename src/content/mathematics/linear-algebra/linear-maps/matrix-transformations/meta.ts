import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  title: 'Matrices as transformations',
  summary:
    'A linear map of the plane is fixed by where it sends $\\hat{\\imath}$ and $\\hat{\\jmath}$. Those two images are the columns of its $2 \\times 2$ matrix, so a matrix can be read from a picture and a picture drawn from a matrix.',
  tags: ['matrix', 'linear map', 'linear transformation', 'basis', 'columns', 'shear', 'rotation'],
  level: 'core',
  skills: ['matrix-columns', 'linear-maps'],
  order: 2,
  steps: [
    {
      id: 'basis',
      title: 'Every vector from the basis',
      caption:
        'Every vector of the plane is a combination of $\\hat{\\imath} = (1, 0)$ and $\\hat{\\jmath} = (0, 1)$: $\\mathbf{x} = (x, y)$ is $x\\hat{\\imath} + y\\hat{\\jmath}$. Here $\\mathbf{x} = 2\\hat{\\imath} + \\hat{\\jmath}$.',
    },
    {
      id: 'columns',
      title: 'Where the basis lands',
      caption:
        'A linear map keeps combinations, so $T(\\mathbf{x}) = 2\\,T(\\hat{\\imath}) + T(\\hat{\\jmath})$: the same weights, new vectors. The matrix stores $T(\\hat{\\imath})$ and $T(\\hat{\\jmath})$ as its two columns.',
    },
    {
      id: 'read',
      title: 'Reading a matrix from a picture',
      caption:
        'To read the matrix of a drawn map, find the tips of the images of $\\hat{\\imath}$ and $\\hat{\\jmath}$. Here $T(\\hat{\\imath}) = (1, 1)$ and $T(\\hat{\\jmath}) = (-1, 0.5)$ are the columns, in that order.',
    },
    {
      id: 'draw',
      title: 'Drawing a map from a matrix',
      caption:
        'Going the other way, the matrix with columns $(2, 0)$ and $(1, 1)$ puts $\\hat{\\imath}$ at $(2, 0)$ and $\\hat{\\jmath}$ at $(1, 1)$, and the rest of the grid follows. Drag the tips to set the columns yourself.',
    },
    {
      id: 'italic',
      title: 'Italic type is a shear',
      caption:
        'Slanting type keeps $\\hat{\\imath}$ and moves $\\hat{\\jmath}$ to $(0.25, 1)$. Upright strokes lean, the baseline stays where it was, and the letter keeps its height: a shear.',
    },
    {
      id: 'presets',
      title: 'A few maps',
      caption:
        'A rotation turns the letter without changing its shape or size; a reflection flips it; a scaling stretches it; a projection flattens it onto a line. Pick a map, then read its columns.',
    },
  ],
})
