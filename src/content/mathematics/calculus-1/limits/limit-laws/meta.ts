import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Limit laws',
  summary:
    'Limits respect sums, products and quotients, so the limit of a polynomial or of a rational function with a nonzero denominator is its value. When substitution gives $\\frac{0}{0}$, factoring, rationalizing or combining fractions removes the cancelling factor; a nonzero number over $0$ means an infinite limit.',
  tags: [
    'limit laws',
    'direct substitution',
    'indeterminate form',
    'factoring',
    'rationalizing',
    'complex fraction',
  ],
  level: 'core',
  order: 3,
  skills: ['evaluating-limits'],
  steps: [
    {
      id: 'laws',
      title: 'Limits of combinations',
      caption:
        "As $x \\to 1$, $f(x) \\to 2$ and $g(x) \\to 3$. The sum approaches $2 + 3$, the product $2 \\cdot 3$, and the quotient $\\frac{2}{3}$, because the denominator's limit is not $0$. Pick a combination and drag $x$.",
      check: {
        kind: 'number',
        prompt:
          'If $\\lim_{x \\to a} f(x) = 4$ and $\\lim_{x \\to a} g(x) = -3$, what is $\\lim_{x \\to a} \\left(2f(x) - f(x)g(x)\\right)$?',
        answer: 20,
        explanation: 'Apply the laws term by term: $2 \\cdot 4 - 4 \\cdot (-3) = 8 + 12 = 20$.',
      },
    },
    {
      id: 'substitution',
      title: 'Direct substitution',
      caption:
        'A polynomial is built from $x$ and constants with sums and products, so the laws give $\\lim_{x \\to a} p(x) = p(a)$. Here $\\lim_{x \\to 2} (x^3 - 3x + 1) = 8 - 6 + 1 = 3$. The same holds for a rational function where its denominator is not $0$.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to -1} (2x^3 + x^2 - 4)$.',
        answer: -5,
        explanation: 'Substitute: $2(-1)^3 + (-1)^2 - 4 = -2 + 1 - 4 = -5$.',
      },
    },
    {
      id: 'factor',
      title: 'Factor and cancel',
      caption:
        'Substituting $x = 3$ into $\\frac{x^2 - 9}{x - 3}$ gives $\\frac{0}{0}$, which decides nothing. Factor: for $x \\neq 3$ it equals $x + 3$, and the limit is $6$. The graph is a line with a hole.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to 2} \\frac{x^2 + x - 6}{x - 2}$.',
        answer: 5,
        explanation:
          '$x^2 + x - 6 = (x - 2)(x + 3)$, so for $x \\neq 2$ the quotient is $x + 3$, which tends to $5$.',
      },
    },
    {
      id: 'rationalize',
      title: 'Rationalize',
      caption:
        'With a root, multiply by the conjugate: $\\frac{x - 4}{\\sqrt{x} - 2} \\cdot \\frac{\\sqrt{x} + 2}{\\sqrt{x} + 2} = \\frac{(x - 4)(\\sqrt{x} + 2)}{x - 4} = \\sqrt{x} + 2$ for $x \\neq 4$, which tends to $4$.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to 0} \\frac{\\sqrt{x + 1} - 1}{x}$ as a decimal.',
        answer: 0.5,
        explanation:
          'Multiply by $\\sqrt{x + 1} + 1$: the top becomes $(x + 1) - 1 = x$, which cancels, leaving $\\frac{1}{\\sqrt{x + 1} + 1} \\to \\frac{1}{2}$.',
      },
    },
    {
      id: 'combine',
      title: 'Combine fractions',
      caption:
        'A fraction of fractions: write $\\frac{1}{x} - \\frac{1}{2}$ over the common denominator $2x$ as $\\frac{2 - x}{2x}$. The factor $2 - x = -(x - 2)$ cancels, leaving $-\\frac{1}{2x} \\to -\\frac{1}{4}$.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to 5} \\frac{\\frac{1}{x} - \\frac{1}{5}}{x - 5}$ as a decimal.',
        answer: -0.04,
        explanation:
          '$\\frac{1}{x} - \\frac{1}{5} = \\frac{5 - x}{5x} = -\\frac{x - 5}{5x}$. Dividing by $x - 5$ leaves $-\\frac{1}{5x} \\to -\\frac{1}{25} = -0.04$.',
      },
    },
    {
      id: 'nonzero-over-zero',
      title: 'A nonzero number over zero',
      caption:
        'Substituting $x = 1$ into $\\frac{x + 1}{x - 1}$ gives $\\frac{2}{0}$. That is not indeterminate: the top stays near $2$ while the bottom shrinks, so the values blow up. The signs give $-\\infty$ from the left and $\\infty$ from the right.',
      check: {
        kind: 'choice',
        prompt:
          'Substituting $x = 3$ into $\\frac{x + 2}{(x - 3)^2}$ gives $\\frac{5}{0}$. What is $\\lim_{x \\to 3} \\frac{x + 2}{(x - 3)^2}$?',
        options: ['$\\infty$', '$-\\infty$', '$0$', 'It does not exist, not even as $\\pm\\infty$'],
        answer: 0,
        explanation:
          'The top is near $5$ and the bottom is a small positive square on both sides, so both one-sided limits are $\\infty$, and so is the limit.',
      },
    },
  ],
})
