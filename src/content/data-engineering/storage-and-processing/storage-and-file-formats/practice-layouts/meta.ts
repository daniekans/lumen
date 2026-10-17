import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: layouts and scan cost',
  summary:
    'Size tables, count the bytes and pages a scan reads in row and column layouts, find where a value lives, and match a layout to a workload.',
  tags: ['row store', 'column store', 'page', 'scan', 'offset', 'practice'],
  level: 'core',
  order: 3,
  skills: ['layouts', 'scan-cost'],
})
