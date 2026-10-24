import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: derivatives from the definition',
  summary:
    'Six problems on paper: secant slopes, the limit definition, tangent lines and one short proof.',
  tags: ['derivative', 'checkpoint', 'limit definition'],
  level: 'core',
  order: 13,
  skills: ['secant-slope', 'definition'],
  problemCount: 6,
})
