import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'The derivative as a limit',
  summary:
    'A secant line through two points of a curve turns into the tangent line as the points merge. Its slope becomes the derivative.',
  tags: ['derivative', 'limit', 'secant', 'tangent', 'slope', 'rate of change'],
  level: 'intro',
  skills: ['secant-slope', 'definition'],
  order: 1,
  steps: [
    {
      id: 'secant',
      title: 'Two points, one line',
      caption:
        'The secant through $P$ and $Q$ rises $\\Delta y$ over a run of $h$. Its slope $\\Delta y / h$ is the average rate of change on that interval.',
    },
    {
      id: 'shrink',
      title: 'Shrink the gap',
      caption: 'Make $h$ smaller. $Q$ slides toward $P$ and the secant pivots around $P$.',
    },
    {
      id: 'limit',
      title: 'Take the limit',
      caption:
        "As $h \\to 0$ the slope settles on a single number, $f'(x_0)$. The line it describes is the tangent at $P$.",
      check: {
        kind: 'choice',
        prompt: 'As $h$ shrinks toward 0, the secant slope approaches:',
        options: [
          '$f(x_0)$, the height of the curve at $P$',
          "$f'(x_0)$, the slope of the tangent at $P$",
          '$0$, because the run $h$ vanishes',
          'Nothing, because the quotient becomes $0/0$',
        ],
        answer: 1,
        explanation:
          "The difference quotient is never evaluated at $h = 0$. Its limit as $h \\to 0$ is the definition of $f'(x_0)$.",
      },
    },
    {
      id: 'function',
      title: 'A new function',
      caption:
        "Repeat this at every $x$ and you get the derivative function $f'(x)$. Drag $P$ and watch its slope trace the dashed curve.",
      check: {
        kind: 'number',
        prompt: "For $f(x) = 0.1x^3 - 0.8x^2 + 1.6x + 1$, what is $f'(2)$?",
        answer: -0.4,
        tolerance: 0.005,
        explanation:
          "$f'(x) = 0.3x^2 - 1.6x + 1.6$, so $f'(2) = 1.2 - 3.2 + 1.6 = -0.4$. Drag $P$ to $x_0 = 2$ to see it in the readout.",
      },
    },
  ],
})
