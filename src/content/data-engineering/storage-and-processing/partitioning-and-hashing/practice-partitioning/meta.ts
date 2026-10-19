import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: partitioning',
  summary:
    'Count partitions and files, decide whether a filter prunes, size what a query reads after pruning, and pick the finest layout that keeps files near their target size.',
  tags: ['partition', 'partition pruning', 'small files', 'file size', 'practice'],
  level: 'core',
  order: 3,
  skills: ['partitioning', 'partition-design'],
})
