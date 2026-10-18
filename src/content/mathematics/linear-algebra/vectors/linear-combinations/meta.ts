import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Linear combinations',
  summary:
    'Scale two vectors and add them: av + bw. Two vectors that are not parallel reach every point of the plane, each with exactly one pair of weights, and draw a grid of their own. Two parallel vectors reach only a line.',
  tags: ['linear combination', 'weights', 'vector addition', 'scalar', 'parallel vectors'],
  level: 'core',
  order: 2,
  skills: ['linear-combinations'],
  steps: [
    {
      id: 'weights',
      title: 'Two vectors, two weights',
      caption:
        'Scale $\\mathbf{v}$ by $a$, scale $\\mathbf{w}$ by $b$, and add: $a\\mathbf{v} + b\\mathbf{w}$ is a linear combination of $\\mathbf{v}$ and $\\mathbf{w}$, with weights $a$ and $b$. Move the weights.',
    },
    {
      id: 'target',
      title: 'Reaching a point',
      caption:
        'The weights $a = 2$, $b = 1$ reach $\\mathbf{u} = (3, 4)$, since $2(2, 1) + (-1, 2) = (3, 4)$. Drag the tip of the combination: the weights follow it.',
    },
    {
      id: 'grid',
      title: 'A grid of combinations',
      caption:
        'Whole-number weights mark a grid drawn by $\\mathbf{v}$ and $\\mathbf{w}$. Every point of the plane lies on it with exactly one pair $(a, b)$, the way every point has one pair of coordinates $(x, y)$.',
    },
    {
      id: 'parallel',
      title: 'Parallel vectors',
      caption:
        'Now $\\mathbf{w} = -\\frac{1}{2}\\mathbf{v}$. Every combination is $(a - \\frac{b}{2})\\mathbf{v}$, a multiple of $\\mathbf{v}$, so only the line through $\\mathbf{v}$ is reached and $\\mathbf{u}$ is out of reach. Move the weights.',
    },
  ],
})
