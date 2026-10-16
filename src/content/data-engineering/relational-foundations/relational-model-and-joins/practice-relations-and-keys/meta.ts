import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: relations and keys',
  summary:
    'Sizes of products and counts of relations, the cardinality of a table read as a set, keys of one and two columns, functional dependencies, and foreign keys under deletes.',
  tags: [
    'relation',
    'Cartesian product',
    'key',
    'functional dependency',
    'foreign key',
    'practice',
  ],
  level: 'intro',
  order: 6,
  skills: ['relations', 'keys'],
})
