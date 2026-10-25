import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Related rates',
  summary:
    'When quantities are linked by an equation at every moment, differentiating that equation in time links their rates of change. A sliding ladder, a filling cone, a rising balloon, a walking shadow and two cars, each solved the same way.',
  tags: ['related rates', 'chain rule', 'implicit differentiation', 'rate of change', 'derivative'],
  level: 'core',
  order: 12,
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
    {
      id: 'shadow',
      title: 'A walking shadow',
      caption:
        'A person $1.8$ meters tall walks away from a $5.4$ meter streetlight at $\\frac{dx}{dt} = 1.2$ meters per second. Similar triangles link the tip of the shadow $s$ to the person $x$ at every moment: $\\frac{s}{5.4} = \\frac{s - x}{1.8}$, so $s = 1.5x$. Differentiate in $t$: $\\frac{ds}{dt} = 1.5\\,\\frac{dx}{dt}$. The tip outruns the person, at the same speed wherever they are.',
      check: {
        kind: 'number',
        prompt:
          'How fast does the tip of the shadow move, in meters per second, when the person is $8$ meters from the light?',
        answer: 1.8,
        tolerance: 0.005,
        explanation:
          '$\\frac{ds}{dt} = 1.5 \\cdot 1.2 = 1.8$ meters per second, at $8$ meters or anywhere else: the relation $s = 1.5x$ has no other variable in it.',
      },
    },
    {
      id: 'cars',
      title: 'Two cars',
      caption:
        'Car A leaves a crossing heading east at $80$ km/h. At that moment car B is $7$ km north of the crossing, heading north at $60$ km/h. The distance between them satisfies $D^2 = x^2 + y^2$, with both legs changing. Differentiate in $t$: $2D\\,\\frac{dD}{dt} = 2x\\,\\frac{dx}{dt} + 2y\\,\\frac{dy}{dt}$.',
      check: {
        kind: 'number',
        prompt:
          'How fast is the distance between the cars growing, in km/h, after $9$ minutes, when $x = 12$ and $y = 16$?',
        answer: 96,
        tolerance: 0.05,
        explanation:
          '$D = 20$, so $\\frac{dD}{dt} = \\frac{12 \\cdot 80 + 16 \\cdot 60}{20} = \\frac{1920}{20} = 96$ km/h.',
      },
    },
  ],
})
