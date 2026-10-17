import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Equations and inequalities',
  summary:
    'An equation asks where two graphs meet; an inequality asks where one is above the other. Squaring can add false solutions, sign charts track factors, and an absolute value is a distance.',
  tags: ['equation', 'inequality', 'extraneous solution', 'sign chart', 'absolute value'],
  level: 'intro',
  order: 7,
  skills: ['equations', 'inequalities', 'absolute-value'],
  steps: [
    {
      id: 'intersection',
      title: 'Solutions are intersections',
      caption:
        'The solutions of $x^2 = x + c$ are the $x$-coordinates where the parabola meets the line. Move $c$: two crossings, one touch at $c = -\\frac{1}{4}$, or none.',
    },
    {
      id: 'extraneous',
      title: 'Squaring can add a solution',
      caption:
        'Squaring $\\sqrt{x + 2} = x$ gives $x + 2 = x^2$, with solutions $-1$ and $2$. Squaring also solves $-\\sqrt{x + 2} = x$, so $x = -1$ appears although $\\sqrt{1} \\neq -1$. Check every candidate in the original equation.',
    },
    {
      id: 'inequality',
      title: 'Inequalities: which graph is higher',
      caption:
        '$x^2 < x + c$ holds where the parabola is below the line: between the crossings. Flip the sign and the solution is the outside, so the crossings split the line into intervals.',
    },
    {
      id: 'sign-chart',
      title: 'Sign charts',
      caption:
        'A product changes sign only at a zero of a factor. The zeros of $(x + 2)(x - 1)(x - 3)$ cut the line into four intervals; one test value in each gives the sign there. Drag $x$.',
    },
    {
      id: 'absolute',
      title: 'Absolute value is distance',
      caption:
        '$\\lvert x - a \\rvert$ is the distance from $x$ to $a$. So $\\lvert x - a \\rvert < r$ is the interval $(a - r, a + r)$ around $a$, and $\\lvert x - a \\rvert > r$ is everything outside it.',
    },
  ],
})
