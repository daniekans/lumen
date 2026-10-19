import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Basis and coordinates',
  summary:
    'A basis is a set of independent vectors that spans the space. Every vector is then exactly one combination of them, and its weights are its coordinates in that basis. The usual components are the coordinates in the standard basis; another basis draws another grid and gives the same arrow other coordinates.',
  tags: [
    'basis',
    'standard basis',
    'coordinates',
    'linear combination',
    'linear independence',
    'span',
    '3D',
  ],
  level: 'core',
  order: 9,
  skills: ['basis-coordinates'],
  steps: [
    {
      id: 'standard',
      title: 'Components are weights',
      caption:
        'The components of $\\mathbf{x} = (3, 4)$ are weights: $\\mathbf{x} = 3\\hat{\\imath} + 4\\hat{\\jmath}$, with $\\hat{\\imath} = (1, 0)$ and $\\hat{\\jmath} = (0, 1)$. These two form the standard basis, and the usual grid is their grid of whole-number weights.',
    },
    {
      id: 'new-basis',
      title: 'Another basis',
      caption:
        'Replace them with $\\mathbf{b}_1 = (2, 1)$ and $\\mathbf{b}_2 = (-1, 2)$. Their grid is the slanted one, and $\\mathbf{x}$ stays where it is: $\\mathbf{x} = 2\\mathbf{b}_1 + 1\\mathbf{b}_2$, so its coordinates in this basis are $(2, 1)$.',
    },
    {
      id: 'move-basis',
      title: 'Same arrow, other coordinates',
      caption:
        'Turn $\\mathbf{b}_2$ to $(1, 3)$: now $\\mathbf{x} = \\mathbf{b}_1 + \\mathbf{b}_2$, with coordinates $(1, 1)$. The arrow never moved; only the description changed. Drag the tips of $\\mathbf{b}_1$, $\\mathbf{b}_2$ and $\\mathbf{x}$.',
    },
    {
      id: 'not-a-basis',
      title: 'When it is not a basis',
      caption:
        'Now $\\mathbf{b}_2 = -\\frac{1}{2}\\mathbf{b}_1$. The two span only a line, so $\\mathbf{x}$ has no coordinates, and a point on the line has many. A basis needs both: the vectors span, and they are independent.',
    },
    {
      id: 'space',
      title: 'A basis of space',
      caption:
        'Three independent vectors of space form a basis of $\\mathbb{R}^3$. Here $\\mathbf{x} = (-3, 2, 2) = -\\mathbf{b}_1 + \\mathbf{b}_2 + \\mathbf{b}_3$, so $[\\mathbf{x}]_{\\mathcal{B}} = (-1, 1, 1)$. Drag the tip of $\\mathbf{x}$ and turn the view.',
    },
  ],
})
