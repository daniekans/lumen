import { defineCourse } from '@/catalog/types'

export const course = defineCourse({
  title: 'Storage and processing',
  description:
    'How data sits on disk, how it is split across files and machines, and what a query costs.',
  order: 2,
  prerequisites: ['data-engineering/relational-foundations'],
})
