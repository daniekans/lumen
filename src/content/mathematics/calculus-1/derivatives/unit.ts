import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Derivatives',
  description:
    'The derivative as a limit, differentiation rules, the chain rule and implicit differentiation.',
  order: 2,
  skills: [
    { id: 'secant-slope', title: 'Average rate of change as a secant slope' },
    { id: 'definition', title: 'The derivative as a limit of difference quotients' },
  ],
})
