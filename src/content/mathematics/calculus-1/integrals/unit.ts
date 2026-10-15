import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Integrals',
  description: 'Riemann sums, the definite integral, the fundamental theorem and substitution.',
  order: 4,
  skills: [{ id: 'riemann-sums', title: 'Approximating area with Riemann sums' }],
})
