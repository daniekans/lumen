import { defineProblems } from '@/lib/practice'
import { problems as basis } from '../practice-basis-and-coordinates/problems'
import { problems as dotAndSpan } from '../practice-dot-and-span/problems'
import { problems as arithmetic } from '../practice-vector-arithmetic/problems'

const pick = (ids: readonly string[]) =>
  ids.map((id) => [...arithmetic, ...dotAndSpan, ...basis].find((p) => p.id === id)!)

export const problems = defineProblems([
  ...pick([
    'combination',
    'find-weights',
    'unit-vector',
    'distance',
    'dot',
    'angle',
    'projection',
    'independent',
    'plane-equation',
    'line-meets-plane',
    'is-basis',
    'coords-2d',
    'coords-3d',
  ]),
  {
    id: 'proof-extend-independent',
    title: 'Extend an independent set',
    skills: ['span-and-independence'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Let $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$ be linearly independent, and let $\\mathbf{u}$ be a vector that is not in $\\operatorname{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$. Prove that $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k, \\mathbf{u}$ are linearly independent.',
      answer: { kind: 'self' },
      hints: [
        'Start from a combination $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k + d\\,\\mathbf{u} = \\mathbf{0}$ and show every weight is $0$.',
        'What would $d \\ne 0$ say about $\\mathbf{u}$?',
      ],
      solution: [
        'Suppose $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k + d\\,\\mathbf{u} = \\mathbf{0}$.',
        'If $d \\ne 0$, divide by $d$: $\\mathbf{u} = -\\frac{c_1}{d}\\mathbf{v}_1 - \\cdots - \\frac{c_k}{d}\\mathbf{v}_k$, a combination of the $\\mathbf{v}_i$. That puts $\\mathbf{u}$ in their span, which is false. So $d = 0$.',
        'Then $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$, and the independence of the $\\mathbf{v}_i$ gives $c_1 = \\cdots = c_k = 0$.',
        'Every weight is $0$, so the only combination equal to $\\mathbf{0}$ is the trivial one: the $k + 1$ vectors are independent.',
      ],
    }),
  },
])
