import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'checkpoint',
  title: 'Checkpoint: functions',
  summary:
    'Ten problems across the unit: the definition, evaluating, domains and ranges, composition, inverses, transformations and one short proof.',
  tags: ['function', 'checkpoint', 'domain', 'composition', 'inverse', 'transformation'],
  level: 'intro',
  order: 10,
  skills: ['definition', 'evaluate', 'domain-range', 'compose', 'inverse', 'transform'],
  problemCount: 10,
})
