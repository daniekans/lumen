import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: applications of derivatives',
  summary:
    "Thirteen problems across the unit: an error estimate with differentials, classifying critical points, absolute extrema, the mean value theorem, an inflection point, two optimization models, L'Hôpital's rule with its conditions, Newton's method, and a proof that equal derivatives mean a constant difference.",
  tags: [
    'checkpoint',
    'extrema',
    'mean value theorem',
    'optimization',
    "L'Hôpital's rule",
    "Newton's method",
  ],
  level: 'core',
  order: 11,
  skills: [
    'linear-approximation',
    'extrema',
    'mean-value-theorem',
    'concavity',
    'optimization',
    'lhopital',
    'newtons-method',
  ],
  problemCount: 13,
})
