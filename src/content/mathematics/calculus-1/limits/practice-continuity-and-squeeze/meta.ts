import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: continuity and standard limits',
  summary:
    'Constants that make piecewise functions continuous, kinds of discontinuity, the squeeze theorem, limits built on sin x / x, (e^x - 1)/x and (1 + a/n)^n, and root intervals from the intermediate value theorem.',
  tags: [
    'continuity',
    'discontinuity',
    'squeeze theorem',
    'standard limits',
    'intermediate value theorem',
    'practice',
  ],
  level: 'core',
  order: 7,
  skills: ['continuity', 'standard-limits'],
})
