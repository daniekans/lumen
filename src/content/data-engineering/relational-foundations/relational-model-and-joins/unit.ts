import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Relational model and joins',
  description:
    'Tables as relations, keys and references, and inner, outer and cross joins as filtered products.',
  order: 1,
  prerequisites: ['mathematics/pre-calculus/functions'],
  skills: [
    {
      id: 'relations',
      title: 'Read a table as a relation: tuples, products, degree and cardinality',
    },
    { id: 'keys', title: 'Identify primary, candidate and foreign keys' },
    { id: 'inner-join', title: 'Compute cross and inner joins' },
    { id: 'outer-join', title: 'Compute left, right, full and anti joins' },
    { id: 'row-counts', title: 'Predict how many rows a join returns' },
  ],
})
