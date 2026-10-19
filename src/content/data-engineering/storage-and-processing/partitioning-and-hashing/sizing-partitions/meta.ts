import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'How fine to partition',
  summary:
    'Partitions should be fine enough to prune and coarse enough to fill files. The number of partitions is a product of distinct counts, and the table size divided by it says whether the files stay near their target size.',
  tags: ['partition', 'small files', 'file size', 'cardinality', 'partition pruning', 'clustering'],
  level: 'core',
  order: 2,
  skills: ['partition-design', 'partitioning'],
  steps: [
    {
      id: 'area',
      title: 'A year of events',
      caption:
        'An events table gains $2$ GB a day: $365 \\cdot 2 = 730$ GB a year. Draw it as a rectangle with the days across. Writers aim for files of about $T = 1$ GB, shown on the size line below.',
      check: {
        kind: 'number',
        prompt: 'With files of at most $1$ GB, how many files does the table need at least?',
        answer: 730,
        explanation: '$\\lceil 730 / 1 \\rceil = 730$ files of $1$ GB.',
      },
    },
    {
      id: 'by-day',
      title: 'By day',
      caption:
        'Partition by day: $365$ partitions of $2$ GB. A query for one day prunes the other $364$ and reads $2$ GB, $\\frac{1}{365}$ of the table.',
      check: {
        kind: 'number',
        prompt:
          'Each partition is written as files of at most $1$ GB. How many files does the table have?',
        answer: 730,
        explanation:
          'Each $2$ GB partition fills $2$ files: $365 \\cdot 2 = 730$, as many as without partitions. Partitions that are whole multiples of $T$ cost no extra files.',
      },
    },
    {
      id: 'by-month',
      title: 'Coarser: by month',
      caption:
        'Partition by month instead: $12$ partitions of $56$ to $62$ GB. The same one-day query can only prune to its month, so it reads about $30$ times more.',
      check: {
        kind: 'number',
        prompt: 'How many GB does the query for one day in April ($30$ days) read?',
        answer: 60,
        explanation:
          'Pruning keeps the April partition, $30 \\cdot 2 = 60$ GB, to use $2$ GB of it. Statistics inside the files can still skip row groups if the rows are sorted by day.',
      },
    },
    {
      id: 'day-country',
      title: 'Finer: day and country',
      caption:
        'Partition by day and by country, $50$ countries with the events spread evenly. Each partition holds $\\frac{2000}{50} = 40$ MB, far below $T$, so it is one small file.',
      check: {
        kind: 'number',
        prompt: 'How many files does the table have now?',
        answer: 18250,
        explanation:
          '$365 \\cdot 50 = 18\\,250$ partitions of one file each: $25$ times as many files as by day, each $25$ times smaller. A query for one country on one day reads $40$ MB, but a query for one day opens $50$ files instead of $2$.',
      },
    },
    {
      id: 'by-user',
      title: 'Far too fine: day and user',
      caption:
        'Partition by day and user_id, with $10^7$ users. Each day is cut into up to $10^7$ partitions, and the size line drops to hundreds of bytes: the listing alone costs more than the data.',
      check: {
        kind: 'number',
        prompt:
          'With the events spread evenly over the users, about how many bytes does one partition hold?',
        answer: 200,
        explanation:
          '$\\frac{2 \\cdot 10^9}{10^7} = 200$ bytes per user per day, in up to $3.65 \\cdot 10^9$ files. A Parquet footer alone is often larger than that.',
      },
    },
    {
      id: 'rule',
      title: 'A budget for partitions',
      caption:
        'For partitions of at least $T$, their number $P$ must satisfy $\\frac{B}{P} \\geq T$, so $P \\leq \\frac{B}{T}$. Day fits that budget, day and country does not. Partition by day and sort each day by country, and footer statistics skip by country inside the files.',
      check: {
        kind: 'number',
        prompt:
          'With $B = 730$ GB spread evenly and $T = 1$ GB, what is the largest number of partitions that keeps each at least $T$?',
        answer: 730,
        explanation:
          '$P \\leq \\frac{730}{1} = 730$. Day ($365$) fits; day and country ($18\\,250$) is $25$ times over.',
      },
    },
  ],
})
