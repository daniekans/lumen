import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'practice',
  title: 'Practice: consistent hashing',
  summary:
    'Find the owner of a key on a hash ring, the keys a joining node takes, where a leaving node sends its keys and the share of a node, then compare how many keys move by modulo and on a ring.',
  tags: ['consistent hashing', 'hash ring', 'rehashing', 'modulo', 'practice'],
  level: 'core',
  order: 10,
  skills: ['consistent-hashing', 'hashing'],
})
