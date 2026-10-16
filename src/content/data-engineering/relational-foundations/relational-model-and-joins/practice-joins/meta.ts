import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: joins',
  summary:
    'Predict the rows of cross, inner, left, right and full joins on small tables, list the rows of an anti join, and reason about fan-out, keys and filters in ON or WHERE.',
  tags: ['join', 'inner join', 'left join', 'full join', 'anti join', 'row count', 'practice'],
  level: 'core',
  order: 7,
  skills: ['inner-join', 'outer-join', 'row-counts'],
})
