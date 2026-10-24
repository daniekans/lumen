import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'The derivative as a limit',
  summary:
    "A secant line through two points of a curve turns into the tangent line as the points merge. Its slope, the limit of $\\frac{\\Delta y}{\\Delta x}$, is the derivative, written $f'(x)$ or $\\frac{dy}{dx}$. Zoomed in far enough, the curve and its tangent look the same.",
  tags: ['derivative', 'limit', 'secant', 'tangent', 'slope', 'rate of change', 'Leibniz notation'],
  level: 'core',
  skills: ['secant-slope', 'definition'],
  order: 1,
  steps: [
    {
      id: 'secant',
      title: 'Two points, one line',
      caption:
        'The secant through $P$ and $Q$ rises $\\Delta y$ over a run of $h$, the step $\\Delta x$ written with one letter. Its slope $\\frac{\\Delta y}{h}$ is the average rate of change of $f$ between $x_0$ and $x_0 + h$.',
    },
    {
      id: 'shrink',
      title: 'Shrink the gap',
      caption:
        'Make $h$ smaller. $Q$ slides toward $P$ and the secant pivots around $P$. Both $h$ and $\\Delta y$ go to $0$, but their ratio does not.',
    },
    {
      id: 'limit',
      title: 'Take the limit',
      caption:
        "As $h \\to 0$ the slope settles on one number, $f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}$. The line through $P$ with that slope is the tangent: $y = f(x_0) + f'(x_0)(x - x_0)$.",
      check: {
        kind: 'choice',
        prompt: 'As $h$ shrinks toward $0$, the secant slope approaches:',
        options: [
          '$f(x_0)$, the height of the curve at $P$',
          "$f'(x_0)$, the slope of the tangent at $P$",
          '$0$, because the run $h$ vanishes',
          'Nothing, because the quotient becomes $\\frac{0}{0}$',
        ],
        answer: 1,
        explanation:
          "The difference quotient is never evaluated at $h = 0$. Its limit as $h \\to 0$ is the definition of $f'(x_0)$.",
      },
    },
    {
      id: 'zoom',
      title: 'Zoom in on $P$',
      caption:
        'Magnify the picture around $P$. The curve bends less and less, and at a large zoom it cannot be told apart from its tangent. A curve with a derivative at $P$ is locally straight there, and the tangent is that straight line.',
    },
    {
      id: 'notation',
      title: "$f'(x)$ and $\\frac{dy}{dx}$",
      caption:
        "Repeat the limit at every $x$ and you get a new function, the derivative $f'$, dashed. With $y = f(x)$ it is also written $\\frac{dy}{dx}$, the limit of $\\frac{\\Delta y}{\\Delta x}$. Drag $P$ and watch its slope trace $f'$.",
      check: {
        kind: 'number',
        prompt: "For $f(x) = 0.1x^3 - 0.8x^2 + 1.6x + 1$, what is $f'(2)$?",
        answer: -0.4,
        tolerance: 0.005,
        explanation:
          "$f'(x) = 0.3x^2 - 1.6x + 1.6$, so $f'(2) = 1.2 - 3.2 + 1.6 = -0.4$. Drag $P$ to $x_0 = 2$ to see it in the readout.",
      },
    },
  ],
})
