import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Skew',
  summary:
    'The load of a bucket is the sum of the frequencies of its keys. Many small keys even the loads out, one hot key does not, whatever the number of buckets, and salting splits a hot key into several.',
  tags: ['skew', 'hot key', 'salting', 'bucket', 'load balance', 'straggler'],
  level: 'core',
  order: 5,
  skills: ['skew', 'hashing'],
  steps: [
    {
      id: 'loads',
      title: 'Bucket loads',
      caption:
        'An orders table of $N = 10\\,000$ rows: $40$ customers with $250$ orders each, hashed into $n = 8$ buckets. Each block is one key; a bucket holds the rows of its keys, so its load is the sum of their frequencies.',
      check: {
        kind: 'number',
        prompt: 'What is the mean load, in rows per bucket?',
        answer: 1250,
        explanation:
          'The loads add up to $N$, so the mean is $\\frac{N}{n} = \\frac{10\\,000}{8} = 1250$.',
      },
    },
    {
      id: 'ratio',
      title: 'The max-to-mean ratio',
      caption:
        'Each bucket is one task, and the stage ends when the largest task ends. The skew ratio compares that task with the mean: here the largest bucket holds $8$ keys, $2000$ rows.',
      check: {
        kind: 'number',
        prompt: 'What is the ratio of the largest load to the mean load?',
        answer: 1.6,
        explanation:
          '$\\frac{2000}{1250} = 1.6$: the stage takes about $1.6$ times as long as a perfectly even split, while the other tasks finish early and wait.',
      },
    },
    {
      id: 'many-keys',
      title: 'Many small keys',
      caption:
        'The same $10\\,000$ rows from $1000$ customers with $10$ orders each. Every bucket now sums about $125$ keys, and the largest load is only $8\\%$ above the mean.',
      check: {
        kind: 'choice',
        prompt: 'Why are the loads more even than with $40$ keys?',
        options: [
          'Each bucket sums many independent keys, so the deviations average out',
          'The hash function is better for larger key values',
          'More keys means more buckets',
        ],
        answer: 0,
        explanation:
          'The number of keys in a bucket varies around $\\frac{K}{n}$ with a standard deviation of $\\sqrt{\\frac{K}{n}\\left(1 - \\frac{1}{n}\\right)}$, a relative spread of $\\sqrt{(n - 1)/K}$: about $0.42$ for $40$ keys, $0.08$ for $1000$. The hash and $n$ are unchanged.',
      },
    },
    {
      id: 'hot-key',
      title: 'A hot key',
      caption:
        'Now one customer, a marketplace reseller, has $3000$ of the orders ($p = 30\\%$), and $700$ others have $10$ each. All $3000$ rows share one key, so they land in one bucket.',
      check: {
        kind: 'number',
        prompt:
          'With $n = 8$, what is the smallest skew ratio any hash could give? (The hot key alone fills one bucket.)',
        answer: 2.4,
        explanation:
          'The largest load is at least $pN = 3000$, against a mean of $1250$: a ratio of at least $\\frac{pN}{N/n} = pn = 0.3 \\cdot 8 = 2.4$. The other rows in that bucket push it to about $3.1$.',
      },
    },
    {
      id: 'more-buckets',
      title: 'More buckets make it worse',
      caption:
        'Double the buckets to $n = 16$. The other buckets shrink, but the hot bucket still holds the $3000$ rows, so the ratio grows to about $5.6$.',
      check: {
        kind: 'number',
        prompt: 'What is the lower bound $pn$ on the ratio now?',
        answer: 4.8,
        explanation:
          '$0.3 \\cdot 16 = 4.8$. The bound grows with $n$: adding buckets shrinks the mean but not the hot key, so a hot key cannot be fixed by more parallelism.',
      },
    },
    {
      id: 'salting',
      title: 'Salting',
      caption:
        'Salt the hot key: give each of its rows a salt $s$ from $0$ to $S - 1$ and hash the pair (key, $s$). The $3000$ rows become $S$ smaller keys that land in different buckets. Drag $S$.',
      check: {
        kind: 'number',
        prompt: 'With $S = 8$ salts spread evenly, how many rows does each salted key hold?',
        answer: 375,
        explanation:
          '$\\frac{3000}{8} = 375$. The salted keys still collide now and then (two salts can hash to the same bucket), so the ratio drops toward $1$ but not to it. A join must copy the other side of the hot key once per salt.',
      },
    },
  ],
})
