import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Lines and planes',
  summary:
    'A line is a point plus the multiples of one direction, p + tv, and a plane is a point plus the combinations of two, p + sv + tw. A plane also has one equation: its normal n is perpendicular to every direction in it, so n · (x - p) = 0. Spans are the lines and planes through the origin.',
  tags: [
    'parametric line',
    'parametric plane',
    'normal vector',
    'equation of a plane',
    'span',
    '3D',
  ],
  level: 'core',
  order: 7,
  skills: ['lines-and-planes'],
  steps: [
    {
      id: 'line',
      title: 'A point and a direction',
      caption:
        'Start at $\\mathbf{p}$ and move along $\\mathbf{v}$: the points $\\mathbf{p} + t\\mathbf{v}$, one for each number $t$, fill a line. Move $t$.',
      check: {
        kind: 'number',
        prompt: 'The line $(2, -1, 0) + t(-1, 2, 1)$ passes through $(0, 3, 2)$. For which $t$?',
        answer: 2,
        explanation:
          'The first components need $2 - t = 0$, so $t = 2$, and then $-1 + 4 = 3$ and $0 + 2 = 2$ match as well.',
      },
    },
    {
      id: 'shifted-span',
      title: 'A shifted span',
      caption:
        'With $\\mathbf{p} = \\mathbf{0}$ the line is $t\\mathbf{v}$, the span of $\\mathbf{v}$. Any other line is that span moved by $\\mathbf{p}$, and any point of the line can serve as $\\mathbf{p}$.',
      check: {
        kind: 'choice',
        prompt: 'Which of these describes the same line as $(2, -1, 0) + t(-1, 2, 1)$?',
        options: [
          '$(0, 3, 2) + t(2, -4, -2)$',
          '$(0, 0, 0) + t(-1, 2, 1)$',
          '$(2, -1, 0) + t(2, -1, 0)$',
          '$(-1, 2, 1) + t(2, -1, 0)$',
        ],
        answer: 0,
        explanation:
          '$(0, 3, 2)$ is on the line (at $t = 2$), and $(2, -4, -2) = -2(-1, 2, 1)$ points along it. The second is the parallel line through the origin, which misses $(2, -1, 0)$.',
      },
    },
    {
      id: 'plane',
      title: 'A point and two directions',
      caption:
        'With two directions that are not parallel, $\\mathbf{p} + s\\mathbf{v} + t\\mathbf{w}$ fills a plane: the span of $\\mathbf{v}$ and $\\mathbf{w}$, moved by $\\mathbf{p}$. Move $s$ and $t$.',
      check: {
        kind: 'number',
        prompt:
          'Find the first component of the point with $s = 1$, $t = 2$ on $(2, 0, 2) + s(2, -1, 0) + t(0, 1, -1)$.',
        answer: 4,
        explanation: '$2 + 1 \\cdot 2 + 2 \\cdot 0 = 4$. The whole point is $(4, 1, 0)$.',
      },
    },
    {
      id: 'normal',
      title: 'The normal vector',
      caption:
        'The normal $\\mathbf{n} = (1, 2, 2)$ is orthogonal to $\\mathbf{v}$ and $\\mathbf{w}$, so to every arrow $\\mathbf{x} - \\mathbf{p}$ inside the plane: $\\mathbf{n} \\cdot (\\mathbf{x} - \\mathbf{p}) = 0$. Drag $\\mathbf{x}$ on the plane.',
      check: {
        kind: 'choice',
        prompt: 'Which vector is normal to the plane spanned by $(2, -1, 0)$ and $(0, 1, -1)$?',
        options: ['$(1, 2, 2)$', '$(2, -1, 0)$', '$(1, -2, 2)$', '$(0, 1, 1)$'],
        answer: 0,
        explanation:
          '$(1, 2, 2) \\cdot (2, -1, 0) = 2 - 2 = 0$ and $(1, 2, 2) \\cdot (0, 1, -1) = 2 - 2 = 0$. Each of the others has a nonzero dot product with one of the two.',
      },
    },
    {
      id: 'equation',
      title: 'One equation',
      caption:
        'Expanding $\\mathbf{n} \\cdot (\\mathbf{x} - \\mathbf{p}) = 0$ gives $x + 2y + 2z = 6$, with $6 = \\mathbf{n} \\cdot \\mathbf{p}$. A point is on the plane exactly when its coordinates satisfy it.',
      check: {
        kind: 'number',
        prompt:
          'The plane through $(1, 1, 1)$ with normal $(1, 2, 2)$ is $x + 2y + 2z = d$. Find $d$.',
        answer: 5,
        explanation: '$d = \\mathbf{n} \\cdot \\mathbf{p} = 1 + 2 + 2 = 5$.',
      },
    },
    {
      id: 'through-origin',
      title: 'Planes through the origin',
      caption:
        'Changing $d$ in $x + 2y + 2z = d$ slides the plane along $\\mathbf{n}$. At $d = 0$ it passes through the origin and is the span of $\\mathbf{v}$ and $\\mathbf{w}$. Move $d$.',
      check: {
        kind: 'choice',
        prompt: 'Which plane is the span of two vectors?',
        options: ['$x + 2y + 2z = 6$', '$x - y + 3z = 0$', '$z = 1$', '$x + y = 2$'],
        answer: 1,
        explanation:
          'A span contains $\\mathbf{0}$, and $(0, 0, 0)$ satisfies only $x - y + 3z = 0$. The other three are spans moved away from the origin.',
      },
    },
  ],
})
