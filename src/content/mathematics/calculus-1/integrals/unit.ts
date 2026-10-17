import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Integrals',
  description: 'Riemann sums, the definite integral, the fundamental theorem and substitution.',
  order: 4,
  skills: [{ id: 'riemann-sums', title: 'Approximating area with Riemann sums' }],
  terms: [
    {
      id: 'riemann-sum',
      title: 'Riemann sum',
      tex: '\\sum_{k} f(x_k^*)\\,\\Delta x',
      summary:
        'The total area of rectangles of width $\\Delta x = \\frac{b - a}{n}$ and height $f(x_k^*)$ at a sample point in each strip. Left, right, midpoint and trapezoid rules pick the heights differently.',
      introducedIn: 'riemann-sums',
    },
    {
      id: 'definite-integral',
      title: 'Definite integral',
      tex: '\\int_a^b f(x)\\,dx',
      summary:
        'The limit of Riemann sums as $n \\to \\infty$: the signed area between the graph of $f$ and the $x$-axis from $a$ to $b$. For continuous $f$ every choice of sample points gives the same limit.',
      introducedIn: 'riemann-sums',
    },
  ],
})
