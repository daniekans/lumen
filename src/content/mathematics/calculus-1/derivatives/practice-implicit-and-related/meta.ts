import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: implicit derivatives and related rates',
  summary:
    'Slopes and tangent lines of curves given by equations, $\\frac{dx}{dy}$, slopes of inverse functions, $\\arctan$ and $\\arcsin$, logarithmic differentiation, and related rates: ladders, cones, balloons, angles, shadows and cars.',
  tags: [
    'implicit differentiation',
    'inverse function',
    'logarithmic differentiation',
    'related rates',
    'derivative',
    'practice',
  ],
  level: 'core',
  order: 13,
  skills: ['implicit-differentiation', 'related-rates', 'chain-rule'],
})
