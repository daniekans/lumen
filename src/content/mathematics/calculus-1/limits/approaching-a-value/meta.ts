import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Approaching a value',
  summary:
    'A limit describes what f(x) gets close to as x gets close to a, from both sides, without ever using x = a. It exists even where f(a) is undefined or different, and it starts the notation of increments that grows into dy/dx.',
  tags: ['limit', 'hole', 'approach', 'increment', 'delta'],
  level: 'core',
  order: 1,
  skills: ['reading-limits'],
  steps: [
    {
      id: 'approach',
      title: 'Closing in from both sides',
      caption:
        '$f(x) = \\frac{x^3 - 1}{x - 1}$ is undefined at $x = 1$, where it gives $\\frac{0}{0}$. As $x$ closes in on $1$ from the left and from the right, $f(x)$ closes in on $3$: $\\lim_{x \\to 1} f(x) = 3$.',
    },
    {
      id: 'zoom',
      title: 'Zooming in',
      caption:
        'Zoomed in around $(1, 3)$ the curve looks straight, and the outputs of nearby inputs still crowd around $3$. However closely you look, only the points near $x = 1$ matter, never the point at $1$.',
    },
    {
      id: 'value-differs',
      title: 'The value at a does not matter',
      caption:
        'Fill the hole with any value, or leave it empty: the limit is still $3$. A limit is about the neighbors of $a$. When it equals $f(a)$, the function is continuous there.',
    },
    {
      id: 'increments',
      title: 'Increments Δx and Δy',
      caption:
        'Write the step away from $1$ as $\\Delta x$ and the change in output as $\\Delta y = f(x) - 3$. Both shrink to $0$, but their ratio $\\frac{\\Delta y}{\\Delta x} = 3 + \\Delta x$ approaches $3$, the slope at the hole. Its limit will be written $\\frac{dy}{dx}$.',
    },
  ],
})
