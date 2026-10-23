import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: hashing and skew',
  summary:
    'Find the bucket of a hash, choose between hash and range, measure skew from key counts, bound it for a hot key, size salted buckets, and count the pairs and buckets of a bucketed join.',
  tags: ['hash', 'bucket', 'skew', 'salting', 'bucketed join', 'practice'],
  level: 'core',
  order: 7,
  skills: ['hashing', 'skew', 'bucketing'],
})
