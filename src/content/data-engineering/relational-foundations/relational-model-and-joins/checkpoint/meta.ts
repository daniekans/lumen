import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: relational model and joins',
  summary:
    'Ten problems across the unit: relations, keys and dependencies, foreign keys, inner, outer and anti joins, fan-out, filters in ON or WHERE, and one short proof.',
  tags: ['relation', 'key', 'join', 'row count', 'checkpoint'],
  level: 'core',
  order: 8,
  skills: ['relations', 'keys', 'inner-join', 'outer-join', 'row-counts'],
  problemCount: 10,
})
