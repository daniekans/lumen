import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: difference quotients',
  summary:
    'Secant slopes, difference quotients and derivatives from the limit definition, for polynomials, $\\frac{k}{x}$ and $\\sqrt{x}$, and a slope that removes a corner.',
  tags: ['derivative', 'limit definition', 'secant', 'tangent line', 'differentiable', 'practice'],
  level: 'core',
  order: 2,
  skills: ['secant-slope', 'definition', 'derivative-graphs'],
})
