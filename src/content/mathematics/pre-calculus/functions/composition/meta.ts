import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Composing functions',
  summary:
    'Feeding the output of one function into another builds a new function. Three number lines show the two steps, why the order matters, and the single map that results.',
  tags: ['function', 'composition', 'number line', 'order'],
  level: 'intro',
  order: 5,
  skills: ['compose'],
  steps: [
    {
      id: 'chain',
      title: 'One output becomes the next input',
      caption:
        'With $g(x) = x + 1$ and $f(u) = u^2$, the input $x$ first goes to $g(x)$, and that value goes to $f(g(x))$. For $x = 1$: $f(g(1)) = f(2) = 4$.',
    },
    {
      id: 'many',
      title: 'Many inputs at once',
      caption:
        'Each input follows its own pair of arrows. $g$ slides every point one unit right; $f$ folds the line at $0$ and stretches it, so $-2$ and $0$ end at the same output.',
    },
    {
      id: 'order',
      title: 'Order matters',
      caption:
        'Swap the order: $g(f(x)) = x^2 + 1$ squares first and shifts after. For $x = 1$ this gives $2$, while $f(g(1)) = 4$. In general $f \\circ g \\neq g \\circ f$.',
    },
    {
      id: 'direct',
      title: 'One function',
      caption:
        'Hide the middle line and the two steps become a single map, the composition $(f \\circ g)(x) = f(g(x)) = (x + 1)^2$.',
    },
  ],
})
