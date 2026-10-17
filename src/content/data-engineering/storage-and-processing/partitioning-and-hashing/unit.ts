import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Partitioning, bucketing and hashing',
  description:
    'Splitting data by key into partitions and buckets, hash functions, and how key distributions decide balance.',
  order: 2,
})
