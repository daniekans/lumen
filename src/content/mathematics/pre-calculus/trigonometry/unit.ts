import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Trigonometry',
  description:
    'Radians, the unit circle, graphs of sine and cosine, identities and inverse functions.',
  order: 5,
  skills: [
    { id: 'radians', title: 'Measure angles in radians and find arc lengths' },
    {
      id: 'unit-circle',
      title: 'Read sine, cosine and tangent on the unit circle, exact values included',
    },
    { id: 'trig-graphs', title: 'Read amplitude, period, shift and midline of a sinusoid' },
    {
      id: 'trig-identities',
      title: 'Use the Pythagorean, symmetry, addition and double-angle identities',
    },
    {
      id: 'inverse-trig',
      title: 'Evaluate inverse trigonometric functions and solve trigonometric equations',
    },
  ],
  terms: [
    {
      id: 'radian',
      title: 'Radian',
      summary:
        'The angle whose arc on a circle is as long as the radius. An angle of $\\theta$ radians cuts an arc of $s = r\\theta$, a full turn is $2\\pi$, and $180^\\circ = \\pi$.',
      introducedIn: 'radians-and-the-unit-circle',
    },
    {
      id: 'unit-circle',
      title: 'Unit circle',
      tex: 'x^2 + y^2 = 1',
      summary:
        'The circle of radius $1$ centered at the origin. Walking a distance $\\theta$ along it, counterclockwise from $(1, 0)$, ends at the point $(\\cos\\theta, \\sin\\theta)$.',
      introducedIn: 'radians-and-the-unit-circle',
    },
    {
      id: 'sine-and-cosine',
      title: 'Sine and cosine',
      tex: '(\\cos\\theta, \\sin\\theta)',
      summary:
        'The coordinates of the point at angle $\\theta$ on the unit circle: cosine is the horizontal one, sine the vertical one. In a right triangle they are the adjacent and opposite sides over the hypotenuse.',
      introducedIn: 'radians-and-the-unit-circle',
    },
    {
      id: 'pythagorean-identity',
      title: 'Pythagorean identity',
      tex: '\\sin^2\\theta + \\cos^2\\theta = 1',
      summary:
        'The point $(\\cos\\theta, \\sin\\theta)$ is on the unit circle, so its coordinates satisfy $x^2 + y^2 = 1$ for every angle.',
      introducedIn: 'radians-and-the-unit-circle',
    },
    {
      id: 'period',
      title: 'Period',
      summary:
        'The smallest $p > 0$ with $f(x + p) = f(x)$ for every $x$. Sine and cosine have period $2\\pi$, tangent $\\pi$, and $\\sin(Bx)$ has period $\\frac{2\\pi}{\\lvert B \\rvert}$.',
      introducedIn: 'sine-and-cosine-graphs',
    },
    {
      id: 'amplitude',
      title: 'Amplitude',
      summary:
        'Half the distance between the maximum and the minimum of a sinusoid: $\\lvert A \\rvert$ for $A \\sin(B(x - C)) + D$, which oscillates around the midline $y = D$.',
      introducedIn: 'sine-and-cosine-graphs',
    },
    {
      id: 'tangent-function',
      title: 'Tangent (function)',
      tex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
      summary:
        'The slope of the line from the origin to the point at angle $\\theta$. It is undefined where $\\cos\\theta = 0$ and has period $\\pi$.',
      introducedIn: 'sine-and-cosine-graphs',
    },
    {
      id: 'angle-addition',
      title: 'Angle addition formulas',
      tex: '\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta',
      summary:
        'Sine and cosine of a sum from those of the parts; also $\\cos(\\alpha + \\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$. They come from rotating the unit circle by $\\beta$.',
      introducedIn: 'trig-identities',
    },
    {
      id: 'double-angle',
      title: 'Double-angle formulas',
      tex: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta',
      summary:
        'The addition formulas with $\\alpha = \\beta = \\theta$; also $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1$.',
      introducedIn: 'trig-identities',
    },
    {
      id: 'inverse-trig-functions',
      title: 'Inverse trigonometric functions',
      tex: '\\arcsin, \\arccos, \\arctan',
      summary:
        'Inverses of sine, cosine and tangent restricted to $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$, $[0, \\pi]$ and $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$. They return one angle, the principal value, out of infinitely many.',
      introducedIn: 'inverse-trig',
    },
  ],
})
