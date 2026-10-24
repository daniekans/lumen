import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Related rates',
  summary:
    'When quantities are linked by an equation at every moment, differentiating that equation in time links their rates of change. A sliding ladder, a filling cone and a rising balloon, each solved the same way.',
  tags: ['related rates', 'chain rule', 'implicit differentiation', 'rate of change', 'derivative'],
  level: 'core',
  order: 11,
  skills: ['related-rates'],
  steps: [
    {
      id: 'ladder',
      title: 'A sliding ladder',
      caption:
        'A ladder $5$ meters long leans on a wall, and its foot slides away at $\\frac{dx}{dt} = 0.5$ meters per second. At every moment $x^2 + y^2 = 25$. Differentiate in $t$: $2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt} = 0$, so $\\frac{dy}{dt} = -\\frac{x}{y}\\,\\frac{dx}{dt}$. The top falls faster and faster.',
      check: {
        kind: 'number',
        prompt:
          'How fast is the top moving, in meters per second, when the foot is $3$ meters from the wall? (Negative means falling.)',
        answer: -0.375,
        tolerance: 0.005,
        explanation:
          'At $x = 3$, $y = 4$, so $\\frac{dy}{dt} = -\\frac{3}{4} \\cdot 0.5 = -0.375$ meters per second.',
      },
    },
    {
      id: 'tank',
      title: 'Filling a cone',
      caption:
        'Water flows into a cone of radius $3$ and height $6$ at $\\frac{dV}{dt} = 2\\pi$ cubic meters per second. By similar triangles $r = \\frac{h}{2}$, so $V = \\frac{1}{3}\\pi r^2 h = \\frac{\\pi h^3}{12}$. Differentiate: $\\frac{dV}{dt} = \\frac{\\pi h^2}{4}\\,\\frac{dh}{dt}$, so $\\frac{dh}{dt} = \\frac{8}{h^2}$. The level rises more slowly as the surface widens.',
      check: {
        kind: 'number',
        prompt:
          'How fast does the level rise, in meters per second, when the water is $4$ meters deep?',
        answer: 0.5,
        tolerance: 0.005,
        explanation: '$\\frac{dh}{dt} = \\frac{8}{h^2} = \\frac{8}{16} = 0.5$ meters per second.',
      },
    },
    {
      id: 'balloon',
      title: 'An angle of elevation',
      caption:
        'A balloon rises at $\\frac{dh}{dt} = 1$ meter per second, $4$ meters from an observer. The angle satisfies $\\tan\\theta = \\frac{h}{4}$. Differentiate: $\\frac{1}{\\cos^2\\theta}\\,\\frac{d\\theta}{dt} = \\frac{1}{4}\\,\\frac{dh}{dt}$, so $\\frac{d\\theta}{dt} = \\frac{\\cos^2\\theta}{4}$ radians per second. The angle turns fastest at the start.',
      check: {
        kind: 'number',
        prompt: 'How fast does $\\theta$ change, in radians per second, when $h = 4$?',
        answer: 0.125,
        tolerance: 0.002,
        explanation:
          'At $h = 4$, $\\theta = \\frac{\\pi}{4}$ and $\\cos^2\\theta = \\frac{1}{2}$, so $\\frac{d\\theta}{dt} = \\frac{1}{8}$ radians per second.',
      },
    },
  ],
})
