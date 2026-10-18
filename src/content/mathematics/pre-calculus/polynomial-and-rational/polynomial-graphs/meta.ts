import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Polynomial graphs',
  summary:
    'A polynomial in factored form shows its zeros. The multiplicity of a zero decides whether the graph crosses or touches, the leading term decides the ends, and the degree caps the turning points.',
  tags: ['polynomial', 'zeros', 'multiplicity', 'end behavior', 'turning point'],
  level: 'intro',
  order: 2,
  skills: ['zeros', 'end-behavior'],
  steps: [
    {
      id: 'zeros',
      title: 'Zeros from factors',
      caption:
        'A product is zero when one of its factors is, so $a(x - r_1)(x - r_2)(x - r_3)$ is zero exactly at $r_1$, $r_2$ and $r_3$. Drag the zeros along the axis.',
    },
    {
      id: 'multiplicity',
      title: 'Multiplicity: cross or touch',
      caption:
        'A factor repeated $m$ times is a zero of multiplicity $m$. Near it the graph looks like $(x - r)^m$: it crosses when $m$ is odd and touches and turns back when $m$ is even, flatter as $m$ grows.',
    },
    {
      id: 'end-behavior',
      title: 'The leading term decides the ends',
      caption:
        'For large $\\lvert x \\rvert$ the leading term $ax^n$ outgrows every other term, so the ends of the graph follow it. Zoom out: the two curves merge. Even $n$ sends both ends the same way, odd $n$ opposite ways.',
    },
    {
      id: 'turning-points',
      title: 'At most $n - 1$ turning points',
      caption:
        'A polynomial of degree $n$ has at most $n$ zeros and at most $n - 1$ turning points. Between two neighboring zeros the graph must turn at least once.',
    },
  ],
})
