import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Bucketed joins',
  summary:
    'Hash both tables of a join on the join key with the same function and the same number of buckets, and matching rows can only meet inside the same bucket. Tables stored that way join bucket by bucket, with no shuffle.',
  tags: ['bucketing', 'bucketed table', 'join', 'shuffle', 'sort-merge join', 'CLUSTERED BY'],
  level: 'core',
  order: 6,
  skills: ['bucketing'],
  steps: [
    {
      id: 'pairs',
      title: 'Every pair',
      caption:
        'Join $16$ orders with $8$ customers on customer_id. The grid has one cell per pair, $16 \\cdot 8 = 128$. Checking every pair is the cost of a join that knows nothing about where the keys are.',
    },
    {
      id: 'matches',
      title: 'The matches',
      caption:
        'Only $16$ pairs match: each order has one customer. The other $112$ comparisons are wasted work, and with millions of rows on each side they are most of it.',
    },
    {
      id: 'hash-both',
      title: 'Hash both sides',
      caption:
        'Put both tables in $n = 4$ buckets with the same $h \\bmod 4$, and sort the grid by bucket. Equal keys get equal buckets, so every match lies in a block on the diagonal: bucket $k$ meets bucket $k$.',
    },
    {
      id: 'shuffle',
      title: 'A shuffle does this at query time',
      caption:
        'A distributed join on unbucketed tables sends every row over the network to the worker of its bucket, all $24$ of them. Then each task joins one block: $\\sum a_k b_k = 32$ pairs instead of $128$.',
    },
    {
      id: 'bucketed',
      title: 'Bucketed tables',
      caption:
        'A bucketed table did that work when it was written: each table is stored as files that each hold one of the $4$ buckets. Task $k$ reads bucket $k$ of each table and joins them. No row moves.',
    },
    {
      id: 'more-buckets',
      title: 'Eight buckets',
      caption:
        'With $n = 8$ the blocks are smaller: $20$ pairs. Each block joins the keys of one bucket, so the blocks are independent and run as separate tasks. Switch $n$.',
    },
    {
      id: 'different-counts',
      title: 'Different bucket counts',
      caption:
        'Orders in $8$ buckets, customers in $4$. Since $h \\bmod 4 = (h \\bmod 8) \\bmod 4$, orders buckets $k$ and $k + 4$ both meet customers bucket $k$. An engine can use that, or shuffle one side to match.',
    },
  ],
})
