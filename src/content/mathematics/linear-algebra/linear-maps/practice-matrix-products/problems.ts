import { matMul, matPow, transpose, type MatN } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { bmatrix, cleanMatrix, num, paren, trig, trigMatrix, vector } = tex

/** Entries flattened into problem data: { A0_0: 2, A0_1: -1, ... }, with the shape. */
const flatMat = (name: string, a: MatN) => ({
  [`${name}m`]: a.length,
  [`${name}n`]: a[0]!.length,
  ...Object.fromEntries(a.flatMap((row, i) => row.map((v, j) => [`${name}${i}_${j}`, v]))),
})

const intMatrix = (rng: Rng, m: number, n: number, lo: number, hi: number) =>
  Array.from({ length: m }, () => Array.from({ length: n }, () => rng.int(lo, hi)))

/** Row i of a dotted with column j of b, written out: 2 \cdot 3 + (-1) \cdot 2. */
const rowCol = (a: MatN, b: MatN, i: number, j: number) =>
  a[i]!.map((v, k) => `${paren(v)} \\cdot ${paren(b[k]![j]!)}`).join(' + ')

const productSolution = (a: MatN, b: MatN, c: MatN) => [
  `$AB$ is $${a.length} \\times ${b[0]!.length}$: entry $(i, j)$ is row $i$ of $A$ dotted with column $j$ of $B$.`,
  ...c.map(
    (row, i) =>
      `Row ${i + 1}: ${row.map((v, j) => `$${rowCol(a, b, i, j)} = ${num(v)}$`).join(', ')}.`,
  ),
  `So $AB = ${bmatrix(c)}$.`,
]

/** Maps of the plane described in words, with whole-number matrices. */
const DESCRIBED: readonly { words: string; m: number[][] }[] = [
  {
    words: 'rotate by $90^\\circ$ counterclockwise',
    m: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    words: 'rotate by $90^\\circ$ clockwise',
    m: [
      [0, 1],
      [-1, 0],
    ],
  },
  {
    words: 'rotate by $180^\\circ$',
    m: [
      [-1, 0],
      [0, -1],
    ],
  },
  {
    words: 'reflect across the $x$-axis',
    m: [
      [1, 0],
      [0, -1],
    ],
  },
  {
    words: 'reflect across the $y$-axis',
    m: [
      [-1, 0],
      [0, 1],
    ],
  },
  {
    words: 'reflect across the line $y = x$',
    m: [
      [0, 1],
      [1, 0],
    ],
  },
  {
    words: 'project onto the $x$-axis',
    m: [
      [1, 0],
      [0, 0],
    ],
  },
  {
    words: 'stretch horizontally by $2$',
    m: [
      [2, 0],
      [0, 1],
    ],
  },
  {
    words: 'shear, sending $\\hat{\\jmath}$ to $(1, 1)$ and keeping $\\hat{\\imath}$',
    m: [
      [1, 1],
      [0, 1],
    ],
  },
]

const rotationRows = (deg: number) => {
  const t = (deg * Math.PI) / 180
  const [c, s] = [Math.cos(t), Math.sin(t)]
  return [
    [c, -s],
    [s, c],
  ]
}

const clean = cleanMatrix

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

const PRODUCTS = ['apples', 'cheese', 'rice'] as const
const MEASURES = ['price', 'kg'] as const

export const problems = defineProblems([
  {
    id: 'product-2d',
    title: 'A product of two 2 by 2 matrices',
    skills: ['matrix-multiplication'],
    difficulty: 1,
    generate: (rng) => {
      const a = intMatrix(rng, 2, 2, -3, 3)
      const b = intMatrix(rng, 2, 2, -3, 3)
      const c = matMul(a, b)
      return {
        prompt: `Compute $AB$ for $A = ${bmatrix(a)}$ and $B = ${bmatrix(b)}$.`,
        answer: { kind: 'matrix', rows: c },
        hints: [
          'Column $j$ of $AB$ is $A$ times column $j$ of $B$.',
          'Entry $(i, j)$ is row $i$ of $A$ dotted with column $j$ of $B$.',
        ],
        solution: productSolution(a, b, c),
        data: { ...flatMat('A', a), ...flatMat('B', b) },
      }
    },
  },
  {
    id: 'product-rect',
    title: 'A product of matrices that are not square',
    skills: ['matrix-multiplication'],
    difficulty: 2,
    generate: (rng) => {
      const [m, n, p] = rng.pick([
        [2, 3, 2],
        [3, 2, 3],
        [2, 2, 3],
        [3, 2, 2],
        [2, 3, 1],
        [1, 3, 2],
        [3, 1, 2],
      ] as const)
      const a = intMatrix(rng, m, n, -3, 3)
      const b = intMatrix(rng, n, p, -3, 3)
      const c = matMul(a, b)
      return {
        prompt: `Compute $AB$ for $A = ${bmatrix(a)}$ and $B = ${bmatrix(b)}$.`,
        answer: { kind: 'matrix', rows: c },
        hints: [
          `$A$ is $${m} \\times ${n}$ and $B$ is $${n} \\times ${p}$, so $AB$ is $${m} \\times ${p}$.`,
          'Entry $(i, j)$ is row $i$ of $A$ dotted with column $j$ of $B$.',
        ],
        solution: productSolution(a, b, c),
        data: { ...flatMat('A', a), ...flatMat('B', b) },
      }
    },
  },
  {
    id: 'product-entry',
    title: 'One entry of a product',
    skills: ['matrix-multiplication'],
    difficulty: 1,
    generate: (rng) => {
      const a = intMatrix(rng, 3, 3, -4, 4)
      const b = intMatrix(rng, 3, 3, -4, 4)
      const i = rng.int(0, 2)
      const j = rng.int(0, 2)
      const v = matMul(a, b)[i]![j]!
      return {
        prompt: `$A = ${bmatrix(a)}$ and $B = ${bmatrix(b)}$. Find entry $(${i + 1}, ${j + 1})$ of $AB$ (row $${i + 1}$, column $${j + 1}$).`,
        answer: { kind: 'number', value: v },
        hints: [`Only row $${i + 1}$ of $A$ and column $${j + 1}$ of $B$ are needed.`],
        solution: [
          `Row $${i + 1}$ of $A$ is $${vector(a[i]!)}$ and column $${j + 1}$ of $B$ is $${vector(b.map((r) => r[j]!))}$.`,
          `Their dot product: $${rowCol(a, b, i, j)} = ${v}$.`,
        ],
        data: { i, j, ...flatMat('A', a), ...flatMat('B', b) },
      }
    },
  },
  {
    id: 'shape',
    title: 'The shape of a product',
    skills: ['matrix-multiplication'],
    difficulty: 1,
    generate: (rng) => {
      const m = rng.int(1, 5)
      let p = rng.int(1, 5)
      if (p === m) p = m === 5 ? 4 : m + 1
      const n = rng.int(1, 5)
      const defined = rng.int(0, 2) > 0
      const q = defined ? n : rng.pick([1, 2, 3, 4, 5].filter((v) => v !== n))
      const options = [`$${m} \\times ${p}$`, `$${p} \\times ${m}$`, '$AB$ is not defined']
      return {
        prompt: `$A$ is a $${m} \\times ${n}$ matrix and $B$ is a $${q} \\times ${p}$ matrix. What is the shape of $AB$?`,
        answer: { kind: 'choice', options, correct: defined ? 0 : 2 },
        hints: ['$(m \\times n)(n \\times p) = m \\times p$: the inner sizes must agree.'],
        solution: defined
          ? [
              `The inner sizes agree ($${n}$ and $${q}$), so $AB$ is defined.`,
              `It has the rows of $A$ and the columns of $B$: $${m} \\times ${p}$.`,
            ]
          : [
              `A row of $A$ has $${n}$ entries and a column of $B$ has $${q}$, so they cannot be dotted: $AB$ is not defined.`,
            ],
        data: { m, n, q, p },
      }
    },
  },
  {
    id: 'rotation-power',
    title: 'Powers of a rotation',
    skills: ['matrix-multiplication', 'standard-maps'],
    difficulty: 2,
    generate: (rng) => {
      const variant = rng.int(0, 2)
      if (variant === 0) {
        const deg = rng.pick([30, 36, 40, 45, 60, 72, 90, 120])
        const k = 360 / gcd(deg, 360)
        return {
          prompt: `$R$ is the rotation by $${deg}^\\circ$. What is the smallest $k \\ge 1$ with $R^k = I$?`,
          answer: { kind: 'number', value: k },
          hints: ['$R^k$ rotates by $k$ times the angle. When is that a whole number of turns?'],
          solution: [
            `$R^k$ rotates by $${deg}k$ degrees, which is a multiple of $360$ first at $k = ${k}$.`,
          ],
          data: { variant, deg, k: 0 },
        }
      }
      if (variant === 1) {
        const deg = rng.pick([30, 45, 60, 90, 120])
        const k = rng.int(5, 20)
        const angle = (deg * k) % 360
        return {
          prompt: `$R$ is the rotation by $${deg}^\\circ$. $R^{${k}}$ is the rotation by which angle, in degrees from $0$ up to (not including) $360$?`,
          answer: { kind: 'number', value: angle },
          hints: ['Applying $R$ $k$ times adds the angle $k$ times. Remove full turns.'],
          solution: [
            `$R^{${k}}$ rotates by $${k} \\cdot ${deg} = ${k * deg}$ degrees, and $${k * deg} - ${360 * Math.floor((k * deg) / 360)} = ${angle}$.`,
          ],
          data: { variant, deg, k },
        }
      }
      const deg = rng.pick([90, 180, 270])
      const k = rng.int(2, 7)
      const r = clean(rotationRows(deg))
      const rk = clean(matPow(r, k))
      return {
        prompt: `$R = ${bmatrix(r)}$. Compute $R^{${k}}$.`,
        answer: { kind: 'matrix', rows: rk },
        hints: [
          `$R$ is the rotation by $${deg}^\\circ$, so $R^{${k}}$ rotates by $${k * deg}^\\circ$.`,
          'Remove full turns, then read where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land.',
        ],
        solution: [
          `$R^{${k}}$ rotates by $${k * deg}^\\circ$, the same as $${(k * deg) % 360}^\\circ$.`,
          `Its columns are where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land: $R^{${k}} = ${bmatrix(rk)}$.`,
        ],
        data: { variant, deg, k, ...flatMat('R', r) },
      }
    },
  },
  {
    id: 'compose-described',
    title: 'The matrix of one map after another',
    skills: ['matrix-multiplication', 'standard-maps'],
    difficulty: 2,
    generate: (rng) => {
      const f = rng.int(0, DESCRIBED.length - 1)
      let g = rng.int(0, DESCRIBED.length - 2)
      if (g >= f) g++
      const F = DESCRIBED[f]!
      const G = DESCRIBED[g]!
      const c = matMul(G.m, F.m)
      return {
        prompt: `First ${F.words}, then ${G.words}. Write the matrix of the combined map.`,
        answer: { kind: 'matrix', rows: c },
        hints: [
          'Write the matrix of each map from where $\\hat{\\imath}$ and $\\hat{\\jmath}$ land.',
          'The map applied first goes on the right: the product is (second)(first).',
        ],
        solution: [
          `First: $F = ${bmatrix(F.m)}$. Then: $G = ${bmatrix(G.m)}$.`,
          `The combined map is $GF = ${bmatrix(G.m)}${bmatrix(F.m)} = ${bmatrix(c)}$.`,
          'Check: its columns are where $\\hat{\\imath}$ and $\\hat{\\jmath}$ end up after both maps.',
        ],
        data: { f, g },
      }
    },
  },
  {
    id: 'standard-map',
    title: 'The matrix of a standard map',
    skills: ['standard-maps'],
    difficulty: 2,
    generate: (rng) => {
      const kind = rng.int(0, 4)
      if (kind === 0) {
        const deg = rng.pick([30, 45, 60, 120, 135, 150, -30, -45, -60, -90])
        const r = clean(rotationRows(deg))
        const words = deg > 0 ? `$${deg}^\\circ$ counterclockwise` : `$${-deg}^\\circ$ clockwise`
        return {
          prompt: `Write the matrix of the rotation by ${words}. Exact values such as $\\frac{\\sqrt{3}}{2}$ can be typed as they are.`,
          answer: { kind: 'matrix', rows: r, tolerance: 1e-6 },
          hints: [
            'The columns are $(\\cos\\theta, \\sin\\theta)$ and $(-\\sin\\theta, \\cos\\theta)$.',
            deg < 0
              ? 'Clockwise means $\\theta$ is negative.'
              : 'Use the values on the unit circle.',
          ],
          solution: [
            `$\\theta = ${deg}^\\circ$, so $\\cos\\theta = ${trig(r[0]![0]!)}$ and $\\sin\\theta = ${trig(r[1]![0]!)}$.`,
            `$R_\\theta = ${trigMatrix(r)}$.`,
          ],
          data: { kind, deg, a: 0, b: 0 },
        }
      }
      if (kind === 1 || kind === 2) {
        // Projection onto (kind 1), or reflection across (kind 2), the line along (a, b).
        const [a, b] = rng.pick([
          [1, 1],
          [1, -1],
          [1, 2],
          [2, 1],
          [1, 3],
          [3, 1],
          [2, -1],
          [1, -2],
        ] as const)
        const d = a * a + b * b
        const P = [
          [(a * a) / d, (a * b) / d],
          [(a * b) / d, (b * b) / d],
        ]
        const rows =
          kind === 1 ? P : P.map((row, i) => row.map((v, j) => 2 * v - (i === j ? 1 : 0)))
        const line = `the line through the origin along $${vector([a, b])}$`
        return {
          prompt:
            kind === 1
              ? `Write the matrix of the orthogonal projection onto ${line}.`
              : `Write the matrix of the reflection across ${line}.`,
          answer: { kind: 'matrix', rows },
          hints:
            kind === 1
              ? [
                  '$P\\mathbf{x} = \\frac{\\mathbf{u} \\cdot \\mathbf{x}}{\\mathbf{u} \\cdot \\mathbf{u}}\\,\\mathbf{u}$. Apply it to $\\hat{\\imath}$ and $\\hat{\\jmath}$.',
                ]
              : [
                  'A point and its mirror image have the projection $P\\mathbf{x}$ as their midpoint, so $F\\mathbf{x} = 2P\\mathbf{x} - \\mathbf{x}$.',
                  'Find $P$ first, then $F = 2P - I$.',
                ],
          solution: [
            `$\\mathbf{u} = ${vector([a, b])}$ and $\\mathbf{u} \\cdot \\mathbf{u} = ${d}$, so $P = \\frac{1}{${d}}${bmatrix(
              [
                [a * a, a * b],
                [a * b, b * b],
              ],
            )} = ${bmatrix(P)}$.`,
            ...(kind === 2 ? [`$F = 2P - I = ${bmatrix(rows)}$.`] : []),
          ],
          data: { kind, deg: 0, a, b },
        }
      }
      if (kind === 3) {
        const k = rng.nonZeroInt(-3, 3)
        const vertical = rng.bool()
        const rows = vertical
          ? [
              [1, 0],
              [k, 1],
            ]
          : [
              [1, k],
              [0, 1],
            ]
        return {
          prompt: vertical
            ? `A shear keeps $\\hat{\\jmath}$ and sends $\\hat{\\imath}$ to $${vector([1, k])}$. Write its matrix.`
            : `A shear keeps $\\hat{\\imath}$ and sends $\\hat{\\jmath}$ to $${vector([k, 1])}$. Write its matrix.`,
          answer: { kind: 'matrix', rows },
          hints: [
            'The columns are the images of $\\hat{\\imath}$ and $\\hat{\\jmath}$, in that order.',
          ],
          solution: [`$${bmatrix(rows)}$.`],
          data: { kind, deg: 0, a: k, b: vertical ? 1 : 0 },
        }
      }
      const sx = rng.pick([0.5, 2, 3, -1])
      const sy = rng.pick([0.5, 2, 3])
      const rows = [
        [sx, 0],
        [0, sy],
      ]
      return {
        prompt: `A map multiplies every $x$-coordinate by $${num(sx)}$ and every $y$-coordinate by $${num(sy)}$. Write its matrix.`,
        answer: { kind: 'matrix', rows },
        hints: ['Where do $\\hat{\\imath}$ and $\\hat{\\jmath}$ go?'],
        solution: [
          `$\\hat{\\imath} \\mapsto ${vector([sx, 0])}$ and $\\hat{\\jmath} \\mapsto ${vector([0, sy])}$, so the matrix is $${bmatrix(rows)}$.`,
        ],
        data: { kind, deg: 0, a: sx, b: sy },
      }
    },
  },
  {
    id: 'transpose',
    title: 'A transpose',
    skills: ['matrix-multiplication'],
    difficulty: 1,
    generate: (rng) => {
      const [m, n] = rng.pick([
        [2, 3],
        [3, 2],
        [1, 3],
        [3, 3],
      ] as const)
      const a = intMatrix(rng, m, n, -5, 5)
      const t = transpose(a)
      return {
        prompt: `Write $A^T$ for $A = ${bmatrix(a)}$.`,
        answer: { kind: 'matrix', rows: t },
        hints: [`The rows of $A$ become the columns of $A^T$, which is $${n} \\times ${m}$.`],
        solution: [`$A^T = ${bmatrix(t)}$: row $i$ of $A$ is column $i$ of $A^T$.`],
        data: flatMat('A', a),
      }
    },
  },
  {
    id: 'transpose-product',
    title: 'The transpose of a product',
    skills: ['matrix-multiplication'],
    difficulty: 2,
    generate: (rng) => {
      const [m, n, p] = rng.pick([
        [2, 2, 2],
        [2, 3, 2],
        [3, 2, 2],
      ] as const)
      const a = intMatrix(rng, m, n, -3, 3)
      const b = intMatrix(rng, n, p, -3, 3)
      const c = matMul(a, b)
      const t = transpose(c)
      return {
        prompt: `$A = ${bmatrix(a)}$ and $B = ${bmatrix(b)}$. Compute $B^TA^T$.`,
        answer: { kind: 'matrix', rows: t },
        hints: ['$B^TA^T = (AB)^T$, so one product and one transpose are enough.'],
        solution: [`$AB = ${bmatrix(c)}$.`, `$B^TA^T = (AB)^T = ${bmatrix(t)}$.`],
        data: { ...flatMat('A', a), ...flatMat('B', b) },
      }
    },
  },
  {
    id: 'join-totals',
    title: 'Totals from a join',
    skills: ['matrix-multiplication'],
    difficulty: 2,
    generate: (rng) => {
      // Two stores; each sells two of the three products, so the sales table is sparse.
      const q = Array.from({ length: 2 }, () => {
        const skip = rng.int(0, 2)
        return PRODUCTS.map((_, k) => (k === skip ? 0 : rng.int(1, 9)))
      })
      const p = PRODUCTS.map(() => [rng.int(1, 6), rng.pick([0.5, 1, 1.5, 2])])
      const totals = matMul(q, p)
      const sales = q.flatMap((row, s) =>
        row.flatMap((v, k) => (v ? [[s + 1, PRODUCTS[k]!, v] as const] : [])),
      )
      const values = p.flatMap((row, k) =>
        row.map((v, j) => [PRODUCTS[k]!, MEASURES[j]!, v] as const),
      )
      return {
        prompt: `Sales (only products sold are stored) and the price in dollars and weight in kg per unit: $$${tex.tables(
          { title: 'q', columns: ['store', 'product', 'qty'], rows: sales },
          { title: 'p', columns: ['product', 'measure', 'value'], rows: values },
        )}$$ The query joins $q$ and $p$ on the product and sums $\\texttt{qty} \\cdot \\texttt{value}$ per store and measure. Write the result as a matrix: a row per store, the columns price then kg.`,
        answer: { kind: 'matrix', rows: totals },
        hints: [
          'As matrices: $Q$ (store by product, with zeros for products not sold) times $P$ (product by measure).',
          'Entry (store, measure) adds quantity times value over the products that store sold.',
        ],
        solution: [
          `$Q = ${bmatrix(q)}$ and $P = ${bmatrix(p)}$.`,
          ...totals.map(
            (row, s) =>
              `Store ${s + 1}: ${row.map((v, j) => `$${rowCol(q, p, s, j)} = ${num(v)}$`).join(' and ')}.`,
          ),
          `So $QP = ${bmatrix(totals)}$.`,
        ],
        data: { ...flatMat('Q', q), ...flatMat('P', p) },
      }
    },
  },
  {
    id: 'two-layers',
    title: 'Two linear layers as one',
    skills: ['matrix-multiplication'],
    difficulty: 2,
    generate: (rng) => {
      const w1 = intMatrix(rng, 3, 2, -2, 2)
      const w2 = intMatrix(rng, 2, 3, -2, 2)
      const w = matMul(w2, w1)
      return {
        prompt: `A network applies the layer $W_1 = ${bmatrix(w1)}$ and then $W_2 = ${bmatrix(w2)}$, with no activation and no bias. Write the single matrix $W$ with $W\\mathbf{x} = W_2(W_1\\mathbf{x})$.`,
        answer: { kind: 'matrix', rows: w },
        hints: ['The layer applied first goes on the right: $W = W_2W_1$, which is $2 \\times 2$.'],
        solution: [
          `$W = W_2W_1$.`,
          ...w.map(
            (row, i) =>
              `Row ${i + 1}: ${row.map((v, j) => `$${rowCol(w2, w1, i, j)} = ${v}$`).join(', ')}.`,
          ),
          `So $W = ${bmatrix(w)}$.`,
        ],
        data: { ...flatMat('W', w2), ...flatMat('V', w1) },
      }
    },
  },
])
