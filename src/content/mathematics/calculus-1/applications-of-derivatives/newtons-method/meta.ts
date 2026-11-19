import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: "Newton's method",
  summary:
    "To solve $f(x) = 0$, replace $f$ by its tangent line and solve that instead: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Near a simple root the number of correct digits roughly doubles each step. It is how calculators take square roots, it can cycle or diverge from a bad start, and applied to $f'$ it finds a minimum.",
  tags: [
    "Newton's method",
    'root finding',
    'tangent',
    'square root',
    'convergence',
    'optimization',
  ],
  level: 'core',
  order: 9,
  codeCorner: 'bottom-right',
  skills: ['newtons-method'],
  steps: [
    {
      id: 'tangent-step',
      title: 'Follow the tangent',
      caption:
        "To solve $x^2 - 2 = 0$, start at a guess $x_0$ and follow the tangent at $(x_0, f(x_0))$ down to the axis. It lands at $x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)}$. Drag $x_0$; at $x_0 = 0$ the tangent is flat and never reaches the axis.",
    },
    {
      id: 'iterate',
      title: 'Repeat',
      caption:
        'From $x_1$, do the same again: up to the curve, along the tangent, down to the axis. After three steps the guess is $\\sqrt{2}$ to three decimal places.',
    },
    {
      id: 'digits',
      title: 'Digits double',
      caption:
        'Each bar is the number of correct decimals of $x_n$. Near the root the error is squared at every step, roughly, so the count doubles: about 2, 4, 8, 16. Drag $x_0$: a worse start costs a few steps, not the doubling.',
    },
    {
      id: 'babylonian',
      title: 'Square roots, the Babylonian way',
      caption:
        'For $f(x) = x^2 - a$, the step simplifies to $x_{n+1} = \\frac{1}{2}\\left(x_n + \\frac{a}{x_n}\\right)$: the average of the two sides of a rectangle with area $a$. The rectangles turn into a square of side $\\sqrt{a}$. Change $a$.',
    },
    {
      id: 'cycle',
      title: 'A cycle',
      caption:
        'For $x^3 - 2x + 2$, starting at $x_0 = 0$ the tangent leads to $1$, and the tangent at $1$ leads back to $0$, forever. The root near $-1.77$ is never reached. Drag $x_0$ to see which starts escape.',
    },
    {
      id: 'diverge',
      title: 'Overshooting',
      caption:
        'For $\\sqrt[3]{x}$, every step gives $x_{n+1} = -2x_n$: the guesses jump across the root at $0$ and double their distance each time. Each tangent has a third of the slope of the line to the root, so it lands twice as far away on the other side.',
    },
    {
      id: 'minimum',
      title: 'Newton on the derivative',
      caption:
        "To minimize $g$, solve $g'(x) = 0$ with Newton: $x_{n+1} = x_n - \\frac{g'(x_n)}{g''(x_n)}$. Each step fits the parabola with the same value, slope and curvature at $x_n$, and jumps to its lowest point.",
    },
  ],
})
