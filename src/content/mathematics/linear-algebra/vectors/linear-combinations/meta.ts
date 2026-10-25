import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Linear combinations',
  summary:
    'Scale two vectors and add them: av + bw. Two vectors that are not parallel reach every point of the plane, each with exactly one pair of weights, and draw a grid of their own. Two parallel vectors reach only a line. With weights that cannot be negative, such as servings of two foods, only a wedge is reached.',
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
        'Whole-number weights mark a grid drawn by $\\mathbf{v}$ and $\\mathbf{w}$. Every point of the plane, on the grid lines or between them, is reached by exactly one pair $(a, b)$, whole or not, the way every point has one pair of coordinates $(x, y)$.',
    },
    {
      id: 'parallel',
      title: 'Parallel vectors',
      caption:
        'Now $\\mathbf{w} = -\\frac{1}{2}\\mathbf{v}$. Every combination is $(a - \\frac{b}{2})\\mathbf{v}$, a multiple of $\\mathbf{v}$, so only the line through $\\mathbf{v}$ is reached and $\\mathbf{u}$ is out of reach. Move the weights.',
    },
    {
      id: 'mix',
      title: 'Mixing two foods',
      caption:
        'A serving of food A has $20$ g of protein and $10$ g of carbs, and food B has $5$ g and $20$ g. A meal of $a$ servings of A and $b$ of B is $a\\mathbf{v} + b\\mathbf{w}$. Servings cannot be negative, so the meals fill only the shaded wedge between the two arrows. Drag the tip.',
    },
  ],
})
