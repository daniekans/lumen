import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Domain and range',
  summary:
    'The domain is the shadow of a graph on the $x$-axis, the range its shadow on the $y$-axis. Square roots, fractions and restricted rules each cut these shadows differently.',
  tags: ['function', 'domain', 'range', 'interval notation', 'square root', 'asymptote'],
  level: 'intro',
  order: 2,
  skills: ['domain-range'],
  steps: [
    {
      id: 'domain',
      title: 'Inputs that work',
      caption:
        'The domain of $f(x) = \\sqrt{x + 2}$ is every $x$ with $x + 2 \\geq 0$, so $[-2, \\infty)$. Drag $x$ below $-2$: there is no output, and the vertical line misses the graph.',
    },
    {
      id: 'range',
      title: 'Outputs that occur',
      caption:
        'The range is every value $f$ actually reaches. A horizontal line at height $c$ meets the graph exactly when $f(x) = c$ has a solution, so here the range is $[0, \\infty)$.',
    },
    {
      id: 'gap',
      title: 'A hole in each shadow',
      caption:
        'For $f(x) = \\frac{1}{x - 1} + 1$ the input $x = 1$ divides by zero, and the output $1$ would need $\\frac{1}{x - 1} = 0$, which never happens. Both shadows have a gap.',
    },
    {
      id: 'parabola',
      title: 'Every input, not every output',
      caption:
        'The domain of $f(x) = x^2 - 3$ is all real numbers. Since $x^2 \\geq 0$, the outputs start at $-3$: the range is $[-3, \\infty)$, and most heights are reached twice.',
    },
    {
      id: 'restricted',
      title: 'A restricted rule',
      caption:
        'A rule can state its own domain. For $f(x) = 3 - \\frac{x}{2}$ on $-2 \\leq x < 4$, the closed end gives a filled dot and the open end a hollow one, on the graph and on both shadows.',
    },
  ],
})
