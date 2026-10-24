import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: trigonometry',
  summary:
    'Ten problems across the unit: radians and arc length, exact values, one ratio from another, sinusoids, the addition and double-angle formulas, inverse functions, equations and one short proof of the tangent addition formula.',
  tags: ['radians', 'unit circle', 'identities', 'sinusoid', 'inverse trigonometry', 'checkpoint'],
  level: 'intro',
  order: 6,
  skills: ['radians', 'unit-circle', 'trig-graphs', 'trig-identities', 'inverse-trig'],
  problemCount: 10,
})
