import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Inverse functions',
  summary:
    'An inverse function runs a rule backward. Its graph is the reflection across the line y = x, which exists as a function only when no output is repeated.',
  tags: ['function', 'inverse', 'reflection', 'horizontal line test', 'one-to-one'],
  level: 'intro',
  order: 6,
  skills: ['inverse'],
  steps: [
    {
      id: 'undo',
      title: 'Run the rule backward',
      caption:
        '$f(x) = 2x + 1$ doubles and adds one. The inverse undoes this: subtract one, then halve, so $f^{-1}(x) = \\frac{x - 1}{2}$. Since $f(1) = 3$, $f^{-1}(3) = 1$.',
    },
    {
      id: 'reflect',
      title: 'Swap the coordinates',
      caption:
        'Every point $(a, b)$ on the graph of $f$ becomes $(b, a)$ on the graph of $f^{-1}$. Swapping coordinates is a reflection across the line $y = x$.',
    },
    {
      id: 'horizontal-line',
      title: 'The horizontal line test',
      caption:
        '$f(x) = x^2 - 1$ sends $2$ and $-2$ to the same output $3$, so $f^{-1}(3)$ has no single value. Its reflection fails the vertical line test; equivalently, a horizontal line crosses $f$ twice.',
    },
    {
      id: 'restrict',
      title: 'Restrict the domain',
      caption:
        'Keeping only $x \\geq 0$ removes the repeated outputs. On that domain $x^2 - 1$ has the inverse $f^{-1}(x) = \\sqrt{x + 1}$, defined for $x \\geq -1$.',
    },
  ],
})
