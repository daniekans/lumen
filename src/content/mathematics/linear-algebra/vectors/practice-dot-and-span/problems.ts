import { addN, cross3, dotN, scaleN, type Vec3 } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, num, paren, sum, vector } = tex

/** A vector of n whole components in [lo, hi], not the zero vector. */
const ORDINAL = ['first', 'second', 'third']

const intVector = (rng: Rng, n: number, lo: number, hi: number) => {
  for (;;) {
    const v = Array.from({ length: n }, () => rng.int(lo, hi))
    if (v.some((x) => x !== 0)) return v
  }
}

/** Components flattened into problem data: { v0: 3, v1: -1 }. */
const flat = (name: string, v: readonly number[]) =>
  Object.fromEntries(v.map((x, i) => [`${name}${i}`, x]))

/** The products of matching components written out: 3 \cdot 1 + (-1) \cdot 2. */
const products = (v: readonly number[], w: readonly number[]) =>
  v.map((x, i) => `${paren(x)} \\cdot ${paren(w[i]!)}`).join(' + ')

const as3 = (v: readonly number[]): Vec3 => [v[0]!, v[1]!, v[2]!]

/**
 * Pairs of vectors with a known angle in degrees. Problems turn them by permuting the
 * coordinates and flipping signs of the same coordinate in both, which keeps every angle, and
 * scale each vector by a positive whole number, which keeps it too.
 */
const ANGLE_PAIRS: readonly { v: number[]; w: number[]; deg: number }[] = [
  { v: [1, 0, 0], w: [1, 1, 0], deg: 45 },
  { v: [1, 1, 0], w: [0, 1, 1], deg: 60 },
  { v: [1, 2, 2], w: [2, 1, -2], deg: 90 },
  { v: [1, 0, 1], w: [-1, 1, 0], deg: 120 },
  { v: [1, 0, 0], w: [-1, 1, 0], deg: 135 },
  { v: [1, 0, 0], w: [-1, 0, 0], deg: 180 },
  { v: [1, 1, 1], w: [1, 1, 1], deg: 0 },
  { v: [3, 4, 0], w: [-4, 3, 0], deg: 90 },
]

/**
 * Weights a, b with a v + b w matching u in components i and j (Cramer's rule on those two
 * rows), and the component k left to check. `ij` must have a nonzero determinant.
 */
const solveTwoRows = (
  v: Vec3,
  w: Vec3,
  u: readonly number[],
  [i, j]: readonly [number, number],
) => {
  const det = v[i]! * w[j]! - v[j]! * w[i]!
  const a = (u[i]! * w[j]! - u[j]! * w[i]!) / det
  const b = (v[i]! * u[j]! - v[j]! * u[i]!) / det
  return { a, b, det }
}

/** Two components where v and w are not parallel, so the weights can be solved from them. */
const solvableRows = (v: Vec3, w: Vec3): [number, number] => {
  const pairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
  ]
  return pairs.find(([i, j]) => v[i]! * w[j]! - v[j]! * w[i]! !== 0)!
}

/** Two vectors of space that are not parallel, with small whole components. */
const independentPair = (rng: Rng): [Vec3, Vec3] => {
  for (;;) {
    const v = as3(intVector(rng, 3, -3, 3))
    const w = as3(intVector(rng, 3, -3, 3))
    if (cross3(v, w).some((x) => x !== 0)) return [v, w]
  }
}

/** A third vector: a combination of v and w, or that plus a multiple of their normal (off the plane). */
const thirdVector = (rng: Rng, v: Vec3, w: Vec3, inSpan: boolean) => {
  const a = rng.nonZeroInt(-2, 2)
  const b = rng.nonZeroInt(-2, 2)
  const base = addN(scaleN(v, a), scaleN(w, b))
  if (inSpan) return { u: base, a, b }
  // A small step off the plane, so the numbers stay readable.
  const n = cross3(v, w)
  const g = n.reduce((acc, x) => gcd(acc, Math.abs(x)), 0)
  const step = scaleN(n, rng.pick([1, -1]) / g)
  return { u: addN(base, step), a, b }
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

const combo = (a: number, b: number) =>
  sum([
    [a, '\\mathbf{v}'],
    [b, '\\mathbf{w}'],
  ])

export const problems = defineProblems([
  {
    id: 'dot',
    title: 'A dot product',
    skills: ['dot-product'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.pick([2, 3, 3])
      const v = intVector(rng, n, -5, 5)
      const w = intVector(rng, n, -5, 5)
      const value = dotN(v, w)
      return {
        prompt: `Compute $${vector(v)} \\cdot ${vector(w)}$.`,
        answer: { kind: 'number', value },
        hints: ['Multiply matching components, then add the products.'],
        solution: [`$${products(v, w)} = ${value}$.`],
        data: { ...flat('v', v), ...flat('w', w) },
      }
    },
  },
  {
    id: 'angle',
    title: 'The angle between two vectors',
    skills: ['dot-product'],
    difficulty: 2,
    generate: (rng) => {
      const pair = rng.pick(ANGLE_PAIRS)
      const order = rng.shuffle([0, 1, 2])
      const signs = order.map(() => rng.pick([1, -1]))
      const turn = (x: readonly number[]) => order.map((k, i) => x[k]! * signs[i]!)
      const v = scaleN(turn(pair.v), rng.int(1, 2))
      const w = scaleN(turn(pair.w), rng.int(1, 3))
      // Drop a coordinate that is zero in both, so some problems are in the plane.
      const zero = [0, 1, 2].find((i) => v[i] === 0 && w[i] === 0)
      const vv = zero === undefined ? v : v.filter((_, i) => i !== zero)
      const ww = zero === undefined ? w : w.filter((_, i) => i !== zero)
      const d = dotN(vv, ww)
      const lv = dotN(vv, vv)
      const lw = dotN(ww, ww)
      return {
        prompt: `Find the angle between $${vector(vv)}$ and $${vector(ww)}$, in degrees.`,
        answer: { kind: 'number', value: pair.deg },
        hints: [
          '$\\cos\\theta = \\frac{\\mathbf{v} \\cdot \\mathbf{w}}{\\lVert \\mathbf{v} \\rVert \\, \\lVert \\mathbf{w} \\rVert}$.',
          `The dot product is $${d}$.`,
        ],
        solution: [
          `$\\mathbf{v} \\cdot \\mathbf{w} = ${d}$, $\\lVert \\mathbf{v} \\rVert = \\sqrt{${lv}}$, $\\lVert \\mathbf{w} \\rVert = \\sqrt{${lw}}$.`,
          `$\\cos\\theta = \\frac{${d}}{\\sqrt{${lv}}\\sqrt{${lw}}} = \\frac{${d}}{\\sqrt{${lv * lw}}}$, so $\\theta = ${pair.deg}^\\circ$.`,
        ],
        data: { ...flat('v', vv), ...flat('w', ww) },
      }
    },
  },
  {
    id: 'orthogonal-k',
    title: 'Make two vectors orthogonal',
    skills: ['dot-product'],
    difficulty: 2,
    generate: (rng) => {
      // v has the unknown k at position `at` and a ±1 at position `one`, so w can be chosen to
      // make the dot product vanish with a whole k.
      const k = rng.int(-5, 5)
      const at = rng.int(0, 2)
      const one = rng.pick([0, 1, 2].filter((i) => i !== at))
      const other = 3 - at - one
      const w = [0, 0, 0]
      w[at] = rng.nonZeroInt(-3, 3)
      w[other] = rng.int(-4, 4)
      const v = [0, 0, 0]
      v[at] = k
      v[other] = rng.int(-4, 4)
      v[one] = rng.pick([1, -1])
      // v · w = 0 fixes the remaining component of w.
      w[one] = -(v[at]! * w[at]! + v[other]! * w[other]!) * v[one]!
      const shown = v.map((x, i) => (i === at ? 'k' : num(x)))
      const rest = v[other]! * w[other]! + v[one]! * w[one]!
      return {
        prompt: `Find $k$ so that $(${shown.join(', ')})$ and $${vector(w)}$ are orthogonal.`,
        answer: { kind: 'number', value: k },
        hints: ['Orthogonal means the dot product is $0$.'],
        solution: [
          `The dot product is $${sum([[w[at]!, 'k']])}${rest === 0 ? '' : rest < 0 ? ` - ${-rest}` : ` + ${rest}`} = 0$.`,
          `So $k = ${k}$.`,
        ],
        data: { at, k, ...flat('v', v), ...flat('w', w) },
      }
    },
  },
  {
    id: 'projection',
    title: 'Project onto a vector',
    skills: ['dot-product'],
    difficulty: 3,
    generate: (rng) => {
      const n = rng.pick([2, 3])
      const v = intVector(rng, n, -3, 3)
      const w = intVector(rng, n, -4, 4)
      const vw = dotN(v, w)
      const vv = dotN(v, v)
      const p = scaleN(v, vw / vv)
      return {
        prompt: `Find the projection of $\\mathbf{w} = ${vector(w)}$ onto the line of $\\mathbf{v} = ${vector(v)}$: the multiple of $\\mathbf{v}$ that is its shadow.`,
        answer: { kind: 'vector', values: p },
        hints: [
          'The shadow is $\\frac{\\mathbf{v} \\cdot \\mathbf{w}}{\\mathbf{v} \\cdot \\mathbf{v}}\\,\\mathbf{v}$.',
          `$\\mathbf{v} \\cdot \\mathbf{w} = ${vw}$ and $\\mathbf{v} \\cdot \\mathbf{v} = ${vv}$.`,
        ],
        solution: [
          `$\\mathbf{v} \\cdot \\mathbf{w} = ${vw}$ and $\\mathbf{v} \\cdot \\mathbf{v} = ${vv}$.`,
          `The projection is $${frac(vw, vv)}${vector(v)} = ${vector(p, vv)}$.`,
        ],
        data: { ...flat('v', v), ...flat('w', w) },
      }
    },
  },
  {
    id: 'in-span',
    title: 'In the span or not',
    skills: ['span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      const [v, w] = independentPair(rng)
      const inSpan = rng.bool()
      const { u } = thirdVector(rng, v, w, inSpan)
      const rows = solvableRows(v, w)
      const { a, b } = solveTwoRows(v, w, u, rows)
      const k = 3 - rows[0] - rows[1]
      const reached = a * v[k]! + b * w[k]!
      const options = ['Yes', 'No']
      const name = (i: number) => ['first', 'second', 'third'][i]!
      return {
        prompt: `Is $\\mathbf{u} = ${vector(u)}$ in the span of $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${vector(w)}$?`,
        answer: { kind: 'choice', options, correct: inSpan ? 0 : 1 },
        hints: [
          'Look for weights with $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{u}$: one equation per component.',
          'Solve two of the equations, then check the third.',
        ],
        solution: [
          `The ${name(rows[0])} and ${name(rows[1])} components give $a = ${num(a, 400)}$ and $b = ${num(b, 400)}$.`,
          inSpan
            ? `The ${name(k)} component checks: $${num(a, 400)} \\cdot ${paren(v[k]!)} + ${paren(b)} \\cdot ${paren(w[k]!)} = ${u[k]}$. So $\\mathbf{u} = ${combo(a, b)}$ is in the span.`
            : `The ${name(k)} component would need $${num(reached, 400)} = ${u[k]}$, which fails. No weights work, so $\\mathbf{u}$ is not in the span.`,
        ],
        data: { inSpan: inSpan ? 1 : 0, ...flat('v', v), ...flat('w', w), ...flat('u', u) },
      }
    },
  },
  {
    id: 'independent',
    title: 'Independent or dependent',
    skills: ['span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      const options = ['Linearly independent', 'Linearly dependent']
      if (rng.int(1, 3) === 1) {
        // Two vectors: dependent exactly when one is a multiple of the other.
        const v = intVector(rng, 3, -3, 3)
        const dependent = rng.bool()
        const c = rng.pick([2, -2, 3, -1, -3])
        let w = scaleN(v, c)
        // Nudge one component until w is no longer parallel to v.
        while (!dependent && cross3(as3(v), as3(w)).every((x) => x === 0)) {
          const i = rng.int(0, 2)
          w = scaleN(v, c).map((x, j) => (j === i ? x + rng.pick([1, -1]) : x))
        }
        // Solve for the only possible multiple from a nonzero component, then find a component
        // that disagrees (cross-multiplied, so no rounding).
        const i = v.findIndex((x) => x !== 0)
        const [vi, wi] = [v[i]!, w[i]!]
        const j = w.findIndex((x, m) => x * vi !== wi * v[m]!)
        const [vj, wj] = [v[j]!, w[j]!]
        const k = wi / vi
        return {
          prompt: `Are $${vector(v)}$ and $${vector(w)}$ linearly independent or dependent?`,
          answer: { kind: 'choice', options, correct: dependent ? 1 : 0 },
          hints: ['Two vectors are dependent exactly when one is a multiple of the other.'],
          solution: dependent
            ? [`$${vector(w)} = ${c}${vector(v)}$, so they are dependent.`]
            : [
                `If $${vector(w)} = k${vector(v)}$, the ${ORDINAL[i]} component forces $k = ${frac(wi, vi)}$.`,
                `Then the ${ORDINAL[j]} component would be $${num(k)} \\cdot ${paren(vj)} = ${num(k * vj)}$, not $${wj}$. So the second vector is not a multiple of the first.`,
                'Nor is the first a multiple of the second: the first is not $\\mathbf{0}$, so the factor would be nonzero, and dividing by it would make the second a multiple of the first. They are independent.',
              ],
          data: { size: 2, dependent: dependent ? 1 : 0, ...flat('v', v), ...flat('w', w) },
        }
      }
      const [v, w] = independentPair(rng)
      const dependent = rng.bool()
      const { u, a, b } = thirdVector(rng, v, w, dependent)
      const rows = solvableRows(v, w)
      const solved = solveTwoRows(v, w, u, rows)
      const k = 3 - rows[0] - rows[1]
      return {
        prompt: `Are $\\mathbf{v} = ${vector(v)}$, $\\mathbf{w} = ${vector(w)}$ and $\\mathbf{u} = ${vector(u)}$ linearly independent or dependent?`,
        answer: { kind: 'choice', options, correct: dependent ? 1 : 0 },
        hints: [
          '$\\mathbf{v}$ and $\\mathbf{w}$ are not parallel. The set is dependent exactly when $\\mathbf{u}$ is a combination of them.',
          'Solve $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{u}$ with two components and check the third.',
        ],
        solution: dependent
          ? [
              `$\\mathbf{u} = ${combo(a, b)}$, which checks in every component.`,
              `So $${combo(a, b)} - \\mathbf{u} = \\mathbf{0}$ with weights not all zero: dependent.`,
            ]
          : [
              `Two components give $a = ${num(solved.a, 400)}$, $b = ${num(solved.b, 400)}$, but then component ${k + 1} would be $${num(solved.a * v[k]! + solved.b * w[k]!, 400)} \\ne ${u[k]}$.`,
              '$\\mathbf{u}$ is not in the span of $\\mathbf{v}$ and $\\mathbf{w}$, and those two are not parallel, so the three are independent.',
            ],
        data: {
          size: 3,
          dependent: dependent ? 1 : 0,
          ...flat('v', v),
          ...flat('w', w),
          ...flat('u', u),
        },
      }
    },
  },
  {
    id: 'plane-equation',
    title: 'Equation of a plane',
    skills: ['lines-and-planes'],
    difficulty: 1,
    generate: (rng) => {
      const n = intVector(rng, 3, -4, 4)
      const p = Array.from({ length: 3 }, () => rng.int(-4, 4))
      const d = dotN(n, p)
      const lhs = sum([
        [n[0]!, 'x'],
        [n[1]!, 'y'],
        [n[2]!, 'z'],
      ])
      return {
        prompt: `The plane through $${vector(p)}$ with normal vector $${vector(n)}$ has the equation $${lhs} = d$. Find $d$.`,
        answer: { kind: 'number', value: d },
        hints: ['The point must satisfy the equation, so $d = \\mathbf{n} \\cdot \\mathbf{p}$.'],
        solution: [`$d = ${products(n, p)} = ${d}$.`],
        data: { ...flat('n', n), ...flat('p', p) },
      }
    },
  },
  {
    id: 'line-meets-plane',
    title: 'Where a line meets a plane',
    skills: ['lines-and-planes'],
    difficulty: 3,
    generate: (rng) => {
      const n = intVector(rng, 3, -3, 3)
      let v: number[]
      do v = intVector(rng, 3, -3, 3)
      while (dotN(n, v) === 0)
      const p = Array.from({ length: 3 }, () => rng.int(-3, 3))
      const t = rng.nonZeroInt(-3, 3)
      const q = addN(p, scaleN(v, t))
      const d = dotN(n, q)
      const lhs = sum([
        [n[0]!, 'x'],
        [n[1]!, 'y'],
        [n[2]!, 'z'],
      ])
      const np = dotN(n, p)
      const nv = dotN(n, v)
      return {
        prompt: `Find the point where the line $${vector(p)} + t${vector(v)}$ meets the plane $${lhs} = ${d}$.`,
        answer: { kind: 'vector', values: q },
        hints: [
          'Put the components of $\\mathbf{p} + t\\mathbf{v}$ into the equation and solve for $t$.',
          `$\\mathbf{n} \\cdot \\mathbf{p} + t\\,(\\mathbf{n} \\cdot \\mathbf{v}) = ${d}$, with $\\mathbf{n} = ${vector(n)}$.`,
        ],
        solution: [
          `Substituting gives $${np}${nv < 0 ? ' - ' : ' + '}${Math.abs(nv) === 1 ? '' : Math.abs(nv)}t = ${d}$, so $t = ${t}$.`,
          `The point is $${vector(p)} + ${paren(t)}${vector(v)} = ${vector(q)}$.`,
        ],
        data: { t, d, ...flat('n', n), ...flat('v', v), ...flat('p', p) },
      }
    },
  },
])
