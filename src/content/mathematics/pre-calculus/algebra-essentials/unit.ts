import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Algebra essentials',
  description:
    'Exponents and radicals, factoring, rational expressions, equations, inequalities and absolute value.',
  order: 1,
  skills: [
    { id: 'exponents', title: 'Use the exponent laws, including zero and negative exponents' },
    { id: 'radicals', title: 'Simplify radicals and use rational exponents' },
    { id: 'factor', title: 'Factor polynomials' },
    { id: 'rational-expressions', title: 'Simplify and combine rational expressions' },
    { id: 'equations', title: 'Solve linear, quadratic and rational equations' },
    { id: 'inequalities', title: 'Solve inequalities and write the answer as intervals' },
    { id: 'absolute-value', title: 'Solve absolute value equations and inequalities' },
  ],
})
