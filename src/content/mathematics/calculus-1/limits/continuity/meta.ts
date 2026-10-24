import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Continuity',
  summary:
    'A function is continuous at $a$ when $f(a)$ is defined, the limit at $a$ exists, and the two are equal. Each failed condition gives a kind of discontinuity: removable, jump, infinite or oscillating. On an interval, continuity gives the intermediate value theorem, and with it the bisection method for finding roots.',
  tags: [
    'continuity',
    'discontinuity',
    'removable discontinuity',
    'jump',
    'intermediate value theorem',
    'bisection',
  ],
  level: 'core',
  order: 6,
  skills: ['continuity'],
  steps: [
    {
      id: 'definition',
      title: 'Three conditions',
      caption:
        '$f$ is continuous at $a$ when $f(a)$ is defined, $\\lim_{x \\to a} f(x)$ exists, and they are equal. Here all three hold at $a = 1$: the graph passes through without a break.',
    },
    {
      id: 'discontinuities',
      title: 'Kinds of discontinuity',
      caption:
        'A removable discontinuity has a limit that misses the value, a jump has one-sided limits that differ, an infinite one has a vertical asymptote, and an oscillating one has no limit at all. Pick a kind and see which condition fails.',
    },
    {
      id: 'parameter',
      title: 'Choosing a constant',
      caption:
        'The left piece $x^2 + c$ tends to $4 + c$ at $x = 2$, and the right piece $3x - 1$ gives $5$. The graph joins up only when $4 + c = 5$, that is $c = 1$. Move $c$.',
    },
    {
      id: 'ivt',
      title: 'The intermediate value theorem',
      caption:
        '$f(x) = x^3 - x - 1$ is continuous on $[1, 2]$ with $f(1) = -1$ and $f(2) = 5$. A continuous graph cannot skip a height, so every value $N$ between $-1$ and $5$ is reached at some $c$ in $(1, 2)$. Move $N$.',
    },
    {
      id: 'bisection',
      title: 'Bisection',
      caption:
        'For $N = 0$ the theorem says $f$ has a root in $[1, 2]$. Check the sign at the midpoint and keep the half where the sign changes. Each step halves the interval, and the view zooms with it: 10 steps give 3 decimal places.',
    },
  ],
})
