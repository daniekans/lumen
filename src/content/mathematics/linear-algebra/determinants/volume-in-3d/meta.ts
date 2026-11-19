import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Volume in space',
  summary:
    'A $3 \\times 3$ matrix sends the unit cube to the parallelepiped of its columns and multiplies every volume by the same factor. With a sign for right- or left-handed columns, that factor is $\\det A$. It is $0$ when space collapses onto a plane or a line, and a tetrahedron on three edges has one sixth of the volume.',
  tags: ['determinant', 'volume', 'parallelepiped', 'orientation', 'right-handed', '3D'],
  level: 'core',
  order: 2,
  skills: ['determinant'],
  steps: [
    {
      id: 'cube',
      title: 'The unit cube',
      caption:
        'The unit cube lands on the parallelepiped with edges $A\\hat{\\imath}$, $A\\hat{\\jmath}$, $A\\hat{k}$, the columns. Its volume, here $1.5$, is the factor by which the map scales every volume, for the same reason as in the plane. Drag the tips of the columns.',
    },
    {
      id: 'handedness',
      title: 'Right- and left-handed',
      caption:
        'Curl the fingers of your right hand along the arc, from $A\\hat{\\imath}$ to $A\\hat{\\jmath}$: when $A\\hat{k}$ is on the side your thumb points to, the columns are right-handed, like $\\hat{\\imath}, \\hat{\\jmath}, \\hat{k}$, and $\\det A > 0$. Move $A\\hat{k}$ through the floor: the box flattens and comes back as its mirror image, left-handed, with $\\det A < 0$.',
    },
    {
      id: 'collapse',
      title: 'Collapse',
      caption:
        'When the three columns lie in one plane, the box is flat and space lands on that plane: $\\det A = 0$. When they lie on one line, space lands on the line.',
    },
    {
      id: 'tetrahedron',
      title: 'A tetrahedron',
      caption:
        'The tetrahedron with corners $\\mathbf{0}$, $A\\hat{\\imath}$, $A\\hat{\\jmath}$, $A\\hat{k}$ has one sixth of the volume of the box: $\\frac{1}{6}|\\det A|$. Drag the columns; the ratio stays.',
    },
  ],
})
