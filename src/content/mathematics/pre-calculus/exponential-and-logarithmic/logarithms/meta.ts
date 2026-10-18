import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Logarithms',
  summary:
    'A logarithm is the power a base must be raised to in order to give a number: the inverse of an exponential. Its laws are the exponent laws read backward, every logarithm is a scaled natural logarithm, and logarithms solve equations for an exponent.',
  tags: ['logarithm', 'natural logarithm', 'logarithm laws', 'change of base', 'equations'],
  level: 'intro',
  order: 3,
  skills: ['logarithms', 'exp-log-equations'],
  steps: [
    {
      id: 'inverse',
      title: 'The inverse of an exponential',
      caption:
        'Reflecting $y = b^x$ across $y = x$ swaps inputs and outputs. The result is $y = \\log_b x$: defined for $x > 0$, through $(1, 0)$, and approaching the $y$-axis without reaching it.',
      check: {
        kind: 'number',
        prompt: 'The point $(3, 8)$ is on $y = 2^x$. Which number is $\\log_2 8$?',
        answer: 3,
        explanation:
          'Reflection swaps the coordinates: $(8, 3)$ is on $y = \\log_2 x$, since $2^3 = 8$.',
      },
    },
    {
      id: 'what-power',
      title: 'What power gives $x$?',
      caption:
        '$\\log_b x = y$ means $b^y = x$. Drag $P$ along the curve: $\\log_b b = 1$, $\\log_b 1 = 0$, and inputs between $0$ and $1$ have negative logarithms.',
      check: {
        kind: 'number',
        prompt: 'What is $\\log_9 3$?',
        answer: 0.5,
        explanation: '$9^{1/2} = \\sqrt{9} = 3$, so $\\log_9 3 = \\frac{1}{2}$.',
      },
    },
    {
      id: 'product-rule',
      title: 'Products become sums',
      caption:
        'Since $b^m \\cdot b^n = b^{m + n}$, the logarithm of a product is the sum of the logarithms: the two heights stack to the height at $uv$. Drag $u$ and $v$.',
      check: {
        kind: 'choice',
        prompt: 'Which is equal to $\\log_2 5 + \\log_2 3$?',
        options: ['$\\log_2 15$', '$\\log_2 8$', '$\\log_2 5 \\cdot \\log_2 3$', '$\\log_4 15$'],
        answer: 0,
        explanation:
          'Logarithms turn products into sums: $\\log_2 5 + \\log_2 3 = \\log_2 (5 \\cdot 3)$. $\\log_2 8 = 3$, while the sum is about $3.91$.',
      },
    },
    {
      id: 'change-of-base',
      title: 'Every logarithm is a scaled $\\ln$',
      caption:
        'The natural logarithm $\\ln x = \\log_e x$ is dashed. Every other base is the same curve stretched vertically: $\\log_b x = \\frac{\\ln x}{\\ln b}$. Move $b$.',
      check: {
        kind: 'number',
        prompt:
          'With $\\ln 10 \\approx 2.303$ and $\\ln 2 \\approx 0.693$, what is $\\log_2 10$ to two decimal places?',
        answer: 3.32,
        tolerance: 0.006,
        explanation:
          '$\\log_2 10 = \\frac{\\ln 10}{\\ln 2} \\approx \\frac{2.303}{0.693} \\approx 3.32$. Check: $2^{3.32}$ is about $10$.',
      },
    },
    {
      id: 'solving',
      title: 'Solving for an exponent',
      caption:
        'The equation $b^x = c$ asks where the curve reaches height $c$. The answer is $x = \\log_b c$, which exists only for $c > 0$. Move $c$.',
      check: {
        kind: 'number',
        prompt: 'Solve $3 \\cdot 2^x = 48$.',
        answer: 4,
        explanation: 'Divide by $3$: $2^x = 16$, so $x = \\log_2 16 = 4$.',
      },
    },
  ],
})
