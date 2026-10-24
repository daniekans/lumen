import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: continuity and standard limits',
  summary:
    'Constants that make piecewise functions continuous, kinds of discontinuity, the squeeze theorem, limits built on $\\frac{\\sin x}{x}$, $\\frac{e^x - 1}{x}$ and $\\left(1 + \\frac{a}{n}\\right)^n$, and root intervals from the intermediate value theorem.',
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
