import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Vectors',
  summary:
    'A vector is an arrow and a list of numbers at the same time. Arrows add tip to tail and stretch when scaled; the lists add and scale component by component. A row of a data table is a vector too.',
  tags: ['vector', 'component', 'vector addition', 'scalar', 'zero vector', 'feature vector'],
  level: 'core',
  order: 1,
  skills: ['vector-arithmetic'],
  steps: [
    {
      id: 'arrow',
      title: 'An arrow and two numbers',
      caption:
        'The arrow from the origin to the point $(3, 1)$ is the vector $\\mathbf{v} = (3, 1)$: $3$ to the right, $1$ up. The two numbers are its components. Drag the tip.',
    },
    {
      id: 'same-vector',
      title: 'The same vector anywhere',
      caption:
        'An arrow in the plane has a length and a direction but no fixed position. Every arrow that goes $3$ right and $1$ up is the same $\\mathbf{v}$, wherever its tail is. Drag the tail.',
    },
    {
      id: 'add',
      title: 'Adding: tip to tail',
      caption:
        'To add $\\mathbf{w}$ to $\\mathbf{v}$, start $\\mathbf{w}$ where $\\mathbf{v}$ ends. The arrow from the origin to the final tip is $\\mathbf{v} + \\mathbf{w}$, and its components are the sums of the components.',
    },
    {
      id: 'order',
      title: 'Either order',
      caption:
        'Starting with $\\mathbf{w}$ and then going along $\\mathbf{v}$ ends at the same point. The two paths are the sides of a parallelogram, so $\\mathbf{v} + \\mathbf{w} = \\mathbf{w} + \\mathbf{v}$.',
    },
    {
      id: 'scale',
      title: 'Scaling',
      caption:
        'Multiplying by a number $c$ stretches the arrow by $\\lvert c \\rvert$ and multiplies each component by $c$. A negative $c$ reverses the direction, and $c = 0$ gives the zero vector $\\mathbf{0}$. Move $c$.',
    },
    {
      id: 'subtract',
      title: 'Subtracting',
      caption:
        'The difference $\\mathbf{w} - \\mathbf{v}$ is the arrow from the tip of $\\mathbf{v}$ to the tip of $\\mathbf{w}$, because $\\mathbf{v} + (\\mathbf{w} - \\mathbf{v}) = \\mathbf{w}$. It is also $\\mathbf{w} + (-1)\\mathbf{v}$.',
    },
    {
      id: 'table',
      title: 'A row of a table',
      caption:
        'Each row of this table lists two measurements of one student, so each row is a vector in $\\mathbb{R}^2$. The average row is $\\frac{1}{3}(\\mathbf{r}_1 + \\mathbf{r}_2 + \\mathbf{r}_3)$: one addition and one scaling. Pick a row.',
    },
  ],
})
