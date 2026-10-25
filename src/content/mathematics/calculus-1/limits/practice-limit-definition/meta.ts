import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: the limit definition',
  summary:
    'The largest $\\delta$ for a given $\\varepsilon$ (lines, parabolas, $\\frac{1}{x}$, $\\sqrt{x}$ and a machined part), the $\\min\\left(1, \\frac{\\varepsilon}{C}\\right)$ rule, $N$ for limits at infinity, growth comparisons and big-O constants, and short epsilon-delta proofs graded by you, one of them that a limit does not exist.',
  tags: ['epsilon-delta', 'epsilon-N', 'growth rates', 'big-O', 'proof', 'practice'],
  level: 'core',
  order: 11,
  skills: ['limit-definition', 'growth-rates'],
})
