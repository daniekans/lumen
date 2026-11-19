import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Three rules fix the number',
  summary:
    'Three rules seen as areas: $\\det I = 1$, the determinant is linear in each column, and two equal columns give $0$. From them a shear keeps the determinant, a swap flips its sign and dependent columns give $0$; reducing a matrix to triangular form shows that the rules fix the number for every square matrix.',
  tags: ['determinant', 'linearity', 'shear', 'swap', 'triangular matrix', 'orientation'],
  level: 'core',
  order: 3,
  skills: ['determinant-rules'],
  steps: [
    {
      id: 'identity',
      title: 'Rule 1: the identity',
      caption:
        'The identity moves nothing, so the unit square keeps its area and its orientation: $\\det I = 1$. This rule sets the unit.',
    },
    {
      id: 'scale',
      title: 'Rule 2: scaling a column',
      caption:
        'Multiply the first column by $c$: the parallelogram keeps its base $\\mathbf{w}$ and its height is multiplied by $c$, so $\\det[c\\mathbf{u}\\ \\mathbf{w}] = c\\det[\\mathbf{u}\\ \\mathbf{w}]$. A negative $c$ turns the column around and flips the sign. Move $c$.',
    },
    {
      id: 'add',
      title: 'Rule 2: adding in a column',
      caption:
        'On the same base $\\mathbf{w}$, the heights of $\\mathbf{u}$ and $\\mathbf{v}$ add up to the height of $\\mathbf{u} + \\mathbf{v}$, so $\\det[\\mathbf{u} + \\mathbf{v}\\ \\ \\mathbf{w}] = \\det[\\mathbf{u}\\ \\mathbf{w}] + \\det[\\mathbf{v}\\ \\mathbf{w}]$. With scaling, this makes the determinant linear in each column. Drag $\\mathbf{u}$ and $\\mathbf{v}$.',
    },
    {
      id: 'equal',
      title: 'Rule 3: equal columns',
      caption:
        'When the second column becomes equal to the first, the parallelogram is flat: two equal columns give $\\det = 0$.',
    },
    {
      id: 'shear',
      title: 'A shear keeps the determinant',
      caption:
        'Adding $k$ times $\\mathbf{w}$ to the first column slides it parallel to the base: same base, same height. The rules say so too: $\\det[\\mathbf{u} + k\\mathbf{w}\\ \\ \\mathbf{w}] = \\det[\\mathbf{u}\\ \\mathbf{w}] + k\\det[\\mathbf{w}\\ \\mathbf{w}]$, and the last term is $0$. Move $k$.',
    },
    {
      id: 'swap',
      title: 'A swap flips the sign',
      caption:
        'Swapping the columns reverses the turn from the first to the second: the area stays and the sign flips. On the way the columns meet, and the area passes through $0$.',
    },
    {
      id: 'dependent',
      title: 'Dependent columns give zero',
      caption:
        'When the second column is a multiple $k\\mathbf{u}$ of the first, $\\det[\\mathbf{u}\\ \\ k\\mathbf{u}] = k\\det[\\mathbf{u}\\ \\mathbf{u}] = 0$. The parallelogram is flat for every $k$. Move $k$ or drag $\\mathbf{u}$.',
    },
    {
      id: 'triangular',
      title: 'The rules fix the number',
      caption:
        'Two shears, which keep the determinant, turn the columns into $2\\hat{\\imath}$ and $1.5\\hat{\\jmath}$. Then rule 2 and rule 1 give $\\det = 2 \\times 1.5 \\times \\det I = 3$. Any square matrix can be reduced this way, so the three rules fix its determinant.',
    },
  ],
})
