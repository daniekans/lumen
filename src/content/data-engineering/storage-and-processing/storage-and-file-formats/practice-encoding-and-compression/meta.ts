import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: encoding and compression',
  summary:
    'Size dictionary codes, bit-packed, run-length and delta encodings, compute information and entropy, and pick the encoding that fits a column.',
  tags: ['encoding', 'dictionary', 'run-length', 'delta', 'entropy', 'compression', 'practice'],
  level: 'core',
  order: 6,
  skills: ['encoding', 'compression'],
})
