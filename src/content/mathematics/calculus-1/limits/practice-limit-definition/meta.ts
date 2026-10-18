import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: the limit definition',
  summary:
    'The largest δ for a given ε (lines and parabolas), the min(1, ε / C) rule, N for limits at infinity, growth comparisons and big-O constants, and short epsilon-delta proofs graded by you.',
  tags: ['epsilon-delta', 'epsilon-N', 'growth rates', 'big-O', 'proof', 'practice'],
  level: 'core',
  order: 11,
  skills: ['limit-definition', 'growth-rates'],
})
