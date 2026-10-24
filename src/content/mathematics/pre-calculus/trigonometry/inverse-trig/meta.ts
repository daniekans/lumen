import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Inverse trigonometric functions',
  summary:
    'Sine takes each value infinitely often, so it has no inverse until its domain is cut to one increasing piece. That piece reflected across $y = x$ is $\\arcsin$, and $\\arccos$ and $\\arctan$ come the same way. They return one angle; the other solutions follow from symmetry and the period.',
  tags: ['arcsin', 'arccos', 'arctan', 'inverse', 'principal value', 'trigonometric equations'],
  level: 'intro',
  order: 4,
  skills: ['inverse-trig'],
  steps: [
    {
      id: 'many-angles',
      title: 'Many angles, one value',
      caption:
        'Which angle has $\\sin x = c$? The line $y = c$ crosses the sine wave over and over, twice in every period, so the question has infinitely many answers. Drag $c$.',
    },
    {
      id: 'arcsin',
      title: 'Restrict, then reflect',
      caption:
        'On $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$ sine increases from $-1$ to $1$ and takes each value once. Reflecting that piece across $y = x$ gives $\\arcsin : [-1, 1] \\to \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$.',
    },
    {
      id: 'arccos',
      title: 'Arccosine',
      caption:
        'Cosine needs a different piece: on $[0, \\pi]$ it decreases from $1$ to $-1$. Its reflection is $\\arccos : [-1, 1] \\to [0, \\pi]$.',
    },
    {
      id: 'arctan',
      title: 'Arctangent',
      caption:
        'Tangent increases on $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$ and takes every real value. So $\\arctan$ is defined for all $x$, and its graph approaches $y = \\pm\\frac{\\pi}{2}$ without reaching them.',
    },
    {
      id: 'all-solutions',
      title: 'Every solution',
      caption:
        '$\\arcsin c$ gives one solution of $\\sin x = c$. The circle gives a second, $\\pi - \\arcsin c$, with the same height, and adding whole turns gives the rest: $x = \\arcsin c + 2\\pi k$ or $x = \\pi - \\arcsin c + 2\\pi k$. Drag $c$.',
    },
    {
      id: 'trap',
      title: 'Not always the angle back',
      caption:
        '$\\arcsin(\\sin x) = x$ only for $x$ in $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$. Elsewhere it returns the angle in that range with the same sine: $\\arcsin\\left(\\sin\\frac{5\\pi}{6}\\right) = \\frac{\\pi}{6}$. Drag $x$.',
    },
  ],
})
