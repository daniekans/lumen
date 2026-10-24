import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Radians and the unit circle',
  summary:
    'An angle is the distance walked along the unit circle, measured in radians, and cosine and sine are the coordinates of the point where the walk ends. The rest follows from the circle: arc length, the Pythagorean identity, exact values and signs.',
  tags: ['radian', 'unit circle', 'sine', 'cosine', 'arc length', 'exact values'],
  level: 'intro',
  order: 1,
  skills: ['radians', 'unit-circle'],
  steps: [
    {
      id: 'arc',
      title: 'An angle is a distance',
      caption:
        'Walk along the circle of radius $1$, counterclockwise from $(1, 0)$. The length of the walk, the yellow arc, measures the angle $\\theta$. Drag $P$.',
    },
    {
      id: 'radian',
      title: 'One radian',
      caption:
        'At $\\theta = 1$ the arc is as long as the radius: one radian, about $57.3^\\circ$. Half a turn is half the circumference, $\\pi \\approx 3.14$, so $180^\\circ = \\pi$ and a full turn is $2\\pi$.',
    },
    {
      id: 'arc-length',
      title: 'Arc length',
      caption:
        'On a circle of radius $r$ the same angle cuts an arc $r$ times as long: $s = r\\theta$. This only holds with $\\theta$ in radians. Drag $r$.',
    },
    {
      id: 'coordinates',
      title: 'Cosine and sine',
      caption:
        'The point where the walk ends is $P = (\\cos\\theta, \\sin\\theta)$: cosine is its horizontal coordinate, sine its vertical one. For acute angles they are the adjacent and opposite sides of a right triangle with hypotenuse $1$.',
    },
    {
      id: 'pythagoras',
      title: 'Always on the circle',
      caption:
        'The legs $\\cos\\theta$ and $\\sin\\theta$ and the hypotenuse $1$ form a right triangle, and $P$ lies on $x^2 + y^2 = 1$, so $\\sin^2\\theta + \\cos^2\\theta = 1$ for every $\\theta$.',
    },
    {
      id: 'special',
      title: 'Exact values',
      caption:
        'At $\\frac{\\pi}{4}$ the triangle is half a square, so both legs are $\\frac{\\sqrt{2}}{2}$. At $\\frac{\\pi}{6}$ and $\\frac{\\pi}{3}$ it is half an equilateral triangle, with legs $\\frac{1}{2}$ and $\\frac{\\sqrt{3}}{2}$. $P$ snaps to these angles.',
    },
    {
      id: 'quadrants',
      title: 'Signs and reflections',
      caption:
        'Past $\\frac{\\pi}{2}$ the coordinates change sign: cosine is negative on the left, sine below the axis. The points at $\\pi - \\theta$, $\\pi + \\theta$ and $2\\pi - \\theta$ are reflections of $P$, so they share its values up to sign.',
    },
    {
      id: 'beyond',
      title: 'Negative angles and more turns',
      caption:
        'A negative angle walks clockwise. Walking a full turn more, $\\theta + 2\\pi$, ends at the same point, so sine and cosine repeat every $2\\pi$. Drag $\\theta$.',
    },
  ],
})
