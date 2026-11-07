import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Composition',
  summary:
    'One linear map after another is again a linear map, and its matrix is the product $AB$: first $B$, then $A$. The columns of $AB$ are $A$ applied to the columns of $B$. The order matters, $AB \\ne BA$ in general, though two rotations commute.',
  tags: [
    'composition',
    'matrix product',
    'matrix multiplication',
    'linear map',
    'rotation',
    'shear',
  ],
  level: 'core',
  order: 6,
  skills: ['matrix-multiplication'],
  steps: [
    {
      id: 'twice',
      title: 'One map after another',
      caption:
        'First the shear $B$ moves the plane, and $\\mathbf{x}$ lands on $B\\mathbf{x}$. Then the quarter turn $A$ moves the result, and $B\\mathbf{x}$ lands on $A(B\\mathbf{x})$. The two moves together are one linear map. Drag $\\mathbf{x}$.',
    },
    {
      id: 'columns',
      title: 'The columns of the product',
      caption:
        'The matrix of "first $B$, then $A$" is called $AB$. Its columns are where $\\hat{\\imath}$ and $\\hat{\\jmath}$ end up: $B$ sends them to the columns $\\mathbf{b}_1$, $\\mathbf{b}_2$ of $B$, then $A$ moves those. So column $j$ of $AB$ is $A\\mathbf{b}_j$. Drag the columns of $B$.',
    },
    {
      id: 'order',
      title: 'The order matters',
      caption:
        'Shear then rotate ($AB$) and rotate then shear ($BA$) leave the letter in different places, so $AB \\ne BA$. The matrix written on the right acts first, as in $A(B\\mathbf{x})$. Switch the order to compare.',
    },
    {
      id: 'commute',
      title: 'Two rotations commute',
      caption:
        'Some pairs do commute. A turn by $\\alpha$ after a turn by $\\beta$ is a turn by $\\alpha + \\beta$, in either order: $R_\\alpha R_\\beta = R_\\beta R_\\alpha = R_{\\alpha + \\beta}$. Move the angles and switch the order.',
    },
  ],
})
