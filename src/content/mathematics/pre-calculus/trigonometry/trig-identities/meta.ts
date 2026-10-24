import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Trigonometric identities',
  summary:
    'Every identity is a fact about the unit circle: the Pythagorean identity is the circle itself, reflections give the rules for negative, supplementary and complementary angles, and rotating the circle gives the angle addition and double-angle formulas.',
  tags: ['identities', 'Pythagorean identity', 'even and odd', 'angle addition', 'double angle'],
  level: 'intro',
  order: 3,
  skills: ['trig-identities', 'unit-circle'],
  steps: [
    {
      id: 'pythagorean',
      title: 'The circle itself',
      caption:
        '$P = (\\cos\\theta, \\sin\\theta)$ is on $x^2 + y^2 = 1$, so $\\sin^2\\theta + \\cos^2\\theta = 1$. Given one value and the quadrant, it gives the other. Drag $P$.',
      check: {
        kind: 'number',
        prompt:
          'An angle $\\theta$ between $\\frac{\\pi}{2}$ and $\\pi$ has $\\sin\\theta = \\frac{3}{5}$. What is $\\cos\\theta$?',
        answer: -0.8,
        explanation:
          '$\\cos^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$, so $\\cos\\theta = \\pm\\frac{4}{5}$. The point is left of the $y$-axis, so $\\cos\\theta = -\\frac{4}{5}$.',
      },
    },
    {
      id: 'negative',
      title: 'Negative angles',
      caption:
        'The angle $-\\theta$ walks the same distance clockwise, landing on the reflection of $P$ across the $x$-axis: $\\cos(-\\theta) = \\cos\\theta$ and $\\sin(-\\theta) = -\\sin\\theta$. Cosine is even, sine is odd.',
      check: {
        kind: 'choice',
        prompt: 'Which is $\\sin\\left(-\\frac{\\pi}{6}\\right)$?',
        options: [
          '$-\\frac{1}{2}$',
          '$\\frac{1}{2}$',
          '$\\frac{\\sqrt{3}}{2}$',
          '$-\\frac{\\sqrt{3}}{2}$',
        ],
        answer: 0,
        explanation:
          'Sine is odd: $\\sin\\left(-\\frac{\\pi}{6}\\right) = -\\sin\\frac{\\pi}{6} = -\\frac{1}{2}$.',
      },
    },
    {
      id: 'supplement',
      title: 'Supplementary angles',
      caption:
        'The angle $\\pi - \\theta$ lands on the reflection of $P$ across the $y$-axis: same height, opposite horizontal coordinate. So $\\sin(\\pi - \\theta) = \\sin\\theta$ and $\\cos(\\pi - \\theta) = -\\cos\\theta$.',
      check: {
        kind: 'choice',
        prompt: 'Which is $\\cos\\frac{5\\pi}{6}$?',
        options: [
          '$\\frac{\\sqrt{3}}{2}$',
          '$-\\frac{\\sqrt{3}}{2}$',
          '$\\frac{1}{2}$',
          '$-\\frac{1}{2}$',
        ],
        answer: 1,
        explanation:
          '$\\frac{5\\pi}{6} = \\pi - \\frac{\\pi}{6}$, so $\\cos\\frac{5\\pi}{6} = -\\cos\\frac{\\pi}{6} = -\\frac{\\sqrt{3}}{2}$.',
      },
    },
    {
      id: 'complement',
      title: 'Complementary angles',
      caption:
        'The angle $\\frac{\\pi}{2} - \\theta$ lands on the reflection of $P$ across the line $y = x$, which swaps the coordinates: $\\cos\\left(\\frac{\\pi}{2} - \\theta\\right) = \\sin\\theta$ and $\\sin\\left(\\frac{\\pi}{2} - \\theta\\right) = \\cos\\theta$. That is the "co" in cosine.',
      check: {
        kind: 'number',
        prompt: 'If $\\sin\\theta = 0.6$, what is $\\cos\\left(\\frac{\\pi}{2} - \\theta\\right)$?',
        answer: 0.6,
        explanation:
          'The reflection across $y = x$ swaps the coordinates, so $\\cos\\left(\\frac{\\pi}{2} - \\theta\\right) = \\sin\\theta = 0.6$, whatever the quadrant.',
      },
    },
    {
      id: 'addition',
      title: 'Adding angles by rotating',
      caption:
        'Rotate the whole circle by $\\beta$. The axes turn into $\\mathbf{u} = (\\cos\\beta, \\sin\\beta)$ and $\\mathbf{v} = (-\\sin\\beta, \\cos\\beta)$, and the point at $\\alpha$ goes to the point at $\\alpha + \\beta$, which is $\\cos\\alpha\\,\\mathbf{u} + \\sin\\alpha\\,\\mathbf{v}$. Its coordinates are the addition formulas. Drag $\\alpha$ and $\\beta$.',
      check: {
        kind: 'number',
        prompt:
          'Use $\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$ with $\\alpha = \\frac{\\pi}{4}$ and $\\beta = \\frac{\\pi}{6}$ to find $\\sin\\frac{5\\pi}{12}$, to two decimal places.',
        answer: 0.97,
        tolerance: 0.006,
        explanation:
          '$\\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2} = \\frac{\\sqrt{6} + \\sqrt{2}}{4} \\approx 0.966$.',
      },
    },
    {
      id: 'double',
      title: 'Double angles',
      caption:
        'With $\\alpha = \\beta = \\theta$ the rotation doubles the angle: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$ and $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$. Drag $\\theta$.',
      check: {
        kind: 'number',
        prompt:
          'An angle $\\theta$ between $0$ and $\\frac{\\pi}{2}$ has $\\sin\\theta = \\frac{3}{5}$. What is $\\sin 2\\theta$?',
        answer: 0.96,
        explanation:
          '$\\cos\\theta = \\frac{4}{5}$ in the first quadrant, so $\\sin 2\\theta = 2 \\cdot \\frac{3}{5} \\cdot \\frac{4}{5} = \\frac{24}{25} = 0.96$.',
      },
    },
  ],
})
