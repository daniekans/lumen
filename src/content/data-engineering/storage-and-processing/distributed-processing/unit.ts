import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Distributed processing',
  description:
    'Shuffles, stages, skew and simple cost models for queries that run on many machines.',
  order: 3,
})
