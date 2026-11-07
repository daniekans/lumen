import { defineProblems, type ProblemGenerator } from '@/lib/practice'
import { problems as maps } from '../practice-maps/problems'
import { problems as products } from '../practice-matrix-products/problems'
import { problems as matrixVector } from '../practice-matrix-vector/problems'

/** Generators by id from one set (ids repeat across sets, such as `shape`). */
const from = (set: readonly ProblemGenerator[], ids: readonly string[]) =>
  ids.map((id) => {
    const g = set.find((p) => p.id === id)
    if (!g) throw new Error(`No generator ${id}`)
    return g
  })

export const problems = defineProblems([
  ...from(matrixVector, [
    'product-shape',
    'matrix-from-formula',
    'image-from-basis',
    'witness',
    'layer',
  ]),
  ...from(products, [
    'product-rect',
    'rotation-power',
    'compose-described',
    'standard-map',
    'transpose-product',
  ]),
  ...from(maps, ['rotation-3d', 'nonsquare', 'kernel-vector', 'rank', 'reachable']),
  {
    id: 'proof-composition',
    title: 'A composition of linear maps',
    skills: ['matrix-multiplication', 'linear-maps'],
    difficulty: 3,
    generate: () => ({
      prompt:
        'Let $S: \\mathbb{R}^p \\to \\mathbb{R}^n$ and $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ be linear maps with matrices $B$ ($n \\times p$) and $A$ ($m \\times n$). Prove that the composition $T \\circ S$, $\\mathbf{x} \\mapsto T(S(\\mathbf{x}))$, is linear, and that its matrix is $AB$: column $j$ of its matrix is $A\\mathbf{b}_j$, where $\\mathbf{b}_j$ is column $j$ of $B$.',
      answer: { kind: 'self' },
      hints: [
        'Apply $T \\circ S$ to $a\\mathbf{u} + b\\mathbf{v}$ and use the linearity of $S$, then of $T$.',
        'The matrix of a linear map has the images of the standard basis vectors as its columns.',
      ],
      solution: [
        'Linearity: $T(S(a\\mathbf{u} + b\\mathbf{v})) = T(aS(\\mathbf{u}) + bS(\\mathbf{v})) = aT(S(\\mathbf{u})) + bT(S(\\mathbf{v}))$, using first that $S$ is linear and then that $T$ is. So $T \\circ S$ keeps combinations: it is linear.',
        'A linear map from $\\mathbb{R}^p$ is fixed by where the standard basis $\\mathbf{e}_1, \\ldots, \\mathbf{e}_p$ goes, and its matrix has those images as columns.',
        'Here $S(\\mathbf{e}_j) = B\\mathbf{e}_j = \\mathbf{b}_j$, so $T(S(\\mathbf{e}_j)) = A\\mathbf{b}_j$.',
        'So the matrix of $T \\circ S$ has columns $A\\mathbf{b}_1, \\ldots, A\\mathbf{b}_p$, which is the definition of $AB$. In particular $(AB)\\mathbf{x} = A(B\\mathbf{x})$ for every $\\mathbf{x}$.',
      ],
    }),
  },
])
