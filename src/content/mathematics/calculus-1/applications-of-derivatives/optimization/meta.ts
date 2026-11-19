import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Optimization',
  summary:
    'Write the quantity to optimize as a function of one variable, using the constraint to remove the others, find the interval that variable can take, and compare the critical points with the ends. An open box, a can with the least metal, a lifeguard choosing a path, and the mean as the number with the least squared error.',
  tags: ['optimization', 'critical point', 'extrema', 'constraint', 'least squares', 'mean'],
  level: 'core',
  order: 6,
  codeCorner: 'bottom-right',
  skills: ['optimization'],
  steps: [
    {
      id: 'box-model',
      title: 'Model: an open box',
      caption:
        'Cut a square of side $x$ from each corner of a $12$ by $12$ sheet and fold up the sides. The box has base $12 - 2x$ and height $x$, so $V(x) = x(12 - 2x)^2$: one variable, and the volume rises, then falls.',
      check: {
        kind: 'number',
        prompt:
          'The cut $x$ can be any length from $0$ up to some largest value. What is that value, in centimeters?',
        answer: 6,
        tolerance: 0.001,
        explanation:
          'The base $12 - 2x$ cannot be negative, so $0 \\le x \\le 6$. At both ends the volume is $0$: no sides, or no base.',
      },
    },
    {
      id: 'box-optimize',
      title: 'Optimize: the critical point',
      caption:
        "$V'(x) = (12 - 2x)(12 - 6x)$ is $0$ at $x = 2$ and $x = 6$. On $[0, 6]$ compare $V(0) = 0$, $V(2) = 128$ and $V(6) = 0$: the largest box has a flat tangent at $x = 2$.",
      check: {
        kind: 'number',
        prompt: 'What is the largest volume, in cubic centimeters?',
        answer: 128,
        tolerance: 0.01,
        explanation: '$V(2) = 2 \\cdot 8^2 = 128$ cubic centimeters, larger than both ends.',
      },
    },
    {
      id: 'can',
      title: 'A can with the least metal',
      caption:
        'A can holds $330\\ \\text{cm}^3$: $\\pi r^2 h = 330$, so $h = \\frac{330}{\\pi r^2}$ and the metal is $A(r) = 2\\pi r^2 + \\frac{660}{r}$. $A$ grows without bound at both ends of $(0, \\infty)$, so its one critical point is the minimum, where $h = 2r$.',
      check: {
        kind: 'number',
        prompt: 'What radius uses the least metal, in centimeters, to two decimal places?',
        answer: 3.745,
        tolerance: 0.006,
        explanation:
          "$A'(r) = 4\\pi r - \\frac{660}{r^2} = 0$ gives $r^3 = \\frac{165}{\\pi}$, so $r = \\sqrt[3]{\\frac{165}{\\pi}} \\approx 3.74$ cm, and $h \\approx 7.49$ cm.",
      },
    },
    {
      id: 'lifeguard',
      title: "The lifeguard's path",
      caption:
        'A lifeguard runs at $6$ m/s on sand and swims at $2$ m/s. Entering the water at $x$ along the shore takes $T(x) = \\frac{\\sqrt{x^2 + 30^2}}{6} + \\frac{\\sqrt{(60 - x)^2 + 20^2}}{2}$ seconds. The fastest path bends at the shore, as light does.',
      check: {
        kind: 'choice',
        prompt: 'Where does the fastest path enter the water, compared with the straight line?',
        options: [
          'Where the straight line crosses the shore',
          'Farther along the shore, closer to the swimmer',
          'Closer to the lifeguard',
        ],
        answer: 1,
        explanation:
          "Running is three times faster, so the fastest path runs more and swims less: it enters at $x \\approx 53.9$ m instead of $36$ m, in $20.7$ seconds instead of $23.4$. There $T'(x) = 0$, which reads $\\frac{\\sin\\theta_1}{6} = \\frac{\\sin\\theta_2}{2}$.",
      },
    },
    {
      id: 'mean',
      title: 'The mean as least squares',
      caption:
        "Which single number $c$ best summarizes $2, 3, 7, 8, 10$? Measure the misfit by the total area of the squares, $S(c) = \\sum (y_i - c)^2$. $S'(c) = -2\\sum (y_i - c) = 0$ gives $c = \\bar{y} = 6$: the mean.",
      check: {
        kind: 'number',
        prompt: 'The $10$ is replaced by $20$. Which $c$ now minimizes $S(c)$?',
        answer: 8,
        tolerance: 0.001,
        explanation:
          "$S'(c) = 0$ still gives the mean: $\\frac{2 + 3 + 7 + 8 + 20}{5} = 8$. One large value moves it by $2$, because squares weigh large misfits heavily.",
      },
    },
  ],
})
