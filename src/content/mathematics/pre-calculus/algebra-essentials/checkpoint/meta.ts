import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: algebra essentials',
  summary:
    'Ten problems across the unit: exponents, radicals, factoring, rational expressions, equations with extraneous solutions, inequalities, absolute value and one short proof.',
  tags: ['exponent', 'radical', 'factoring', 'equation', 'inequality', 'checkpoint'],
  level: 'intro',
  order: 9,
  skills: [
    'exponents',
    'radicals',
    'factor',
    'rational-expressions',
    'equations',
    'inequalities',
    'absolute-value',
  ],
  problemCount: 10,
})
