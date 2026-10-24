import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: limits',
  summary:
    'Twelve problems across the unit: algebraic, one-sided and infinite limits, continuity, standard limits, the intermediate value theorem, growth rates, $\\delta$ for a given $\\varepsilon$, and one epsilon-delta proof.',
  tags: ['limit', 'continuity', 'epsilon-delta', 'checkpoint'],
  level: 'core',
  order: 12,
  skills: [
    'reading-limits',
    'one-sided-limits',
    'limits-at-infinity',
    'evaluating-limits',
    'standard-limits',
    'continuity',
    'growth-rates',
    'limit-definition',
  ],
  problemCount: 12,
})
