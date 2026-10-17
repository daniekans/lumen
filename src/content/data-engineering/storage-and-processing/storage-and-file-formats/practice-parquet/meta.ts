import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: Parquet',
  summary:
    'Count row groups and column chunks, decide which row groups footer statistics skip, size what a query reads with projection and pushdown, and pick a file format for a workload.',
  tags: ['Parquet', 'row group', 'predicate pushdown', 'statistics', 'Avro', 'CSV', 'practice'],
  level: 'core',
  order: 8,
  skills: ['parquet', 'scan-cost'],
})
