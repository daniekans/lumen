import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Outer joins',
  summary:
    'An outer join is an inner join plus the rows that found no partner, padded with NULLs. Left, right and full joins differ only in which side keeps its unmatched rows, and an anti join keeps nothing else.',
  tags: ['join', 'left join', 'right join', 'full outer join', 'anti join', 'NULL', 'SQL'],
  level: 'intro',
  order: 4,
  skills: ['outer-join'],
  steps: [
    {
      id: 'inner',
      title: 'What an inner join drops',
      caption:
        'The inner join keeps the $4$ lit cells. Caio has no lit cell in his row, and orders $105$ and $106$ have none in their columns, so all three are missing from the result.',
    },
    {
      id: 'left',
      title: 'Left join: keep every left row',
      caption:
        'LEFT JOIN adds one row for each customer without a match, with NULL in every order column. Caio comes back, and the result has $4 + 1 = 5$ rows.',
    },
    {
      id: 'right',
      title: 'Right join: keep every right row',
      caption:
        'RIGHT JOIN does the same for the orders: $105$ and $106$ get one row each, padded with NULL customer columns. $4 + 2 = 6$ rows.',
    },
    {
      id: 'full',
      title: 'Full join: keep both',
      caption:
        'FULL JOIN pads the unmatched rows of both sides: $4 + 1 + 2 = 7$ rows. Every customer and every order appears at least once.',
    },
    {
      id: 'anti',
      title: 'Anti join: only the unmatched',
      caption:
        'Filtering a left join with WHERE o.order_id IS NULL keeps only the padded rows: the customers with no orders. NOT EXISTS computes the same set.',
    },
  ],
})
