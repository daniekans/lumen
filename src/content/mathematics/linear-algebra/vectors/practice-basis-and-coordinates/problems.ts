import { addN, cross3, det3, scaleN, type Vec3 } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { paren, sum, vector } = tex

/** Components flattened into problem data: { b00: 2, b01: 1 } for b0 = (2, 1). */
const flat = (name: string, v: readonly number[]) =>
  Object.fromEntries(v.map((x, i) => [`${name}${i}`, x]))

const flatBasis = (basis: readonly (readonly number[])[]) =>
  Object.assign({}, ...basis.map((b, k) => flat(`b${k}`, b))) as Record<string, number>

const as3 = (v: readonly number[]): Vec3 => [v[0]!, v[1]!, v[2]!]

/** A vector of n whole components in [lo, hi], not the zero vector. */
const intVector = (rng: Rng, n: number, lo: number, hi: number) => {
  for (;;) {
    const v = Array.from({ length: n }, () => rng.int(lo, hi))
    if (v.some((x) => x !== 0)) return v
  }
}

const det = (basis: readonly (readonly number[])[]) =>
  basis.length === 2
    ? basis[0]![0]! * basis[1]![1]! - basis[0]![1]! * basis[1]![0]!
    : det3(as3(basis[0]!), as3(basis[1]!), as3(basis[2]!))

/** A basis of whole vectors. In 2D, entries in [-3, 3]; in 3D, entries in [-1, 2] with some zeros. */
const randomBasis = (rng: Rng, n: 2 | 3) => {
  for (;;) {
    const basis =
      n === 2
        ? [intVector(rng, 2, -3, 3), intVector(rng, 2, -3, 3)]
        : [0, 1, 2].map(() => intVector(rng, 3, -1, 2))
    const zeros = basis.flat().filter((x) => x === 0).length
    if (det(basis) !== 0 && (n === 2 || zeros >= 3)) return basis
  }
}

/** The combination c1 b1 + ... + cn bn. */
const combine = (basis: readonly (readonly number[])[], c: readonly number[]) =>
  basis.reduce<number[]>(
    (acc, b, k) => addN(acc, scaleN(b, c[k]!)),
    basis[0]!.map(() => 0),
  )

const names = (n: number) => Array.from({ length: n }, (_, k) => `\\mathbf{b}_${k + 1}`)

/** "b1 = (..), b2 = (..)" in TeX. */
const basisTex = (basis: readonly (readonly number[])[]) =>
  basis.map((b, k) => `$${names(basis.length)[k]} = ${vector(b)}$`).join(', ')

/** The equation of component i in c1 b1 + ... + cn bn = x. */
const equation = (basis: readonly (readonly number[])[], x: readonly number[], i: number) =>
  `${sum(basis.map((b, k) => [b[i]!, `c_${k + 1}`] as [number, string]))} = ${x[i]}`

export const problems = defineProblems([
  {
    id: 'from-coords',
    title: 'From coordinates to components',
    skills: ['basis-coordinates'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.pick([2, 3] as const)
      const basis = randomBasis(rng, n)
      const c = Array.from({ length: n }, () => rng.nonZeroInt(-3, 3))
      const x = combine(basis, c)
      return {
        prompt: `In the basis ${basisTex(basis)}, a vector has coordinates $[\\mathbf{x}]_{\\mathcal{B}} = ${vector(c)}$. Find $\\mathbf{x}$.`,
        answer: { kind: 'vector', values: x },
        hints: [
          'Coordinates are weights: $\\mathbf{x} = c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 + \\cdots$.',
        ],
        solution: [
          `$\\mathbf{x} = ${basis.map((b, k) => `${paren(c[k]!)}${vector(b)}`).join(' + ')} = ${vector(x)}$.`,
        ],
        data: { n, ...flatBasis(basis), ...flat('c', c) },
      }
    },
  },
  {
    id: 'coords-2d',
    title: 'Coordinates in a basis of the plane',
    skills: ['basis-coordinates'],
    difficulty: 2,
    generate: (rng) => {
      const basis = randomBasis(rng, 2)
      const c = [rng.nonZeroInt(-3, 3), rng.int(-3, 3)]
      if (rng.bool()) c.reverse()
      const x = combine(basis, c)
      return {
        prompt: `Find the coordinates of $\\mathbf{x} = ${vector(x)}$ in the basis ${basisTex(basis)}.`,
        answer: { kind: 'vector', values: c },
        hints: [
          'Look for weights with $c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 = \\mathbf{x}$: one equation per component.',
          'Eliminate one weight, for example by multiplying an equation and adding.',
        ],
        solution: [
          `The components give $${equation(basis, x, 0)}$ and $${equation(basis, x, 1)}$.`,
          `Solving gives $c_1 = ${c[0]}$, $c_2 = ${c[1]}$, so $[\\mathbf{x}]_{\\mathcal{B}} = ${vector(c)}$.`,
        ],
        data: { n: 2, ...flatBasis(basis), ...flat('x', x) },
      }
    },
  },
  {
    id: 'coords-3d',
    title: 'Coordinates in a basis of space',
    skills: ['basis-coordinates'],
    difficulty: 3,
    generate: (rng) => {
      const basis = randomBasis(rng, 3)
      const c = Array.from({ length: 3 }, () => rng.int(-3, 3))
      if (!c.some((k) => k !== 0)) c[rng.int(0, 2)] = rng.nonZeroInt(-3, 3)
      const x = combine(basis, c)
      return {
        prompt: `Find the coordinates of $\\mathbf{x} = ${vector(x)}$ in the basis ${basisTex(basis)}.`,
        answer: { kind: 'vector', values: c },
        hints: [
          'Write $c_1\\mathbf{b}_1 + c_2\\mathbf{b}_2 + c_3\\mathbf{b}_3 = \\mathbf{x}$ as three equations, one per component.',
          'Start with an equation that has only one or two weights, and substitute.',
        ],
        solution: [
          `The components give $${[0, 1, 2].map((i) => equation(basis, x, i)).join(',\\quad ')}$.`,
          `Solving gives $[\\mathbf{x}]_{\\mathcal{B}} = ${vector(c)}$. Check: $${basis.map((b, k) => `${paren(c[k]!)}${vector(b)}`).join(' + ')} = ${vector(x)}$.`,
        ],
        data: { n: 3, ...flatBasis(basis), ...flat('x', x) },
      }
    },
  },
  {
    id: 'is-basis',
    title: 'Is it a basis',
    skills: ['basis-coordinates', 'span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      const options = ['Yes', 'No']
      const shape = rng.pick(['2-in-2', '2-in-2', '3-in-3', '3-in-3', '2-in-3', '3-in-2'] as const)
      let vs: number[][]
      let hints: string[]
      let solution: string[]
      const space = shape.endsWith('3') ? '\\mathbb{R}^3' : '\\mathbb{R}^2'
      if (shape === '2-in-2') {
        const v = intVector(rng, 2, -3, 3)
        const parallel = rng.bool()
        let w = scaleN(v, rng.pick([2, -2, 3, -1, -3]))
        if (!parallel) {
          do w = intVector(rng, 2, -4, 4)
          while (det([v, w]) === 0)
        }
        vs = [v, w]
        hints = [
          'Two vectors of the plane form a basis exactly when neither is a multiple of the other.',
        ]
        solution = parallel
          ? [`$${vector(w)}$ is a multiple of $${vector(v)}$: they span only a line. Not a basis.`]
          : [
              `Matching components of $${vector(v)}$ and $${vector(w)}$ do not share one ratio, so neither is a multiple of the other: they are independent.`,
              'Two independent vectors span the plane: a basis.',
            ]
      } else if (shape === '3-in-3') {
        const [v, w] = randomBasis(rng, 3)
        const inPlane = rng.bool()
        const a = rng.nonZeroInt(-2, 2)
        const b = rng.nonZeroInt(-2, 2)
        let u = addN(scaleN(v!, a), scaleN(w!, b))
        if (!inPlane) {
          const n = cross3(as3(v!), as3(w!))
          const g = n.reduce((acc, x) => gcd(acc, Math.abs(x)), 0)
          u = addN(u, scaleN(n, rng.pick([1, -1]) / g))
        }
        vs = [v!, w!, u]
        hints = [
          'Three vectors of space form a basis exactly when they are independent: none is a combination of the others.',
          'The first two are not parallel. Check whether the third is a combination of them.',
        ]
        solution = inPlane
          ? [
              `$${vector(u)} = ${sum([
                [a, vector(v!)],
                [b, vector(w!)],
              ])}$: the three lie in one plane and are dependent. Not a basis.`,
            ]
          : [
              'Solving for weights with two components and checking the third fails, so the third vector is not a combination of the first two.',
              'The first two are not parallel, so the three are independent, and three independent vectors span $\\mathbb{R}^3$: a basis.',
            ]
      } else if (shape === '2-in-3') {
        vs = randomBasis(rng, 3).slice(0, 2)
        hints = ['How many vectors does a basis of $\\mathbb{R}^3$ have?']
        solution = [
          'Two vectors span at most a plane, so they cannot span $\\mathbb{R}^3$. Not a basis, even though they are independent.',
        ]
      } else {
        vs = [...randomBasis(rng, 2), intVector(rng, 2, -3, 3)]
        hints = ['How many vectors does a basis of $\\mathbb{R}^2$ have?']
        solution = [
          'Three vectors of the plane are always dependent: the third is a combination of the other two, or the first two are parallel. Not a basis.',
        ]
      }
      const dim = shape.endsWith('3') ? 3 : 2
      const isBasis = vs.length === dim && det(vs) !== 0
      return {
        prompt: `Do ${vs.map((v) => `$${vector(v)}$`).join(', ')} form a basis of $${space}$?`,
        answer: { kind: 'choice', options, correct: isBasis ? 0 : 1 },
        hints,
        solution,
        data: {
          count: vs.length,
          dim,
          ...flatBasis(vs),
        },
      }
    },
  },
  {
    id: 'not-a-basis-k',
    title: 'When two vectors stop being a basis',
    skills: ['basis-coordinates'],
    difficulty: 2,
    generate: (rng) => {
      const v = [rng.int(-4, 4), rng.nonZeroInt(-4, 4)]
      const r = rng.pick([2, -2, 3, -3, -1])
      const k = r * v[0]!
      const second = r * v[1]!
      return {
        prompt: `For which $k$ do $${vector(v)}$ and $(k, ${second})$ fail to be a basis of $\\mathbb{R}^2$?`,
        answer: { kind: 'number', value: k },
        hints: [
          'They fail exactly when one is a multiple of the other.',
          `The second components fix the multiple: $${second} = ${paren(r)} \\cdot ${paren(v[1]!)}$.`,
        ],
        solution: [
          `$(k, ${second})$ must be $${sum([[r, vector(v)]])} = ${vector(scaleN(v, r))}$.`,
          `So $k = ${k}$. For any other $k$ the two are not parallel and form a basis.`,
        ],
        data: { v0: v[0]!, v1: v[1]!, second },
      }
    },
  },
])

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
