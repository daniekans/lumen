import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: storage and file formats',
  summary:
    'Ten problems across the unit: scan costs in row and column layouts, offsets, encoded sizes, entropy, footer statistics, pushdown on sorted files and one short proof about runs.',
  tags: ['layout', 'scan cost', 'encoding', 'entropy', 'Parquet', 'checkpoint'],
  level: 'core',
  order: 9,
  skills: ['layouts', 'scan-cost', 'encoding', 'compression', 'parquet'],
  problemCount: 10,
})
