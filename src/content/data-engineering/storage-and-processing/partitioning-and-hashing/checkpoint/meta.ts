import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: partitioning, bucketing and hashing',
  summary:
    'Ten problems across the unit: partition counts and pruned reads, the finest layout, buckets and skew, salting, bucketed joins, keys moved on a ring and by modulo, and one short proof about consistent hashing.',
  tags: [
    'partitioning',
    'pruning',
    'hash',
    'skew',
    'bucketing',
    'consistent hashing',
    'checkpoint',
  ],
  level: 'core',
  order: 11,
  skills: [
    'partitioning',
    'partition-design',
    'hashing',
    'skew',
    'bucketing',
    'consistent-hashing',
  ],
  problemCount: 10,
})
