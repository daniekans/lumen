import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Growth rates',
  summary:
    'At infinity, logarithms grow slower than any power, powers slower than any exponential, and exponentials slower than the factorial. A logarithmic scale makes the ranking visible. The dominant term decides a limit at infinity, and big-O notation keeps only that term.',
  tags: ['growth rate', 'logarithmic scale', 'dominant term', 'factorial', 'big-O'],
  level: 'core',
  order: 8,
  skills: ['growth-rates'],
  steps: [
    {
      id: 'log-scale',
      title: 'A logarithmic scale',
      caption:
        'The height here is $\\log_{10} y$, so each grid line up multiplies by $10$. On this scale $2^x$ and $10^x$ are straight lines: adding $1$ to $x$ always multiplies the value by the same factor.',
      check: {
        kind: 'number',
        prompt: 'How many times larger is $2^{x + 10}$ than $2^x$, for any $x$?',
        answer: 1024,
        explanation: '$2^{x + 10} = 2^x \\cdot 2^{10} = 1024 \\cdot 2^x$.',
      },
    },
    {
      id: 'powers',
      title: 'Powers fall behind',
      caption:
        'A power $x^p$ bends over on this scale, since multiplying $x$ by $10$ only multiplies $x^p$ by $10^p$. The straight line of $2^x$ always passes it. Raise $p$: the crossing moves out, but it never goes away.',
      check: {
        kind: 'choice',
        prompt: 'Which is larger, $2^{100}$ or $100^{10}$?',
        options: ['$2^{100}$', '$100^{10}$', 'They are equal'],
        answer: 0,
        explanation:
          '$100^{10} = 10^{20}$, while $2^{100} = (2^{10})^{10} = 1024^{10} > 1000^{10} = 10^{30}$. Past $x \\approx 58.8$, $2^x$ stays above $x^{10}$.',
      },
    },
    {
      id: 'logarithm',
      title: 'Logarithms fall further behind',
      caption:
        '$\\ln x$ is almost flat here. It grows slower than any power with $p > 0$: even $x^{0.1}$ overtakes it for good, though only past $x \\approx 3.4 \\cdot 10^{15}$. Drag $x$ to compare the values.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to \\infty} \\frac{\\ln x}{\\sqrt{x}}$.',
        answer: 0,
        explanation:
          'A logarithm grows slower than any positive power, here $x^{1/2}$, so the quotient tends to $0$.',
      },
    },
    {
      id: 'factorial',
      title: 'The factorial beats every exponential',
      caption:
        '$x!$ bends upward on this scale. Each step multiplies $n!$ by $n + 1$, a factor that keeps growing, while $10^x$ always multiplies by $10$. From $n = 25$ on, $n! > 10^n$.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{n \\to \\infty} \\frac{100^n}{n!}$.',
        answer: 0,
        explanation:
          'Once $n > 100$, each step multiplies the quotient by $\\frac{100}{n + 1} < 1$, and these factors keep shrinking, so the quotient tends to $0$.',
      },
    },
    {
      id: 'dominant-terms',
      title: 'Dominant terms',
      caption:
        'In $\\frac{3 \\cdot 2^x + x^4}{2^x + x^2}$ the powers lead for a while, and the ratio climbs to about $16$. Far out the exponentials dominate on top and bottom, and the limit is their ratio, $3$.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lim_{x \\to \\infty} \\frac{5 \\cdot 3^x + x^{4}}{3^x + 2^x}$.',
        answer: 5,
        explanation:
          'Divide the top and the bottom by $3^x$: $\\frac{5 + x^4 / 3^x}{1 + (2/3)^x} \\to \\frac{5 + 0}{1 + 0} = 5$.',
      },
    },
    {
      id: 'big-o',
      title: 'Big-O',
      caption:
        '$f(x) = 3x^2 + 5x + 2$ is $O(x^2)$: for some constant $C$, $f(x) \\le C x^2$ from some $x_0$ on. The graph is $\\frac{f(x)}{x^2}$, which tends to $3$, so any $C > 3$ works. Move $C$.',
      check: {
        kind: 'choice',
        prompt: 'Which statement is true as $x \\to \\infty$?',
        options: ['$2^{x + 1} = O(2^x)$', '$2^{2x} = O(2^x)$', '$x^3 = O(x^2)$', '$\\ln x = O(1)$'],
        answer: 0,
        explanation:
          '$2^{x + 1} = 2 \\cdot 2^x$, so $C = 2$ works. The others grow faster than their bound: $\\frac{2^{2x}}{2^x} = 2^x$, $\\frac{x^3}{x^2} = x$ and $\\ln x$ are all unbounded.',
      },
    },
  ],
})
