import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Derivatives',
  description:
    'The derivative as a limit, differentiation rules, the chain rule and implicit differentiation.',
  order: 2,
  skills: [{ id: 'definition', title: 'The derivative as a limit of difference quotients' }],
})
