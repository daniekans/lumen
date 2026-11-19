import { defineProblems, type ProblemGenerator } from '@/lib/practice'
import { problems as determinants } from '../practice-determinants/problems'
import { problems as volumes } from '../practice-volume-and-cross/problems'

/** Generators by id from one set. */
const from = (set: readonly ProblemGenerator[], ids: readonly string[]) =>
  ids.map((id) => {
    const g = set.find((p) => p.id === id)
    if (!g) throw new Error(`No generator ${id}`)
    return g
  })

export const problems = defineProblems([
  ...from(determinants, [
    'det-3x3',
    'det-4x4',
    'row-operations',
    'singular-k',
    'collinear',
    'polygon-area',
    'image-area',
  ]),
  ...from(volumes, [
    'cross',
    'triangle-area',
    'tetrahedron',
    'coplanar-k',
    'plane-through-points',
    'torque',
    'product-rules',
  ]),
  {
    id: 'proof-dependent',
    title: 'Dependent columns',
    skills: ['determinant-rules'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Prove from the three rules of the determinant (linear in each column, two equal columns give $0$, $\\det I = 1$) that if the columns $\\mathbf{a}_1, \\ldots, \\mathbf{a}_n$ of a square matrix $A$ are linearly dependent, then $\\det A = 0$.',
      answer: { kind: 'self' },
      hints: [
        'Dependent columns: one column is a combination of the others. Say $\\mathbf{a}_j = \\sum_{k \\ne j} c_k\\mathbf{a}_k$.',
        'Replace column $j$ by that sum and expand with rule 2 in column $j$.',
      ],
      solution: [
        'If the columns are dependent, some $c_1\\mathbf{a}_1 + \\cdots + c_n\\mathbf{a}_n = \\mathbf{0}$ with some $c_j \\ne 0$. Dividing by $c_j$, column $j$ is a combination of the others: $\\mathbf{a}_j = \\sum_{k \\ne j} b_k\\mathbf{a}_k$.',
        'Put that sum in column $j$. Rule 2 in column $j$ splits the determinant: $\\det A = \\sum_{k \\ne j} b_k \\det[\\mathbf{a}_1\\ \\cdots\\ \\mathbf{a}_k\\ \\cdots\\ \\mathbf{a}_n]$, where in term $k$ column $j$ holds $\\mathbf{a}_k$.',
        'In term $k$, column $j$ and column $k$ are both $\\mathbf{a}_k$: two equal columns, so the term is $0$.',
        'Every term is $0$, so $\\det A = 0$. (Rule 1 is not needed. Two equal columns are the special case $\\mathbf{a}_j = \\mathbf{a}_k$.)',
      ],
    }),
  },
])
