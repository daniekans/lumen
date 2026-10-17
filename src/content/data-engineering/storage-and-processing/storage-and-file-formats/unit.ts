import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Storage and file formats',
  description:
    'Row and column layouts, the pages a query reads, encodings and compression, and the anatomy of a Parquet file.',
  order: 1,
  prerequisites: [
    'data-engineering/relational-foundations/relational-model-and-joins',
    'mathematics/pre-calculus/exponential-and-logarithmic',
  ],
  skills: [
    {
      id: 'layouts',
      title: 'Place values in row and column layouts and match a layout to a workload',
    },
    { id: 'scan-cost', title: 'Count the bytes and pages a query reads' },
    { id: 'encoding', title: 'Size dictionary, bit-packed, run-length and delta encodings' },
    { id: 'compression', title: 'Relate entropy, order and cardinality to compression' },
    { id: 'parquet', title: 'Read a Parquet layout and predict what predicate pushdown skips' },
  ],
})
