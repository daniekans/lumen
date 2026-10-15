import { defineViz } from '@/content/types'

export const meta = defineViz({
  title: 'Riemann sums',
  summary:
    'The area under a curve, approximated by thin strips. As the strips get narrower the sum of their areas converges to the definite integral.',
  tags: ['integral', 'riemann sum', 'area', 'trapezoid rule', 'midpoint rule', 'limit'],
  level: 'intro',
  order: 2,
  steps: [
    {
      id: 'one',
      title: 'One rectangle',
      caption:
        'Estimate the area under $f$ on $[a, b]$ with a single rectangle of width $b - a$ and height $f(a)$. The estimate is rough.',
    },
    {
      id: 'more',
      title: 'More strips',
      caption:
        'Split $[a, b]$ into $n$ strips of width $\\Delta x = (b - a)/n$. The total $\\sum f(x_k^*)\\,\\Delta x$ follows the curve more closely.',
    },
    {
      id: 'rules',
      title: 'Where to sample',
      caption:
        'Each strip takes its height from a sample point $x_k^*$: the left edge, the midpoint or the right edge. The trapezoid rule joins both edges with a slanted top.',
    },
    {
      id: 'limit',
      title: 'The limit',
      caption:
        'As $n \\to \\infty$ every rule converges to the same number, the definite integral $\\int_a^b f(x)\\,dx$.',
    },
  ],
})
