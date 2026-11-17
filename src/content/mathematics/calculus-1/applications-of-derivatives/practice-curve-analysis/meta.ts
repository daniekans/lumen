import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: curve analysis',
  summary:
    'Estimates and measurement errors with the tangent line, critical points and their classification, intervals of decrease, absolute extrema on a closed interval, the point the mean value theorem promises, concavity, inflection points, and the peak of a drug concentration.',
  tags: [
    'linear approximation',
    'critical point',
    'extrema',
    'mean value theorem',
    'concavity',
    'inflection point',
    'practice',
  ],
  level: 'core',
  order: 5,
  skills: ['linear-approximation', 'extrema', 'mean-value-theorem', 'concavity'],
})
