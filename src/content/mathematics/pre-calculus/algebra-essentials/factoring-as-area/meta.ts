import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Factoring as area',
  summary:
    'A product of two binomials is the area of a rectangle. Factoring runs that picture backwards: arrange the tiles of a polynomial into a rectangle and read off its sides.',
  tags: ['factoring', 'trinomial', 'algebra tiles', 'common factor', 'difference of squares'],
  level: 'intro',
  order: 4,
  skills: ['factor'],
  steps: [
    {
      id: 'product',
      title: 'A product is an area',
      caption:
        'A rectangle with sides $x + p$ and $x + q$ splits into one $x^2$ square, $p + q$ strips of area $x$, and $pq$ unit squares: $(x + p)(x + q) = x^2 + (p + q)x + pq$.',
    },
    {
      id: 'factor',
      title: 'Factoring builds the rectangle',
      caption:
        'To factor $x^2 + bx + c$, arrange its tiles into a rectangle. The units must form a $p \\times q$ block with $pq = c$, and the strips must fill both sides, so $p + q = b$.',
    },
    {
      id: 'common',
      title: 'A common factor',
      caption:
        'When every term shares a factor, the tiles stack into equal rows. Here each row is $x^2 + 2x$, so $3x^2 + 6x = 3x(x + 2)$: the shared factor is one side.',
    },
    {
      id: 'difference',
      title: 'Difference of squares',
      caption:
        'Cut a $q \\times q$ square from the corner of an $x \\times x$ square. The leftover strip turns and moves on top, giving a rectangle: $x^2 - q^2 = (x + q)(x - q)$.',
    },
  ],
})
