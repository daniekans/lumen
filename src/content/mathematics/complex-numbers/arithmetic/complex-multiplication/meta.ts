import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  title: 'Complex multiplication',
  summary:
    'Multiplying by a complex number w rotates by the angle of w and scales by its length. The same holds for every point of the plane at once.',
  tags: ['complex numbers', 'multiplication', 'rotation', 'modulus', 'argument', 'polar form'],
  level: 'intro',
  skills: ['multiplication'],
  order: 1,
  steps: [
    {
      id: 'numbers',
      title: 'Numbers as arrows',
      caption:
        'A complex number $a + bi$ is a point of the plane, or an arrow from $0$. Its length is $|z|$ and its angle from the positive real axis is $\\arg z$.',
    },
    {
      id: 'rotate',
      title: 'Rotate by arg w',
      caption: 'Multiplying $z$ by $w$ first turns the arrow $z$ through the angle $\\arg w$.',
    },
    {
      id: 'scale',
      title: 'Scale by $|w|$',
      caption:
        'Then it stretches the arrow by the factor $|w|$. The result is $zw$, with $|zw| = |z|\\,|w|$ and $\\arg(zw) = \\arg z + \\arg w$.',
    },
    {
      id: 'plane',
      title: 'The whole plane',
      caption:
        'Multiplication by $w$ moves every point the same way: the plane rotates by $\\arg w$ and scales by $|w|$. Squares stay squares, and $1$ lands on $w$.',
    },
  ],
})
