import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Complex arithmetic',
  description: 'Adding and multiplying complex numbers as operations on arrows.',
  order: 1,
  skills: [{ id: 'multiplication', title: 'Multiplication as rotation and scaling' }],
  terms: [
    {
      id: 'complex-number',
      title: 'Complex number',
      tex: 'a + bi',
      summary:
        'A number $a + bi$ with real numbers $a$, $b$ and $i^2 = -1$, drawn as the point or arrow $(a, b)$ in the plane.',
      introducedIn: 'complex-multiplication',
    },
    {
      id: 'modulus-argument',
      title: 'Modulus and argument',
      tex: '|z|,\\ \\arg z',
      summary:
        'The length of the arrow of $z$ and its angle from the positive real axis. Multiplying numbers multiplies their moduli and adds their arguments.',
      introducedIn: 'complex-multiplication',
    },
    {
      id: 'polar-form',
      title: 'Polar form',
      tex: 'r(\\cos\\theta + i\\sin\\theta)',
      summary:
        'A complex number written by its modulus $r = |z|$ and argument $\\theta = \\arg z$.',
      introducedIn: 'complex-multiplication',
    },
  ],
})
