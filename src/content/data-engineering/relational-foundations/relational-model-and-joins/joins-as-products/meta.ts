import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Joins as filtered products',
  summary:
    'A cross join pairs every row of one table with every row of the other. An inner join keeps the pairs that satisfy its condition, so its rows are the lit cells of a grid.',
  tags: ['join', 'inner join', 'cross join', 'Cartesian product', 'NULL', 'theta join', 'SQL'],
  level: 'intro',
  order: 3,
  skills: ['inner-join'],
  steps: [
    {
      id: 'product',
      title: 'Every pair of rows',
      caption:
        'CROSS JOIN pairs each of the $4$ customers with each of the $6$ orders. Each cell of the grid is one pair, so the result has $4 \\cdot 6 = 24$ rows.',
    },
    {
      id: 'condition',
      title: 'Test each pair',
      caption:
        'An inner join evaluates its ON condition on every pair. Here the condition is customers.id = orders.customer_id, and $4$ of the $24$ pairs satisfy it.',
    },
    {
      id: 'result',
      title: 'The pairs that pass are the rows',
      caption:
        'Each lit cell becomes one row of the result, with the columns of both tables side by side. The inner join is a filtered product.',
    },
    {
      id: 'fan-out',
      title: 'A row can appear more than once',
      caption:
        'Ana has two lit cells, so she appears in two rows. Caio has none and disappears. A customer contributes one row per matching order.',
    },
    {
      id: 'null-keys',
      title: 'Orders that match nothing',
      caption:
        'Order $105$ names customer $9$, who does not exist, and order $106$ has a NULL customer. NULL = $1$ is unknown, not true, so neither column lights up.',
    },
    {
      id: 'theta',
      title: 'Any condition works',
      caption:
        'The condition can be any test on a pair, not only equality. Switch it and watch which cells pass. Comparisons with NULL never pass.',
    },
  ],
})
