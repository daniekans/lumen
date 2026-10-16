import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Functions',
  description:
    'What a function is, domain and range, reading graphs, composition, inverses and transformations.',
  order: 2,
  skills: [
    { id: 'definition', title: 'Tell whether a relation is a function' },
    { id: 'evaluate', title: 'Evaluate a function from a formula, a table or a graph' },
    { id: 'domain-range', title: 'Find the domain and range' },
    { id: 'compose', title: 'Compose functions' },
    { id: 'inverse', title: 'Find and recognize inverse functions' },
    { id: 'transform', title: 'Shift, stretch and reflect graphs' },
  ],
})
