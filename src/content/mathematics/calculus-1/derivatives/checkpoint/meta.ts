import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: derivatives',
  summary:
    'Twelve problems across the unit: the limit definition, a slope that removes a corner, the product, quotient and chain rules, implicit and inverse derivatives, a related rate, and a proof of the product rule.',
  tags: ['derivative', 'checkpoint', 'limit definition', 'chain rule', 'implicit differentiation'],
  level: 'core',
  order: 14,
  skills: [
    'secant-slope',
    'definition',
    'derivative-graphs',
    'basic-rules',
    'transcendental-derivatives',
    'chain-rule',
    'implicit-differentiation',
    'related-rates',
  ],
  problemCount: 12,
})
