import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Counting join rows',
  summary:
    'The rows of an equijoin come in blocks, one per key value: a value that appears a times on the left and b times on the right gives an a by b rectangle. Adding the areas predicts the row count of inner and outer joins.',
  tags: ['join', 'row count', 'cardinality', 'one to many', 'many to many', 'fan-out', 'NULL'],
  level: 'core',
  order: 5,
  skills: ['row-counts', 'inner-join', 'outer-join'],
  steps: [
    {
      id: 'per-key',
      title: 'Group by key value',
      caption:
        'Sort both key columns by value. Value $k$ appears $a_k$ times in $A$ (along the bottom) and $b_k$ times in $B$ (up the side).',
    },
    {
      id: 'area',
      title: 'Each value is a rectangle',
      caption:
        'Every row of $A$ with value $k$ pairs with every row of $B$ with value $k$: an $a_k \\times b_k$ block of rows. The join size is the total area.',
      check: {
        kind: 'number',
        prompt: 'How many rows does $A \\bowtie B$ return?',
        answer: 10,
        explanation:
          '$2 \\cdot 1 + 1 \\cdot 2 + 3 \\cdot 2 + 0 \\cdot 1 + 1 \\cdot 0 = 10$. Values that occur on one side only contribute $0$.',
      },
    },
    {
      id: 'one-to-many',
      title: 'A unique key on one side',
      caption:
        'When $A.k$ is unique, every $a_k$ is $0$ or $1$ and each block is one column wide. Each row of $B$ then matches at most once.',
      check: {
        kind: 'number',
        prompt:
          '$A.k$ is unique and $B$ has $7$ rows. What is the largest row count $A \\bowtie B$ can have?',
        answer: 7,
        explanation:
          'Each row of $B$ sits in at most one block, so there are at most $|B| = 7$ rows. Here there are $6$, because $B$ has a value $5$ that $A$ lacks.',
      },
    },
    {
      id: 'many-to-many',
      title: 'Duplicates on both sides',
      caption:
        'When the key repeats on both sides, blocks grow in two directions. Here two tables of $5$ and $7$ rows join into more rows than both together.',
      check: {
        kind: 'number',
        prompt: 'How many rows does this join return?',
        answer: 18,
        explanation:
          '$3 \\cdot 4 + 2 \\cdot 3 = 18$, more than $5 + 7 = 12$. Joining on a column that is not a key on either side is a common cause of duplicated totals.',
      },
    },
    {
      id: 'left',
      title: 'Left join: a floor of one',
      caption:
        'A left join keeps rows of $A$ whose value has no partner, so a value with $b_k = 0$ still gives $a_k$ padded rows, as if $b_k$ were $1$.',
      check: {
        kind: 'number',
        prompt: 'How many rows does $A$ LEFT JOIN $B$ return?',
        answer: 12,
        explanation:
          'The $10$ matched rows, plus one padded row for the $5$ and one for the NULL in $A$: $\\sum_k a_k \\max(b_k, 1) = 12$.',
      },
    },
    {
      id: 'nulls',
      title: 'NULL is not a value to match',
      caption:
        'Both tables hold a NULL, but NULL = NULL is unknown, so the two never pair up. The NULL in $A$ shows up only as a padded row of the left join.',
      check: {
        kind: 'choice',
        prompt: 'How many rows does the NULL of $A$ contribute to the inner join $A \\bowtie B$?',
        options: ['$0$', '$1$', 'One per NULL in $B$', 'One per row of $B$'],
        answer: 0,
        explanation:
          'An inner join keeps pairs whose condition is true. Comparing NULL with anything, NULL included, is unknown, so the row matches nothing.',
      },
    },
  ],
})
