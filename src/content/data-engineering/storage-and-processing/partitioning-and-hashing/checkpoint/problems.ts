import { defineProblems } from '@/lib/practice'
import { problems as consistent } from '../practice-consistent-hashing/problems'
import { problems as hashing } from '../practice-hashing-and-skew/problems'
import { problems as partitioning } from '../practice-partitioning/problems'

const practice = [...partitioning, ...hashing, ...consistent]
const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'partition-count',
    'pruned-read',
    'finest-layout',
    'bucket-of',
    'skew-ratio',
    'salted-load',
    'join-pairs',
    'join-moved',
    'stays-count',
  ]),
  {
    id: 'join-proof',
    title: 'A joining node takes keys only for itself',
    skills: ['consistent-hashing'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'On a hash ring, each key belongs to the first node at or after its position, clockwise. A new node $x$ joins. Show that every key that changes owner moves to $x$, and that the keys that move are exactly those on the arc from the node before $x$ (excluded) to $x$ (included).',
      answer: { kind: 'self' },
      hints: [
        'Write the owner as the node with the smallest clockwise distance $d(k, v) = (h(v) - h(k)) \\bmod 2^{32}$ from the key. What can adding one node do to a minimum?',
      ],
      solution: [
        'Let $d(k, v) = (h(v) - h(k)) \\bmod 2^{32}$ be the clockwise distance from key $k$ to node $v$. The owner of $k$ is the node with the smallest $d(k, v)$.',
        'Adding $x$ adds one candidate to that minimum. If $d(k, x)$ is smaller than the old minimum $d(k, o)$, where $o$ is the old owner, the new owner is $x$; otherwise the minimum, and so the owner, is still $o$. So a key either keeps its owner or moves to $x$: no key moves between two old nodes.',
        'Let $p$ be the node before $x$ on the new ring. A key on the arc after $p$ up to $x$ meets no node before $x$ when walking clockwise, so its new owner is $x$; before $x$ joined, it walked on past $x$ to another node, so it moved.',
        'A key outside that arc reaches some old node, $p$ or one before it, before reaching $x$, so its first node is the same as before and it does not move. The keys that move are exactly the keys on that arc.',
      ],
    }),
  },
])
