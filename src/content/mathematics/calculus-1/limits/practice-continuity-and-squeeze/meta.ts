import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: continuity and standard limits',
  summary:
    'Constants that make piecewise functions continuous, kinds of discontinuity (oscillating too), the squeeze theorem with given bounds and with bounds you build, limits built on $\\frac{\\sin x}{x}$, $\\frac{e^x - 1}{x}$ and $\\left(1 + \\frac{a}{n}\\right)^n$, continuous compounding, root intervals from the intermediate value theorem, and bisection steps for an accuracy.',
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
