import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Complex arithmetic',
  description: 'Adding and multiplying complex numbers as operations on arrows.',
  order: 1,
  skills: [{ id: 'multiplication', title: 'Multiplication as rotation and scaling' }],
})
