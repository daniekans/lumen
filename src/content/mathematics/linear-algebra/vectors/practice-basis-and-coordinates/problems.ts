import { addN, det3, scaleN, type Vec3 } from '@/lib/math'
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
    id: 'basis-k',
    title: 'When three vectors stop being a basis',
    skills: ['basis-coordinates', 'span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-2, 2)
      const b = rng.nonZeroInt(-2, 2)
      const weights = (eq: number[], vs: number[][]) =>
        eq.map(
          (i) =>
            `$${sum(vs.slice(0, 2).map((x, k) => [x[i]!, 'ab'[k]!] as [number, string]))} = ${vs[2]![i]}$`,
        )
      if (rng.int(1, 3) === 1) {
        // Three vectors of the plane: the third is a combination of the other two.
        const [v, w] = randomBasis(rng, 2) as [number[], number[]]
        const u = combine([v, w], [a, b])
        return {
          prompt: `Three vectors of the plane are never a basis of $\\mathbb{R}^2$: one is a combination of the others. Find $(a, b)$ with $a${vector(v)} + b${vector(w)} = ${vector(u)}$.`,
          answer: { kind: 'vector', values: [a, b] },
          hints: ['One equation per component: two equations, two unknowns.'],
          solution: [
            `The components give ${weights([0, 1], [v, w, u]).join(' and ')}, so $a = ${a}$ and $b = ${b}$.`,
            'The first two are not parallel, so these weights are the only ones. The third vector adds nothing to their span: the three are dependent, and no set of three vectors of the plane is a basis.',
          ],
          data: { shape: 2, ...flatBasis([v, w, u]) },
        }
      }
      const [v, w] = randomBasis(rng, 3) as [number[], number[]]
      const u = combine([v, w], [a, b])
      // Hide a component whose other two still fix the weights.
      const rest = (i: number) => [0, 1, 2].filter((m) => m !== i)
      const at = rng.shuffle([0, 1, 2]).find((i) => det(rest(i).map((m) => [v[m]!, w[m]!])) !== 0)!
      const shown = `(${u.map((c, i) => (i === at ? 'k' : String(c))).join(', ')})`
      return {
        prompt: `For which $k$ do $\\mathbf{v} = ${vector(v)}$, $\\mathbf{w} = ${vector(w)}$ and $\\mathbf{u} = ${shown}$ fail to be a basis of $\\mathbb{R}^3$?`,
        answer: { kind: 'number', value: u[at]! },
        hints: [
          'Three vectors of space fail to be a basis exactly when they are dependent. $\\mathbf{v}$ and $\\mathbf{w}$ are not parallel, so $\\mathbf{u}$ must be a combination $a\\mathbf{v} + b\\mathbf{w}$.',
          'Find $a$ and $b$ from the two components without $k$.',
        ],
        solution: [
          `The components without $k$ give ${weights(rest(at), [v, w, u]).join(' and ')}, so $a = ${a}$ and $b = ${b}$.`,
          `Then $k = ${paren(a)} \\cdot ${paren(v[at]!)} + ${paren(b)} \\cdot ${paren(w[at]!)} = ${u[at]}$. For any other $k$, $\\mathbf{u}$ is off the plane of $\\mathbf{v}$ and $\\mathbf{w}$, and the three form a basis.`,
        ],
        data: { shape: 3, at, ...flatBasis([v, w, u]) },
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
