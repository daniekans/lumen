import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Rational expressions',
  summary:
    'A rational expression is a fraction of polynomials. Factor, cancel and combine them like fractions of numbers, and keep track of the excluded values: the graph shows them as holes and asymptotes.',
  tags: ['rational expression', 'cancel', 'excluded value', 'hole', 'common denominator'],
  level: 'intro',
  order: 5,
  skills: ['rational-expressions', 'factor'],
  steps: [
    {
      id: 'hole',
      title: 'Cancelling leaves a hole',
      caption:
        '$\\frac{x^2 - x - 6}{x - 3} = \\frac{(x - 3)(x + 2)}{x - 3}$ equals $x + 2$ everywhere except $x = 3$, where it is $\\frac{0}{0}$. The graph is the line with one point missing. Drag $x$ toward $3$.',
      check: {
        kind: 'number',
        prompt: 'The graph has a hole at $x = 3$. What is its $y$-coordinate?',
        answer: 5,
        explanation:
          'Away from $x = 3$ the expression equals $x + 2$, so the values approach $3 + 2 = 5$. The point $(3, 5)$ itself is missing.',
      },
    },
    {
      id: 'excluded',
      title: 'Excluded values',
      caption:
        'Exclude every zero of the original denominator. A factor that cancels leaves a hole; a factor that stays in the denominator gives a vertical asymptote.',
      check: {
        kind: 'choice',
        prompt: 'Which values are excluded from the domain of $\\frac{x + 2}{x^2 + x - 2}$?',
        options: ['$x = -2$ and $x = 1$', 'Only $x = 1$', 'Only $x = -2$', 'None'],
        answer: 0,
        explanation:
          '$x^2 + x - 2 = (x + 2)(x - 1)$ is zero at both. After cancelling, $\\frac{1}{x - 1}$ hides the $x = -2$ restriction, but the original expression is still undefined there.',
      },
    },
    {
      id: 'multiply',
      title: 'Multiplying',
      caption:
        'Multiply numerators and denominators, factor, and cancel. Every denominator factor of either fraction is excluded, so this product of two fractions is a line with two holes.',
      check: {
        kind: 'number',
        prompt:
          'The product equals $x - 1$ with holes at $x = -2$ and $x = -1$. What is the $y$-coordinate of the hole at $x = -2$?',
        answer: -3,
        explanation: 'The line $y = x - 1$ passes through $(-2, -3)$, and that point is missing.',
      },
    },
    {
      id: 'add',
      title: 'Adding over a common denominator',
      caption:
        'Fractions add once they share a denominator: $\\frac{1}{x - 1} + \\frac{1}{x + 1} = \\frac{(x + 1) + (x - 1)}{(x - 1)(x + 1)}$. On the graph, the heights of the two curves add at every $x$.',
      check: {
        kind: 'choice',
        prompt: 'Which is $\\frac{1}{x - 1} + \\frac{1}{x + 1}$?',
        options: [
          '$\\frac{2x}{x^2 - 1}$',
          '$\\frac{2}{2x}$',
          '$\\frac{2}{x^2 - 1}$',
          '$\\frac{2x}{x - 1}$',
        ],
        answer: 0,
        explanation:
          'The numerator is $(x + 1) + (x - 1) = 2x$ over $(x - 1)(x + 1) = x^2 - 1$. Adding numerators and denominators separately, $\\frac{2}{2x}$, gives $\\frac{1}{2}$ at $x = 2$ instead of $\\frac{4}{3}$.',
      },
    },
  ],
})
