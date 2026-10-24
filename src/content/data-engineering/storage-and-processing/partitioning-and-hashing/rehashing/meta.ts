import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Rehashing',
  summary:
    'Going from $n$ to $n + 1$ buckets with $h \\bmod n$ keeps a key only when both remainders agree, which happens for $n$ of every $n(n + 1)$ hash values. So $\\frac{n}{n + 1}$ of the keys move, $n$ times more than the new bucket needs.',
  tags: ['rehashing', 'modulo', 'bucket', 'remainder', 'resize'],
  level: 'core',
  order: 8,
  skills: ['consistent-hashing'],
  steps: [
    {
      id: 'remainders',
      title: 'The bucket depends only on h',
      caption:
        'A key lands in bucket $h \\bmod n$, so whether it moves depends only on its hash $h$. Take every value of $h$ from $0$ and write its bucket for $n = 4$: $0, 1, 2, 3$, then again.',
    },
    {
      id: 'add-bucket',
      title: 'One more bucket',
      caption:
        'With $n + 1 = 5$ buckets, the remainders run $0$ to $4$ and fall out of step with the first row. A key stays only where the two rows agree: $h = 0, 1, 2, 3$, and then not again for a while.',
    },
    {
      id: 'period',
      title: 'The pattern repeats',
      caption:
        'Both rows repeat every $4 \\cdot 5 = 20$ values, so the pattern does too. In each block of $20$, only the first $4$ values stay: $\\frac{4}{20} = \\frac{1}{5}$ of the keys stay and $\\frac{4}{5}$ move.',
    },
    {
      id: 'real-keys',
      title: 'Real keys',
      caption:
        'The hashes of $400$ customer ids, one dot each. $323$ change bucket from $n = 4$ to $5$, about $81\\%$, close to the $80\\%$ the pattern predicts.',
    },
    {
      id: 'any-n',
      title: 'More buckets, more moves',
      caption:
        'For any $n$, a key stays only if $h \\bmod n(n + 1) < n$, so $\\frac{n}{n + 1}$ of the keys move. More buckets make it worse: $90\\%$ at $n = 9$. Drag $n$.',
    },
    {
      id: 'doubling',
      title: 'Doubling',
      caption:
        'Going from $n$ to $2n$ instead keeps a key when $h \\bmod 2n < n$: half of them. Every moved key goes from bucket $b$ to $b + n$, so each bucket splits in two. Drag $n$.',
    },
    {
      id: 'fewest',
      title: 'The fewest moves',
      caption:
        'A fifth bucket needs only its share of the keys, $\\frac{1}{5}$ of them, $80$ here. Modulo moves $323$, about $n$ times that. Consistent hashing gets close to the fewest.',
    },
  ],
})
