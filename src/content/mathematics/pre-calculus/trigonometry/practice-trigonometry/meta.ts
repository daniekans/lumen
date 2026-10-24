import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: trigonometry',
  summary:
    'Convert degrees and radians, find arc lengths and exact values on the unit circle, get one ratio from another, read sinusoids, use the addition and double-angle formulas, evaluate inverses and solve equations in one turn.',
  tags: [
    'radians',
    'unit circle',
    'exact values',
    'identities',
    'sinusoid',
    'arcsin',
    'equations',
    'practice',
  ],
  level: 'intro',
  order: 5,
  skills: ['radians', 'unit-circle', 'trig-graphs', 'trig-identities', 'inverse-trig'],
})
