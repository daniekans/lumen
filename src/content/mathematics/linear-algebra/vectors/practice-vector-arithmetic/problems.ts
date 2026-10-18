import { addN, normSquaredN, scaleN, subN } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { num, paren, root, sum, term, vector } = tex

/** A whole number in [lo, hi] other than 0. */
const nonzero = (rng: Rng, lo: number, hi: number) => {
  for (;;) {
    const v = rng.int(lo, hi)
    if (v !== 0) return v
  }
}

/** A vector of n whole components in [lo, hi], not the zero vector. */
const intVector = (rng: Rng, n: number, lo: number, hi: number) => {
  for (;;) {
    const v = Array.from({ length: n }, () => rng.int(lo, hi))
    if (v.some((x) => x !== 0)) return v
  }
}

/** Components flattened into problem data: { v0: 3, v1: -1 }. */
const flat = (name: string, v: readonly number[]) =>
  Object.fromEntries(v.map((x, i) => [`${name}${i}`, x]))

/** The squares of the components written out: 3^2 + (-1)^2. */
const squares = (v: readonly number[]) => v.map((x) => `${paren(x)}^2`).join(' + ')

/** Integer vectors whose length is a whole number: [components..., length]. */
const WHOLE_LENGTH: readonly (readonly number[])[] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [1, 4, 8, 9],
  [4, 4, 7, 9],
  [2, 6, 9, 11],
]

export const problems = defineProblems([
  {
    id: 'combination',
    title: 'A linear combination',
    skills: ['vector-arithmetic', 'linear-combinations'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.pick([2, 2, 3])
      const v = intVector(rng, n, -4, 4)
      const w = intVector(rng, n, -4, 4)
      const a = nonzero(rng, -3, 3)
      const b = nonzero(rng, -3, 3)
      const value = addN(scaleN(v, a), scaleN(w, b))
      const op = b < 0 ? '-' : '+'
      const expr = `${term(a, '\\mathbf{v}')} ${op} ${term(Math.abs(b), '\\mathbf{w}')}`
      return {
        prompt: `With $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${vector(w)}$, compute $${expr}$.`,
        answer: { kind: 'vector', values: value },
        hints: [
          'Scale each vector first, then add component by component.',
          `$${term(a, '\\mathbf{v}')} = ${vector(scaleN(v, a))}$.`,
        ],
        solution: [
          `$${term(a, '\\mathbf{v}')} = ${vector(scaleN(v, a))}$ and $${term(b, '\\mathbf{w}')} = ${vector(scaleN(w, b))}$.`,
          `Add the components: $${vector(value)}$.`,
        ],
        data: { a, b, ...flat('v', v), ...flat('w', w) },
      }
    },
  },
  {
    id: 'solve-for-vector',
    title: 'Solve for a vector',
    skills: ['vector-arithmetic'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.pick([2, 3])
      const c = rng.pick([2, 3, -2, 4])
      const x = Array.from({ length: n }, () => rng.int(-4, 4))
      const v = intVector(rng, n, -5, 5)
      const w = addN(scaleN(x, c), v)
      return {
        prompt: `Find $\\mathbf{x}$ if $${c}\\mathbf{x} + ${vector(v)} = ${vector(w)}$.`,
        answer: { kind: 'vector', values: x },
        hints: [
          'Solve it as you would $cx + v = w$ with numbers: subtract, then divide.',
          `$${c}\\mathbf{x} = ${vector(w)} - ${vector(v)}$.`,
        ],
        solution: [
          `Subtract: $${c}\\mathbf{x} = ${vector(subN(w, v))}$.`,
          `Divide each component by $${c}$: $\\mathbf{x} = ${vector(x)}$.`,
        ],
        data: { c, ...flat('v', v), ...flat('w', w) },
      }
    },
  },
  {
    id: 'length',
    title: 'Length of a vector',
    skills: ['vector-length'],
    difficulty: 1,
    generate: (rng) => {
      const v = intVector(rng, rng.pick([2, 3]), -5, 5)
      const sq = normSquaredN(v)
      return {
        prompt: `Find the exact length $\\lVert ${vector(v)} \\rVert$.`,
        answer: { kind: 'expression', tex: root(sq) },
        hints: ['Square the components, add, and take the square root.'],
        solution: [
          `$\\lVert ${vector(v)} \\rVert = \\sqrt{${squares(v)}} = \\sqrt{${sq}}${root(sq) === `\\sqrt{${sq}}` ? '' : ` = ${root(sq)}`}$.`,
        ],
        data: flat('v', v),
      }
    },
  },
  {
    id: 'unit-vector',
    title: 'Unit vector',
    skills: ['vector-length'],
    difficulty: 2,
    generate: (rng) => {
      const row = rng.pick(WHOLE_LENGTH)
      const len = row.at(-1)!
      const v = rng.shuffle(row.slice(0, -1)).map((x) => (rng.bool() ? -x : x))
      const u = scaleN(v, 1 / len)
      return {
        prompt: `Find the unit vector in the direction of $${vector(v)}$.`,
        answer: { kind: 'vector', values: u },
        hints: ['Divide the vector by its length.', `Its length is $\\sqrt{${squares(v)}}$.`],
        solution: [
          `$\\lVert ${vector(v)} \\rVert = \\sqrt{${normSquaredN(v)}} = ${len}$.`,
          `Divide each component by $${len}$: $${vector(u, 20)}$.`,
        ],
        data: { len, ...flat('v', v) },
      }
    },
  },
  {
    id: 'distance',
    title: 'Distance between points',
    skills: ['vector-length'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.pick([2, 3])
      const p = Array.from({ length: n }, () => rng.int(-5, 5))
      let q = p
      while (q.every((x, i) => x === p[i])) q = Array.from({ length: n }, () => rng.int(-5, 5))
      const d = subN(q, p)
      const sq = normSquaredN(d)
      return {
        prompt: `Find the exact distance between $${vector(p)}$ and $${vector(q)}$.`,
        answer: { kind: 'expression', tex: root(sq) },
        hints: ['The distance is the length of the difference of the two vectors.'],
        solution: [
          `The difference is $${vector(q)} - ${vector(p)} = ${vector(d)}$.`,
          `Its length is $\\sqrt{${squares(d)}} = ${root(sq)}$.`,
        ],
        data: { ...flat('p', p), ...flat('q', q) },
      }
    },
  },
  {
    id: 'missing-component',
    title: 'A missing component',
    skills: ['vector-length'],
    difficulty: 3,
    generate: (rng) => {
      const k = rng.int(1, 6)
      const rest = intVector(rng, rng.pick([1, 2]), -5, 5)
      const sq = k * k + normSquaredN(rest)
      const restSq = normSquaredN(rest)
      return {
        prompt: `Find every number $k$ with $\\lVert (k, ${rest.map((x) => num(x)).join(', ')}) \\rVert = ${root(sq)}$.`,
        answer: { kind: 'list', values: [k, -k] },
        hints: ['Square both sides, so the root disappears.', `$k^2 + ${restSq} = ${sq}$.`],
        solution: [
          `Squaring gives $k^2 + ${rest.map((x) => `${paren(x)}^2`).join(' + ')} = ${sq}$, so $k^2 = ${k * k}$.`,
          `Two numbers have that square: $k = ${k}$ and $k = -${k}$.`,
        ],
        data: { k, ...flat('r', rest) },
      }
    },
  },
  {
    id: 'find-weights',
    title: 'Weights of a combination',
    skills: ['linear-combinations'],
    difficulty: 2,
    generate: (rng) => {
      let v: number[]
      let w: number[]
      do {
        v = intVector(rng, 2, -3, 3)
        w = intVector(rng, 2, -3, 3)
      } while (v[0]! * w[1]! - v[1]! * w[0]! === 0)
      const a = nonzero(rng, -3, 3)
      const b = nonzero(rng, -3, 3)
      const u = addN(scaleN(v, a), scaleN(w, b))
      const eq = (i: number) =>
        `${sum([
          [v[i]!, 'a'],
          [w[i]!, 'b'],
        ])} = ${u[i]}`
      return {
        prompt: `Find the weights $a$ and $b$ with $a${vector(v)} + b${vector(w)} = ${vector(u)}$. Answer as $(a, b)$.`,
        answer: { kind: 'vector', values: [a, b] },
        hints: [
          'Match the components: one equation for the first components, one for the second.',
          'Eliminate one weight, for example by multiplying an equation and adding.',
        ],
        solution: [
          `The components give $${eq(0)}$ and $${eq(1)}$.`,
          `Solving gives $a = ${a}$ and $b = ${b}$. Check: $${a}${vector(v)} + ${paren(b)}${vector(w)} = ${vector(u)}$.`,
        ],
        data: { a, b, ...flat('v', v), ...flat('w', w), ...flat('u', u) },
      }
    },
  },
])
