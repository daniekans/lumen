import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Hash partitioning',
  summary:
    'A hash function maps each key to a large number, and the remainder of that number divided by n picks one of n buckets. The same key always lands in the same bucket, neighboring keys scatter, and range partitioning makes the opposite trade.',
  tags: ['hash', 'hash partitioning', 'modulo', 'bucket', 'Murmur3', 'range partitioning'],
  level: 'core',
  order: 4,
  skills: ['hashing'],
  steps: [
    {
      id: 'keys',
      title: 'Too many values for folders',
      caption:
        'An orders table, to be split by customer_id. A real table has millions of customers, far over the partition budget, so one folder per value is out. Fix the number of parts at $n = 4$ and send each key to one of them.',
    },
    {
      id: 'hash',
      title: 'A hash function',
      caption:
        'A hash function $h$ maps each key to a 32-bit number, from $0$ to $2^{32} - 1$. Neighboring keys such as $1001$ and $1002$ get unrelated numbers, but the same key always gets the same one.',
    },
    {
      id: 'modulo',
      title: 'Modulo picks a bucket',
      caption:
        'The bucket is $h \\bmod n$, the remainder after dividing by $n = 4$: always $0$, $1$, $2$ or $3$. The keys spread over the buckets, about evenly but not exactly.',
    },
    {
      id: 'same-key',
      title: 'Same key, same bucket',
      caption:
        'Every row of a customer has the same key, so the same $h$ and the same bucket, today and next year. All rows of a key meet in one bucket. Drag the key.',
    },
    {
      id: 'change-n',
      title: 'A different n',
      caption:
        'With $n = 5$ the remainders change, and $10$ of the $12$ keys move to another bucket. The number of buckets is part of the layout: change it and the data has to move. Drag $n$.',
    },
    {
      id: 'range',
      title: 'Range partitioning',
      caption:
        'The other way to cut a key: by ranges, $1001$ to $1003$, $1004$ to $1006$, and so on. New customers get the next ids, so all six new keys land in the last range while the others get none. Switch to Hash to compare.',
    },
    {
      id: 'range-query',
      title: 'What each layout reads',
      caption:
        'WHERE customer_id BETWEEN 1007 AND 1009. Ranges keep neighbors together, so one part holds them all. The hash scattered them over three buckets, which all have to be read. Switch the layout.',
    },
  ],
})
