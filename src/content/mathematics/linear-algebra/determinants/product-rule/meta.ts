import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'The product rule',
  summary:
    'Doing one map after another multiplies their area factors: $\\det(AB) = \\det A \\det B$, so two flips make none and $\\det(A^k) = (\\det A)^k$. Undoing a map needs $\\det A \\ne 0$ and scales by $\\frac{1}{\\det A}$; $\\det(cA) = c^n\\det A$; the factor is the same in every basis; and $\\det(A - \\lambda I) = 0$ asks which $\\lambda$ collapses the plane.',
  tags: ['determinant', 'product rule', 'composition', 'inverse', 'change of basis', 'eigenvalue'],
  level: 'core',
  order: 6,
  skills: ['determinant-rules'],
  steps: [
    {
      id: 'twice',
      title: 'Scaling twice',
      caption:
        '$A$ scales every area by $\\det A = 2$, then $B$ scales every area by $\\det B = 1.5$. Together the unit square ends with area $2 \\times 1.5 = 3$, so $\\det(BA) = \\det B \\det A$.',
    },
    {
      id: 'flips',
      title: 'Two flips make none',
      caption:
        'A reflection across the line $y = x$ flips orientation ($\\det = -1$), and so does a reflection across the $x$-axis. One after the other, the F reads normally again: $(-1)(-1) = 1$, and the result is a rotation by $90^\\circ$ clockwise.',
    },
    {
      id: 'powers',
      title: 'Powers',
      caption:
        '$A^k$ applies $A$ $k$ times, so it scales areas by $\\det A$ $k$ times: $\\det(A^k) = (\\det A)^k$. Here $\\det A = 1.5$. Move $k$.',
    },
    {
      id: 'inverse',
      title: 'Undoing a map',
      caption:
        'If $B$ undoes $A$ ($BA = I$), then $\\det B \\det A = \\det I = 1$, so $\\det B = \\frac{1}{\\det A}$. When $\\det A = 0$ no map undoes $A$: the plane is squeezed onto a line. Move the second column until it lands on the line of the first.',
    },
    {
      id: 'scalar',
      title: 'Scaling the whole matrix',
      caption:
        '$cA$ scales both columns by $c$, so the parallelogram is $c$ times as wide in each direction and $c^2$ copies of the old one fit inside: $\\det(cA) = c^2\\det A$ in the plane, $c^n\\det A$ for $n \\times n$. Move $c$.',
    },
    {
      id: 'basis',
      title: 'Any basis gives the same factor',
      caption:
        'Take any basis $\\mathbf{b}_1, \\mathbf{b}_2$ (blue). The map sends its cell to the cell of $A\\mathbf{b}_1, A\\mathbf{b}_2$ (teal), whose area is $\\det A$ times larger. The matrix of the map in that basis looks different, but its determinant is the same. Drag $\\mathbf{b}_1$ and $\\mathbf{b}_2$.',
    },
    {
      id: 'eigen',
      title: 'Which $\\lambda$ collapses $A - \\lambda I$?',
      caption:
        'Subtract $\\lambda$ from the diagonal of $A$. For most $\\lambda$ the columns of $A - \\lambda I$ span an area; at $\\lambda = 1$ and $\\lambda = 3$ the parallelogram goes flat: $\\det(A - \\lambda I) = 0$. Those $\\lambda$ are the eigenvalues of a later unit. Move $\\lambda$.',
    },
  ],
})
