import { defineProblems } from '@/lib/practice'
import { problems as joins } from '../practice-joins/problems'
import { problems as relationsAndKeys } from '../practice-relations-and-keys/problems'

const practice = [...relationsAndKeys, ...joins]
const pick = (ids: readonly string[]) => practice.filter((p) => ids.includes(p.id))

export const problems = defineProblems([
  ...pick([
    'relation-count',
    'composite-key',
    'dependency',
    'orphans',
    'inner-count',
    'fan-out',
    'outer-count',
    'anti-list',
    'on-versus-where',
  ]),
  {
    id: 'key-bound-proof',
    title: 'A join on a key',
    skills: ['row-counts', 'keys'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Let $k$ be a key of table $A$. Show that the join $A \\bowtie B$ on $A.k = B.k$ has at most $|B|$ rows.',
      answer: { kind: 'self' },
      hints: ['Count, for one row of $B$, how many rows of $A$ it can pair with.'],
      solution: [
        'Each row of the result is a pair $(a, b)$ with $a \\in A$, $b \\in B$ and $a.k = b.k$.',
        'Fix a row $b$ of $B$. Since $k$ is a key of $A$, at most one row $a$ has $a.k = b.k$ (none if $b.k$ is NULL or missing from $A$).',
        'So each row of $B$ appears in at most one pair, and the number of pairs is at most $|B|$.',
        'In the block picture: every $a_k \\leq 1$, so $\\sum_k a_k b_k \\leq \\sum_k b_k \\leq |B|$.',
      ],
    }),
  },
])
