import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Exponential growth and decay',
  summary:
    'An exponential function multiplies by the same factor over every step of the same size. The base decides growth or decay, the coefficient the starting value, and a fixed time doubles or halves the value from anywhere.',
  tags: ['exponential function', 'growth factor', 'decay', 'doubling time', 'half-life'],
  level: 'intro',
  order: 1,
  skills: ['exponential-models'],
  steps: [
    {
      id: 'repeated-factor',
      title: 'Equal steps, equal factors',
      caption:
        'Each step of $1$ in $x$ multiplies $2^x$ by $2$. Going left divides by $2$, so $2^0 = 1$ and $2^{-1} = \\frac{1}{2}$: the graph never reaches the axis.',
    },
    {
      id: 'base',
      title: 'Growth or decay',
      caption:
        'For $b > 1$ the values grow, for $0 < b < 1$ they decay, and $b = 1$ is flat. Every $b^x$ passes through $(0, 1)$. The dashed curve $\\left(\\frac{1}{b}\\right)^x = b^{-x}$ is the mirror image across the $y$-axis.',
    },
    {
      id: 'initial-value',
      title: 'The starting value',
      caption:
        'In $f(x) = a \\cdot b^x$ the coefficient $a$ is the value at $x = 0$, and $b$ is the factor for each step of $1$. Move both sliders.',
    },
    {
      id: 'doubling',
      title: 'Doubling time and half-life',
      caption:
        'Moving right by the same distance $d$ doubles the value from any starting point: $b^{x + d} = b^x \\cdot b^d = 2b^x$ when $b^d = 2$. Drag $P$. For $b < 1$ the same distance halves the value.',
    },
    {
      id: 'outgrows',
      title: 'Faster than any power',
      caption:
        '$x^2$ is ahead of $2^x$ between $2$ and $4$, then $2^x$ pulls away for good: each step multiplies it by $2$, while $x^2$ grows by a factor that shrinks toward $1$.',
    },
  ],
})
