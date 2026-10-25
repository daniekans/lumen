import { addN, cross3, dotN, scaleN, type Vec3 } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, num, paren, signed, sum, vector } = tex

const ORDINAL = ['first', 'second', 'third']

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

/** A combination a v + b w with small nonzero weights. */
const thirdVector = (rng: Rng, v: Vec3, w: Vec3) => {
  const a = rng.nonZeroInt(-2, 2)
  const b = rng.nonZeroInt(-2, 2)
  return { u: addN(scaleN(v, a), scaleN(w, b)), a, b }
}

const combo = (a: number, b: number) =>
  sum([
    [a, '\\mathbf{v}'],
    [b, '\\mathbf{w}'],
  ])

/** The equation of component i in a v + b w = u, with the weight names given. */
const weightEquation = (
  v: readonly number[],
  w: readonly number[],
  u: readonly number[],
  i: number,
  [a, b] = ['a', 'b'],
) =>
  `${sum([
    [v[i]!, a],
    [w[i]!, b],
  ])} = ${u[i]}`

const planeLhs = (n: readonly number[]) =>
  sum([
    [n[0]!, 'x'],
    [n[1]!, 'y'],
    [n[2]!, 'z'],
  ])

/**
 * Two directions of the plane with normal n, not parallel, with small whole components. n[j]
 * must be 1 or -1, so the component j that makes a direction orthogonal to n is whole.
 */
const planeDirections = (rng: Rng, n: readonly number[], j: number) => {
  const direction = () => {
    const x = Array.from({ length: 3 }, () => rng.int(-2, 2))
    x[j] = 0
    x[j] = -dotN(n, x) * n[j]!
    return x
  }
  for (;;) {
    const v = direction()
    const w = direction()
    if (cross3(as3(v), as3(w)).some((x) => x !== 0)) return { v, w }
  }
}

/** Short proofs from the unit: statement, hints and a worked proof. */
const PROOFS: readonly { prompt: string; hints: string[]; solution: string[] }[] = [
  {
    prompt:
      'Let $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$ be nonzero vectors with $\\mathbf{v}_i \\cdot \\mathbf{v}_j = 0$ whenever $i \\ne j$. Prove that they are linearly independent.',
    hints: [
      'Start from $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ and take the dot product of both sides with one $\\mathbf{v}_i$.',
    ],
    solution: [
      'Suppose $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$, and take the dot product of both sides with $\\mathbf{v}_i$.',
      'Every term $c_j\\,(\\mathbf{v}_j \\cdot \\mathbf{v}_i)$ with $j \\ne i$ is $0$, and $\\mathbf{0} \\cdot \\mathbf{v}_i = 0$, so $c_i\\,(\\mathbf{v}_i \\cdot \\mathbf{v}_i) = 0$.',
      '$\\mathbf{v}_i \\cdot \\mathbf{v}_i = \\lVert \\mathbf{v}_i \\rVert^2 > 0$ because $\\mathbf{v}_i \\ne \\mathbf{0}$, so $c_i = 0$.',
      'This holds for every $i$, so only the trivial combination gives $\\mathbf{0}$: the vectors are independent. Without "nonzero" it fails: $\\mathbf{0}$ is orthogonal to everything, and any set containing it is dependent.',
    ],
  },
  {
    prompt:
      'Let $\\mathbf{u} \\cdot \\mathbf{v}_i = 0$ for each of $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$. Prove that $\\mathbf{u}$ is orthogonal to every vector in $\\operatorname{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$.',
    hints: [
      'A vector of the span is $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k$. Which rules of the dot product let you split $\\mathbf{u} \\cdot (\\ldots)$?',
    ],
    solution: [
      'Let $\\mathbf{x}$ be in the span: $\\mathbf{x} = c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k$ for some weights.',
      'The dot product distributes over sums and lets numbers move out: $\\mathbf{u} \\cdot \\mathbf{x} = c_1\\,(\\mathbf{u} \\cdot \\mathbf{v}_1) + \\cdots + c_k\\,(\\mathbf{u} \\cdot \\mathbf{v}_k)$.',
      'Every $\\mathbf{u} \\cdot \\mathbf{v}_i$ is $0$, so $\\mathbf{u} \\cdot \\mathbf{x} = 0$. This is why a normal vector checked against two directions is orthogonal to the whole plane.',
    ],
  },
  {
    prompt:
      'Prove that $\\lVert \\mathbf{v} + \\mathbf{w} \\rVert^2 = \\lVert \\mathbf{v} \\rVert^2 + \\lVert \\mathbf{w} \\rVert^2$ exactly when $\\mathbf{v} \\cdot \\mathbf{w} = 0$.',
    hints: [
      'Write $\\lVert \\mathbf{v} + \\mathbf{w} \\rVert^2$ as $(\\mathbf{v} + \\mathbf{w}) \\cdot (\\mathbf{v} + \\mathbf{w})$ and expand.',
    ],
    solution: [
      '$\\lVert \\mathbf{v} + \\mathbf{w} \\rVert^2 = (\\mathbf{v} + \\mathbf{w}) \\cdot (\\mathbf{v} + \\mathbf{w}) = \\mathbf{v} \\cdot \\mathbf{v} + 2\\,\\mathbf{v} \\cdot \\mathbf{w} + \\mathbf{w} \\cdot \\mathbf{w}$, using that the dot product distributes and is symmetric.',
      'So $\\lVert \\mathbf{v} + \\mathbf{w} \\rVert^2 = \\lVert \\mathbf{v} \\rVert^2 + \\lVert \\mathbf{w} \\rVert^2 + 2\\,\\mathbf{v} \\cdot \\mathbf{w}$.',
      'The two sides of the claim differ by exactly $2\\,\\mathbf{v} \\cdot \\mathbf{w}$, so they are equal exactly when $\\mathbf{v} \\cdot \\mathbf{w} = 0$. That proves both directions at once.',
    ],
  },
  {
    prompt:
      'Let $\\mathbf{x}$ and $\\mathbf{y}$ be in $\\operatorname{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ and let $c$ be a number. Prove that $\\mathbf{x} + \\mathbf{y}$ and $c\\,\\mathbf{x}$ are in the span too.',
    hints: [
      'Write $\\mathbf{x}$ and $\\mathbf{y}$ as combinations with their own weights, then regroup.',
    ],
    solution: [
      'Write $\\mathbf{x} = a_1\\mathbf{v}_1 + \\cdots + a_k\\mathbf{v}_k$ and $\\mathbf{y} = b_1\\mathbf{v}_1 + \\cdots + b_k\\mathbf{v}_k$.',
      'Regrouping with the rules of vector algebra, $\\mathbf{x} + \\mathbf{y} = (a_1 + b_1)\\mathbf{v}_1 + \\cdots + (a_k + b_k)\\mathbf{v}_k$, a combination of the $\\mathbf{v}_i$.',
      'Likewise $c\\,\\mathbf{x} = (c a_1)\\mathbf{v}_1 + \\cdots + (c a_k)\\mathbf{v}_k$. Both are in the span: it is closed under addition and scaling, and taking $c = 0$ shows it contains $\\mathbf{0}$.',
    ],
  },
]

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
    id: 'span-weights',
    title: 'Weights for a vector in a span',
    skills: ['span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      const [v, w] = independentPair(rng)
      const { u, a, b } = thirdVector(rng, v, w)
      const rows = solvableRows(v, w)
      const k = 3 - rows[0] - rows[1]
      return {
        prompt: `$\\mathbf{u} = ${vector(u)}$ is in the span of $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${vector(w)}$. Find the weights $(a, b)$ with $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{u}$.`,
        answer: { kind: 'vector', values: [a, b] },
        hints: [
          'Write $a\\mathbf{v} + b\\mathbf{w} = \\mathbf{u}$ as one equation per component.',
          'Solve two of the equations, then check the third.',
        ],
        solution: [
          `The ${ORDINAL[rows[0]]} and ${ORDINAL[rows[1]]} components give $${weightEquation(v, w, u, rows[0])}$ and $${weightEquation(v, w, u, rows[1])}$, so $a = ${a}$ and $b = ${b}$.`,
          `The ${ORDINAL[k]} component checks: $${paren(a)} \\cdot ${paren(v[k]!)} + ${paren(b)} \\cdot ${paren(w[k]!)} = ${u[k]}$. The weights are the only ones, since $\\mathbf{v}$ and $\\mathbf{w}$ are not parallel.`,
        ],
        data: { ...flat('v', v), ...flat('w', w), ...flat('u', u) },
      }
    },
  },
  {
    id: 'dependence',
    title: 'A dependence relation',
    skills: ['span-and-independence'],
    difficulty: 2,
    generate: (rng) => {
      if (rng.int(1, 3) === 1) {
        // Two vectors: dependent exactly when the second is a multiple of the first.
        let v: number[]
        do v = intVector(rng, 3, -3, 3)
        while (v.filter((x) => x !== 0).length < 2)
        const c = rng.pick([2, -2, 3, -1, -3])
        const w = scaleN(v, c)
        const at = rng.int(0, 2)
        // A nonzero component of v other than the unknown one fixes the multiple.
        const m = v.findIndex((x, i) => i !== at && x !== 0)
        const shown = w.map((x, i) => (i === at ? 'k' : num(x)))
        return {
          prompt: `Find $k$ so that $${vector(v)}$ and $(${shown.join(', ')})$ are linearly dependent.`,
          answer: { kind: 'number', value: w[at]! },
          hints: [
            'Two vectors, the first not $\\mathbf{0}$, are dependent exactly when the second is a multiple of the first.',
            `The ${ORDINAL[m]} components fix the multiple.`,
          ],
          solution: [
            `The ${ORDINAL[m]} components give the multiple: $${w[m]} = ${paren(c)} \\cdot ${paren(v[m]!)}$, so the second vector must be $${c}${vector(v)} = ${vector(w)}$.`,
            `So $k = ${paren(c)} \\cdot ${paren(v[at]!)} = ${w[at]}$. For any other $k$ the two are not parallel and are independent.`,
          ],
          data: { size: 2, at, ...flat('v', v), ...flat('w', w) },
        }
      }
      const [v, w] = independentPair(rng)
      const { u, a, b } = thirdVector(rng, v, w)
      const rows = solvableRows(v, w)
      return {
        prompt: `$\\mathbf{v} = ${vector(v)}$, $\\mathbf{w} = ${vector(w)}$ and $\\mathbf{u} = ${vector(u)}$ are linearly dependent. Find the weights $(a, b)$ in the dependence relation $a\\mathbf{v} + b\\mathbf{w} + \\mathbf{u} = \\mathbf{0}$.`,
        answer: { kind: 'vector', values: [-a, -b] },
        hints: [
          'The relation says $\\mathbf{u} = -a\\mathbf{v} - b\\mathbf{w}$: find the weights that build $\\mathbf{u}$ first.',
          'One equation per component: solve two, check the third.',
        ],
        solution: [
          `With $\\mathbf{u} = p\\mathbf{v} + q\\mathbf{w}$, the ${ORDINAL[rows[0]]} and ${ORDINAL[rows[1]]} components give $${weightEquation(v, w, u, rows[0], ['p', 'q'])}$ and $${weightEquation(v, w, u, rows[1], ['p', 'q'])}$, so $p = ${a}$ and $q = ${b}$. The ${ORDINAL[3 - rows[0] - rows[1]]} component checks.`,
          `So $\\mathbf{u} = ${combo(a, b)}$, and moving it across gives $${combo(-a, -b)} + \\mathbf{u} = \\mathbf{0}$: $(a, b) = (${-a}, ${-b})$.`,
          'The weight of $\\mathbf{u}$ is $1$, not $0$, so the relation is not the trivial one. Every multiple of it is a relation too; fixing that weight at $1$ makes the answer unique.',
        ],
        data: { size: 3, ...flat('v', v), ...flat('w', w), ...flat('u', u) },
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
  {
    id: 'plane-normal',
    title: 'From parametric to normal form',
    skills: ['lines-and-planes'],
    difficulty: 3,
    generate: (rng) => {
      const j = rng.int(0, 2)
      const n = Array.from({ length: 3 }, () => rng.int(-3, 3))
      n[j] = 1
      const { v, w } = planeDirections(rng, n, j)
      const p = Array.from({ length: 3 }, () => rng.int(-3, 3))
      const d = dotN(n, p)
      const names = ['a', 'b', 'c']
      // n · x = 0 with the fixed component known: two unknowns left.
      const orthogonal = (x: readonly number[]) =>
        `${sum([...[0, 1, 2].filter((i) => i !== j).map((i) => [x[i]!, names[i]!] as [number, string]), [x[j]!, '']])} = 0`
      return {
        prompt: `Write the plane $${vector(p)} + s${vector(v)} + t${vector(w)}$ in normal form $ax + by + cz = d$ with $${names[j]} = 1$. Type $(a, b, c, d)$.`,
        answer: { kind: 'vector', values: [...n, d] },
        hints: [
          'The normal $(a, b, c)$ is orthogonal to both directions: its dot product with each is $0$.',
          `With $${names[j]} = 1$ that is two equations in the other two unknowns. Then $d = \\mathbf{n} \\cdot \\mathbf{p}$, since the point is on the plane.`,
        ],
        solution: [
          `Orthogonal to both directions: $${orthogonal(v)}$ and $${orthogonal(w)}$.`,
          `Solving gives $\\mathbf{n} = ${vector(n)}$. The directions are not parallel, so the normals form one line, and $${names[j]} = 1$ picks one point of it.`,
          `$d = ${products(n, p)} = ${d}$. The plane is $${planeLhs(n)} = ${d}$.`,
        ],
        data: { j, d, ...flat('n', n), ...flat('v', v), ...flat('w', w), ...flat('p', p) },
      }
    },
  },
  {
    id: 'normal-to-parametric',
    title: 'From normal to parametric form',
    skills: ['lines-and-planes'],
    difficulty: 2,
    generate: (rng) => {
      const j = rng.int(0, 2)
      const n = intVector(rng, 3, -3, 3)
      n[j] = rng.pick([1, -1])
      const { v, w } = planeDirections(rng, n, j)
      const p = Array.from({ length: 3 }, () => rng.int(-3, 3))
      const d = dotN(n, p)
      const inPoint = rng.bool()
      const at = rng.pick([0, 1, 2].filter((i) => n[i] !== 0))
      const hidden = inPoint ? p : w
      const k = hidden[at]!
      const shown = (x: readonly number[]) =>
        x === hidden ? `(${x.map((c, i) => (i === at ? 'k' : num(c))).join(', ')})` : vector(x)
      const rest = dotN(n, hidden) - n[at]! * k
      return {
        prompt: `The plane $${planeLhs(n)} = ${d}$ is also $\\mathbf{p} + s\\mathbf{v} + t\\mathbf{w}$ with $\\mathbf{p} = ${shown(p)}$, $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${shown(w)}$. Find $k$.`,
        answer: { kind: 'number', value: k },
        hints: [
          inPoint
            ? 'The point $\\mathbf{p}$ is on the plane, so its components satisfy the equation.'
            : 'A direction of the plane is orthogonal to its normal: $\\mathbf{n} \\cdot \\mathbf{w} = 0$.',
          `The normal is $${vector(n)}$, read from the coefficients.`,
        ],
        solution: [
          inPoint
            ? `Substituting $\\mathbf{p}$: $${sum([[n[at]!, 'k']])}${signed(rest)} = ${d}$, so $k = ${k}$.`
            : `$\\mathbf{n} \\cdot \\mathbf{w} = ${sum([[n[at]!, 'k']])}${signed(rest)} = 0$, so $k = ${k}$.`,
          `The rest checks: ${inPoint ? '$\\mathbf{n} \\cdot \\mathbf{v} = 0$ and $\\mathbf{n} \\cdot \\mathbf{w} = 0$' : `$\\mathbf{n} \\cdot \\mathbf{v} = 0$ and $\\mathbf{n} \\cdot \\mathbf{p} = ${d}$`}, and $\\mathbf{v}$, $\\mathbf{w}$ are not parallel.`,
        ],
        data: {
          at,
          d,
          inPoint: inPoint ? 1 : 0,
          ...flat('n', n),
          ...flat('v', v),
          ...flat('w', w),
          ...flat('p', p),
        },
      }
    },
  },
  {
    id: 'feature-vectors',
    title: 'Distance and cosine in more dimensions',
    skills: ['dot-product'],
    difficulty: 2,
    generate: (rng) => {
      if (rng.bool()) {
        // Word counts of two documents over five words: the cosine ignores document length.
        const x = intVector(rng, 5, 0, 4)
        const y = intVector(rng, 5, 0, 4)
        const xy = dotN(x, y)
        const xx = dotN(x, x)
        const yy = dotN(y, y)
        const value = xy / Math.sqrt(xx * yy)
        return {
          prompt: `Two short documents are counted over the same five words, giving $\\mathbf{x} = ${vector(x)}$ and $\\mathbf{y} = ${vector(y)}$ in $\\mathbb{R}^5$. Find their cosine similarity $\\cos\\theta$, exactly or to two decimals.`,
          answer: { kind: 'number', value, tolerance: 0.005 },
          hints: [
            '$\\cos\\theta = \\frac{\\mathbf{x} \\cdot \\mathbf{y}}{\\lVert \\mathbf{x} \\rVert \\, \\lVert \\mathbf{y} \\rVert}$, with five products instead of two or three.',
          ],
          solution: [
            `$\\mathbf{x} \\cdot \\mathbf{y} = ${xy}$, $\\lVert \\mathbf{x} \\rVert = \\sqrt{${xx}}$, $\\lVert \\mathbf{y} \\rVert = \\sqrt{${yy}}$.`,
            `$\\cos\\theta = \\frac{${xy}}{\\sqrt{${xx * yy}}} \\approx ${+value.toFixed(3)}$. Doubling every count of one document leaves this unchanged: only the direction counts, which is why search compares documents this way.`,
          ],
          data: { cosine: 1, ...flat('x', x), ...flat('y', y) },
        }
      }
      // Two houses after standardization: size, age, rooms and distance to the center, each in
      // standard deviations from the mean.
      const half = () => rng.int(-4, 4) / 2
      const x = Array.from({ length: 4 }, half)
      let y: number[]
      do y = Array.from({ length: 4 }, half)
      while (y.every((c, i) => c === x[i]))
      const diff = y.map((c, i) => c - x[i]!)
      const squares = dotN(diff, diff)
      const value = Math.sqrt(squares)
      return {
        prompt: `Two houses are described by size, age, number of rooms and distance to the center, each standardized (in standard deviations from the mean): $\\mathbf{x} = ${vector(x)}$ and $\\mathbf{y} = ${vector(y)}$ in $\\mathbb{R}^4$. Find the distance between them, exactly or to two decimals.`,
        answer: { kind: 'number', value, tolerance: 0.005 },
        hints: [
          'The distance is $\\lVert \\mathbf{y} - \\mathbf{x} \\rVert$: subtract, square each component, add, take the square root.',
        ],
        solution: [
          `$\\mathbf{y} - \\mathbf{x} = ${vector(diff)}$.`,
          `The squares add up to $${num(squares)}$, so the distance is $\\sqrt{${num(squares)}} \\approx ${+value.toFixed(3)}$. Standardizing first keeps one feature in large units, such as square meters, from deciding the distance alone.`,
        ],
        data: { cosine: 0, ...flat('x', x), ...flat('y', y) },
      }
    },
  },
  {
    id: 'proof-short',
    title: 'A short proof',
    skills: ['dot-product', 'span-and-independence'],
    difficulty: 3,
    generate: (rng) => {
      const which = rng.int(0, PROOFS.length - 1)
      return { ...PROOFS[which]!, answer: { kind: 'self' }, data: { which } }
    },
  },
])
