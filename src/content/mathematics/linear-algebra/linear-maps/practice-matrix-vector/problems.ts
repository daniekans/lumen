import { column, matVec, type MatN } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { num, paren, sum, vector } = tex

/** A matrix as TeX, entries through `num`. */
const bmatrix = (rows: MatN) =>
  `\\begin{bmatrix} ${rows.map((r) => r.map((v) => num(v)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`

/** A column vector as TeX. */
const col = (v: readonly number[]) => bmatrix(v.map((x) => [x]))

/** Entries flattened into problem data: { A0_0: 2, A0_1: -1, ... }. */
const flatMat = (name: string, a: MatN) =>
  Object.fromEntries(a.flatMap((row, i) => row.map((v, j) => [`${name}${i}_${j}`, v])))

const flat = (name: string, v: readonly number[]) =>
  Object.fromEntries(v.map((x, i) => [`${name}${i}`, x]))

const intMatrix = (rng: Rng, m: number, n: number, lo: number, hi: number) =>
  Array.from({ length: m }, () => Array.from({ length: n }, () => rng.int(lo, hi)))

/** A vector of n whole components in [lo, hi], not the zero vector. */
const intVector = (rng: Rng, n: number, lo: number, hi: number) => {
  for (;;) {
    const v = Array.from({ length: n }, () => rng.int(lo, hi))
    if (v.some((x) => x !== 0)) return v
  }
}

const VARS = ['x', 'y', 'z']

/** The components of A x written as formulas: (2x - y, 3y). */
const formula = (a: MatN) =>
  `(${a.map((row) => sum(row.map((c, j) => [c, VARS[j]!] as const))).join(',\\ ')})`

/** x_1 a_1 + x_2 a_2 + ... with the columns written out. */
const columnSum = (a: MatN, x: readonly number[]) =>
  x.map((c, j) => `${paren(c)}${col(column(a, j))}`).join(' + ')

/** Row i dotted with x, written out: 2 \cdot 3 + (-1) \cdot 2. */
const rowSum = (row: readonly number[], x: readonly number[]) =>
  row.map((r, j) => `${paren(r)} \\cdot ${paren(x[j]!)}`).join(' + ')

const productSolution = (a: MatN, x: readonly number[], ax: readonly number[]) => [
  `By columns: $${columnSum(a, x)} = ${col(ax)}$.`,
  `By rows: ${ax.map((v, i) => `$${rowSum(a[i]!, x)} = ${v}$`).join(', ')}.`,
]

/** Maps of the plane described in words, with their matrices. */
const DESCRIBED: readonly { words: string; m: number[][] }[] = [
  {
    words: 'the rotation by $90^\\circ$ counterclockwise',
    m: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    words: 'the rotation by $90^\\circ$ clockwise',
    m: [
      [0, 1],
      [-1, 0],
    ],
  },
  {
    words: 'the rotation by $180^\\circ$',
    m: [
      [-1, 0],
      [0, -1],
    ],
  },
  {
    words: 'the reflection across the $x$-axis',
    m: [
      [1, 0],
      [0, -1],
    ],
  },
  {
    words: 'the reflection across the $y$-axis',
    m: [
      [-1, 0],
      [0, 1],
    ],
  },
  {
    words: 'the reflection across the line $y = x$',
    m: [
      [0, 1],
      [1, 0],
    ],
  },
  {
    words: 'the projection onto the $x$-axis',
    m: [
      [1, 0],
      [0, 0],
    ],
  },
  {
    words: 'the projection onto the $y$-axis',
    m: [
      [0, 0],
      [0, 1],
    ],
  },
]

/** Maps that are not linear, each with a formula and why it fails, given coefficients. */
const NOT_LINEAR: readonly {
  kind: number
  tex: (a: number, b: number) => string
  f: (a: number, b: number, x: number, y: number) => [number, number]
}[] = [
  {
    kind: 0,
    tex: (a, b) =>
      `(${sum([
        [a, 'x'],
        [1, 'y'],
      ])}${b < 0 ? ` - ${-b}` : ` + ${b}`},\\ y)`,
    f: (a, b, x, y) => [a * x + y + b, y],
  },
  {
    kind: 1,
    tex: (a) => `(${sum([[a, 'x']])},\\ y^2)`,
    f: (a, _b, x, y) => [a * x, y * y],
  },
  {
    kind: 2,
    tex: (a) => `(xy,\\ ${sum([[a, 'y']])})`,
    f: (a, _b, x, y) => [x * y, a * y],
  },
]

const WHY_NOT: Record<number, string> = {
  0: 'the constant term moves the origin: $T(0, 0) \\ne (0, 0)$',
  1: 'the square breaks scaling: doubling $y$ multiplies $y^2$ by $4$',
  2: 'the product $xy$ breaks scaling: doubling both inputs multiplies $xy$ by $4$',
}

const NUTRIENTS = ['protein', 'carbs', 'fat']
const FOODS = ['oats', 'yogurt', 'lentils']
const PRODUCTS = ['apples', 'cheese', 'rice']

/** A table with row names and column names, numbers in the cells. */
const labeled = (rowNames: readonly string[], colNames: readonly string[], a: MatN) =>
  `\\begin{array}{r|${'c'.repeat(colNames.length)}} & ${colNames.map((c) => `\\text{${c}}`).join(' & ')} \\\\ \\hline ${a
    .map((r, i) => `\\text{${rowNames[i]}} & ${r.map((v) => num(v)).join(' & ')}`)
    .join(' \\\\ ')} \\end{array}`

/**
 * A matrix M with small whole entries, two independent vectors u and v with determinant 1 or -1
 * (so the weights of a whole-number vector are whole), and their images.
 */
const otherBasis = (rng: Rng) => {
  const M = intMatrix(rng, 2, 2, -3, 3)
  for (;;) {
    const u = [rng.int(-2, 2), rng.int(-2, 2)]
    const v = [rng.int(-2, 2), rng.int(-2, 2)]
    const det = u[0]! * v[1]! - u[1]! * v[0]!
    if (Math.abs(det) === 1 && u.some((c) => c !== 0) && v.some((c) => c !== 0))
      return { M, u, v, Mu: matVec(M, u), Mv: matVec(M, v), det }
  }
}

export const problems = defineProblems([
  {
    id: 'product-2d',
    title: 'A matrix times a vector',
    skills: ['matrix-vector'],
    difficulty: 1,
    generate: (rng) => {
      const a = intMatrix(rng, 2, 2, -4, 4)
      const x = intVector(rng, 2, -3, 3)
      const ax = matVec(a, x)
      return {
        prompt: `Compute $${bmatrix(a)}${col(x)}$.`,
        answer: { kind: 'vector', values: ax },
        hints: [
          'Take $x_1$ times the first column plus $x_2$ times the second, or dot each row with $\\mathbf{x}$.',
        ],
        solution: productSolution(a, x, ax),
        data: { m: 2, n: 2, ...flatMat('A', a), ...flat('x', x) },
      }
    },
  },
  {
    id: 'product-shape',
    title: 'A product with a matrix that is not square',
    skills: ['matrix-vector'],
    difficulty: 2,
    generate: (rng) => {
      const [m, n] = rng.pick([
        [2, 3],
        [3, 2],
        [3, 3],
        [2, 4],
      ] as const)
      const a = intMatrix(rng, m, n, -3, 3)
      const x = intVector(rng, n, -2, 3)
      const ax = matVec(a, x)
      return {
        prompt: `Compute $A\\mathbf{x}$ for $A = ${bmatrix(a)}$ and $\\mathbf{x} = ${col(x)}$.`,
        answer: { kind: 'vector', values: ax },
        hints: [
          `$A$ is $${m} \\times ${n}$, so $A\\mathbf{x}$ has $${m}$ entries, one per row.`,
          'Entry $i$ is row $i$ of $A$ dotted with $\\mathbf{x}$.',
        ],
        solution: productSolution(a, x, ax),
        data: { m, n, ...flatMat('A', a), ...flat('x', x) },
      }
    },
  },
  {
    id: 'shape',
    title: 'Shapes',
    skills: ['matrix-vector'],
    difficulty: 1,
    generate: (rng) => {
      const m = rng.int(1, 5)
      const n = rng.int(1, 5)
      const askInput = rng.bool()
      return {
        prompt: askInput
          ? `$A$ is a $${m} \\times ${n}$ matrix. How many components must $\\mathbf{x}$ have for $A\\mathbf{x}$ to be defined?`
          : `$A$ is a $${m} \\times ${n}$ matrix and $\\mathbf{x}$ is in $\\mathbb{R}^{${n}}$. How many components does $A\\mathbf{x}$ have?`,
        answer: { kind: 'number', value: askInput ? n : m },
        hints: ['$m \\times n$ means $m$ rows and $n$ columns.'],
        solution: [
          `$A\\mathbf{x}$ takes one weight per column, so $\\mathbf{x}$ has $${n}$ components, and gives one entry per row, so $A\\mathbf{x}$ has $${m}$.`,
          `The map is $\\mathbf{x} \\mapsto A\\mathbf{x}$ from $\\mathbb{R}^{${n}}$ to $\\mathbb{R}^{${m}}$.`,
        ],
        data: { m, n, askInput: askInput ? 1 : 0 },
      }
    },
  },
  {
    id: 'matrix-from-formula',
    title: 'The matrix of a map given by a formula',
    skills: ['matrix-columns'],
    difficulty: 1,
    generate: (rng) => {
      const [m, n] = rng.pick([
        [2, 2],
        [2, 2],
        [2, 3],
        [3, 2],
      ] as const)
      let a: number[][]
      do a = intMatrix(rng, m, n, -3, 3)
      while (a.some((row) => row.every((v) => v === 0)))
      const args = VARS.slice(0, n).join(', ')
      return {
        prompt: `$T(${args}) = ${formula(a)}$ is linear. Write its matrix.`,
        answer: { kind: 'matrix', rows: a },
        hints: [
          'The first column is $T$ of the first standard basis vector: set that variable to $1$ and the others to $0$.',
          'Row $i$ holds the coefficients of component $i$ of the formula.',
        ],
        solution: [
          ...Array.from(
            { length: n },
            (_, j) => `$T(\\mathbf{e}_${j + 1}) = ${vector(column(a, j))}$, column ${j + 1}.`,
          ),
          `So the matrix is $${bmatrix(a)}$: the coefficients of each component, row by row.`,
        ],
        data: { m, n, ...flatMat('A', a) },
      }
    },
  },
  {
    id: 'matrix-from-images',
    title: 'The matrix from the images of the basis',
    skills: ['matrix-columns'],
    difficulty: 1,
    generate: (rng) => {
      const described = rng.bool()
      if (described) {
        const d = rng.pick(DESCRIBED)
        return {
          prompt: `Write the matrix of ${d.words}.`,
          answer: { kind: 'matrix', rows: d.m },
          hints: [
            'Where does $\\hat{\\imath} = (1, 0)$ go? Where does $\\hat{\\jmath} = (0, 1)$ go?',
          ],
          solution: [
            `$\\hat{\\imath} \\mapsto ${vector(column(d.m, 0))}$ and $\\hat{\\jmath} \\mapsto ${vector(column(d.m, 1))}$.`,
            `These are the columns: $${bmatrix(d.m)}$.`,
          ],
          data: { m: 2, n: 2, described: DESCRIBED.indexOf(d), ...flatMat('A', d.m) },
        }
      }
      const a = intMatrix(rng, 2, 2, -4, 4)
      return {
        prompt: `A linear map $T$ of the plane sends $\\hat{\\imath}$ to $${vector(column(a, 0))}$ and $\\hat{\\jmath}$ to $${vector(column(a, 1))}$. Write its matrix.`,
        answer: { kind: 'matrix', rows: a },
        hints: [
          'The columns are the images of $\\hat{\\imath}$ and $\\hat{\\jmath}$, in that order.',
        ],
        solution: [
          `$${bmatrix(a)}$: $T(\\hat{\\imath})$ in the first column, $T(\\hat{\\jmath})$ in the second.`,
        ],
        data: { m: 2, n: 2, described: -1, ...flatMat('A', a) },
      }
    },
  },
  {
    id: 'image-from-basis',
    title: 'An image from the images of the basis',
    skills: ['linear-maps'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.pick([2, 2, 3])
      const a = intMatrix(rng, 2, n, -3, 3)
      const x = intVector(rng, n, -3, 3)
      const ax = matVec(a, x)
      const names =
        n === 2
          ? ['\\hat{\\imath}', '\\hat{\\jmath}']
          : ['\\mathbf{e}_1', '\\mathbf{e}_2', '\\mathbf{e}_3']
      const images = names.map((e, j) => `$T(${e}) = ${vector(column(a, j))}$`).join(', ')
      return {
        prompt: `$T$ is linear with ${images}. Find $T${vector(x)}$.`,
        answer: { kind: 'vector', values: ax },
        hints: [
          `$${vector(x)} = ${sum(x.map((c, j) => [c, names[j]!] as const))}$, and $T$ keeps combinations.`,
        ],
        solution: [
          `$T${vector(x)} = ${sum(x.map((c, j) => [c, `T(${names[j]})`] as const))}$.`,
          `$= ${x.map((c, j) => `${paren(c)}${vector(column(a, j))}`).join(' + ')} = ${vector(ax)}$.`,
        ],
        data: { m: 2, n, ...flatMat('A', a), ...flat('x', x) },
      }
    },
  },
  {
    id: 'image-other-basis',
    title: 'An image from the images of two other vectors',
    skills: ['linear-maps'],
    difficulty: 3,
    generate: (rng) => {
      const { M, u, v, Mu, Mv } = otherBasis(rng)
      const alpha = rng.nonZeroInt(-3, 3)
      const beta = rng.nonZeroInt(-3, 3)
      const x = [alpha * u[0]! + beta * v[0]!, alpha * u[1]! + beta * v[1]!]
      const tx = matVec(M, x)
      return {
        prompt: `$T$ is linear with $T${vector(u)} = ${vector(Mu)}$ and $T${vector(v)} = ${vector(Mv)}$. Find $T${vector(x)}$.`,
        answer: { kind: 'vector', values: tx },
        hints: [
          `Write $${vector(x)} = a${vector(u)} + b${vector(v)}$ and solve for $a$ and $b$.`,
          'Then $T$ of the combination is the same combination of the images.',
        ],
        solution: [
          `$${vector(x)} = ${paren(alpha)}${vector(u)} + ${paren(beta)}${vector(v)}$: solve the two component equations for the weights.`,
          `So $T${vector(x)} = ${paren(alpha)}${vector(Mu)} + ${paren(beta)}${vector(Mv)} = ${vector(tx)}$.`,
        ],
        data: {
          ...flat('u', u),
          ...flat('v', v),
          ...flat('Tu', Mu),
          ...flat('Tv', Mv),
          ...flat('x', x),
        },
      }
    },
  },
  {
    id: 'matrix-other-basis',
    title: 'The matrix from the images of two other vectors',
    skills: ['linear-maps', 'matrix-columns'],
    difficulty: 3,
    generate: (rng) => {
      const { M, u, v, Mu, Mv, det } = otherBasis(rng)
      // The weights of the standard basis in u and v (Cramer's rule, det = ±1).
      const i = [v[1]! / det, -u[1]! / det]
      const j = [-v[0]! / det, u[0]! / det]
      const w = (c: number[], name: string) =>
        `$${name} = ${paren(c[0]!)}${vector(u)} + ${paren(c[1]!)}${vector(v)}$`
      return {
        prompt: `$T$ is linear with $T${vector(u)} = ${vector(Mu)}$ and $T${vector(v)} = ${vector(Mv)}$. Write the matrix of $T$.`,
        answer: { kind: 'matrix', rows: M },
        hints: [
          'The columns are $T(\\hat{\\imath})$ and $T(\\hat{\\jmath})$. Write $\\hat{\\imath}$ and $\\hat{\\jmath}$ as combinations of the two given vectors.',
        ],
        solution: [
          `${w(i, '\\hat{\\imath}')} and ${w(j, '\\hat{\\jmath}')}.`,
          `$T(\\hat{\\imath}) = ${paren(i[0]!)}${vector(Mu)} + ${paren(i[1]!)}${vector(Mv)} = ${vector(column(M, 0))}$ and $T(\\hat{\\jmath}) = ${vector(column(M, 1))}$ likewise.`,
          `The matrix is $${bmatrix(M)}$. Check: it sends $${vector(u)}$ to $${vector(Mu)}$.`,
        ],
        data: {
          ...flat('u', u),
          ...flat('v', v),
          ...flat('Tu', Mu),
          ...flat('Tv', Mv),
          m: 2,
          n: 2,
          ...flatMat('A', M),
        },
      }
    },
  },
  {
    id: 'which-linear',
    title: 'Which map is linear?',
    skills: ['linear-maps'],
    difficulty: 1,
    generate: (rng) => {
      const a = intMatrix(rng, 2, 2, -3, 3)
      if (!a.flat().some((v) => v !== 0)) a[0]![0] = 1
      const linear = `$T(x, y) = ${formula(a)}$`
      const c = rng.nonZeroInt(-3, 3)
      const k = rng.nonZeroInt(-4, 4)
      const wrong = NOT_LINEAR.map((t) => `$T(x, y) = ${t.tex(c, k)}$`)
      const options = rng.shuffle([linear, ...wrong])
      return {
        prompt: 'Which of these maps of the plane is linear?',
        answer: { kind: 'choice', options, correct: options.indexOf(linear) },
        hints: [
          'A linear map has each component a sum of the variables times constants, with no constant term, powers or products.',
        ],
        solution: [
          `${linear} is $A\\mathbf{x}$ for $A = ${bmatrix(a)}$, so it is linear.`,
          ...NOT_LINEAR.map((t) => `$T(x, y) = ${t.tex(c, k)}$ is not: ${WHY_NOT[t.kind]}.`),
        ],
        data: { c, k, ...flatMat('A', a) },
      }
    },
  },
  {
    id: 'witness',
    title: 'Show that a map is not linear',
    skills: ['linear-maps'],
    difficulty: 2,
    generate: (rng) => {
      const t = rng.pick(NOT_LINEAR)
      const c = rng.nonZeroInt(-3, 3)
      const k = rng.nonZeroInt(-4, 4)
      const p = rng.nonZeroInt(-3, 3)
      const q = rng.nonZeroInt(-3, 3)
      const t1 = t.f(c, k, p, q)
      const t2 = t.f(c, k, 2 * p, 2 * q)
      const gap = [t2[0] - 2 * t1[0], t2[1] - 2 * t1[1]]
      return {
        prompt: `Let $T(x, y) = ${t.tex(c, k)}$ and $\\mathbf{u} = ${vector([p, q])}$. Compute $T(2\\mathbf{u}) - 2T(\\mathbf{u})$. A linear map would give $(0, 0)$.`,
        answer: { kind: 'vector', values: gap },
        hints: [
          `$2\\mathbf{u} = ${vector([2 * p, 2 * q])}$. Compute $T$ of it and $T(\\mathbf{u})$ separately.`,
        ],
        solution: [
          `$T(2\\mathbf{u}) = T${vector([2 * p, 2 * q])} = ${vector(t2)}$ and $T(\\mathbf{u}) = ${vector(t1)}$.`,
          `$T(2\\mathbf{u}) - 2T(\\mathbf{u}) = ${vector(t2)} - ${vector(t1.map((v) => 2 * v))} = ${vector(gap)}$, not $(0, 0)$: ${WHY_NOT[t.kind]}.`,
        ],
        data: { kind: t.kind, c, k, p, q },
      }
    },
  },
  {
    id: 'nutrients',
    title: 'Nutrients of a meal',
    skills: ['matrix-vector'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.pick([2, 3])
      const foods = FOODS.slice(0, n)
      // Grams per serving: rows are nutrients, columns are foods.
      const a = [
        foods.map(() => rng.int(2, 25)),
        foods.map(() => rng.int(0, 40)),
        foods.map(() => rng.int(0, 15)),
      ]
      const x = intVector(rng, n, 0, 3)
      const ax = matVec(a, x)
      return {
        prompt: `Grams per serving: $$${labeled(NUTRIENTS, foods, a)}$$ A meal has ${foods
          .map((f, j) => `$${x[j]}$ ${x[j] === 1 ? 'serving' : 'servings'} of ${f}`)
          .join(', ')}. Find the grams of (protein, carbs, fat) in the meal.`,
        answer: { kind: 'vector', values: ax },
        hints: [
          'The table is a matrix with one column per food. Multiply it by the vector of servings.',
          'Each nutrient is its row dotted with the servings.',
        ],
        solution: [
          ...ax.map((v, i) => `${NUTRIENTS[i]}: $${rowSum(a[i]!, x)} = ${v}$ g.`),
          `So the meal has $${vector(ax)}$ grams: the matrix times the servings.`,
        ],
        data: { m: 3, n, ...flatMat('A', a), ...flat('x', x) },
      }
    },
  },
  {
    id: 'store-totals',
    title: 'A basket in several stores',
    skills: ['matrix-vector'],
    difficulty: 2,
    generate: (rng) => {
      const stores = rng.pick([2, 3])
      // Euros per kg, in steps of 0.5: rows are stores, columns are products.
      const p = Array.from({ length: stores }, () =>
        PRODUCTS.map((_, j) => rng.int(j === 1 ? 16 : 2, j === 1 ? 30 : 8) / 2),
      )
      const q = PRODUCTS.map(() => rng.int(1, 6) / 2)
      const totals = matVec(p, q)
      const names = Array.from({ length: stores }, (_, i) => `store ${i + 1}`)
      return {
        prompt: `Prices in euros per kg: $$${labeled(names, PRODUCTS, p)}$$ A basket has ${PRODUCTS.map((f, j) => `$${num(q[j]!)}$ kg of ${f}`).join(', ')}. Find its cost in each store, in euros, as a vector.`,
        answer: { kind: 'vector', values: totals },
        hints: ['Each store is one row: multiply its prices by the kilograms and add.'],
        solution: [
          ...totals.map((v, i) => `${names[i]}: $${rowSum(p[i]!, q)} = ${num(v)}$.`),
          `The prices matrix times the basket gives $${vector(totals)}$ euros.`,
        ],
        data: { m: stores, n: 3, ...flatMat('A', p), ...flat('x', q) },
      }
    },
  },
  {
    id: 'layer',
    title: "A layer's output",
    skills: ['matrix-vector'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.pick([2, 3])
      const w = intMatrix(rng, 2, n, -3, 3)
      const b = [rng.int(-5, 5), rng.int(-5, 5)]
      const x = intVector(rng, n, -2, 4)
      const wx = matVec(w, x)
      const out = wx.map((v, i) => v + b[i]!)
      return {
        prompt: `A layer has weights $W = ${bmatrix(w)}$ and biases $\\mathbf{b} = ${col(b)}$. Compute $W\\mathbf{x} + \\mathbf{b}$ for $\\mathbf{x} = ${col(x)}$, before any activation.`,
        answer: { kind: 'vector', values: out },
        hints: ['First $W\\mathbf{x}$, one neuron per row; then add $\\mathbf{b}$.'],
        solution: [
          `$W\\mathbf{x}$: ${wx.map((v, i) => `$${rowSum(w[i]!, x)} = ${v}$`).join(', ')}.`,
          `$W\\mathbf{x} + \\mathbf{b} = ${col(wx)} + ${col(b)} = ${col(out)}$.`,
        ],
        data: { m: 2, n, ...flatMat('A', w), ...flat('b', b), ...flat('x', x) },
      }
    },
  },
])
