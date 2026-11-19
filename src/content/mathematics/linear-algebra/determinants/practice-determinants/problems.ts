import { detN, matMul, minorMatrix, polygonArea, type MatN, type Vec2 } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { bmatrix, num, paren, vector } = tex

/** Entries flattened into problem data: { A0_0: 2, A0_1: -1, ... }, with the size. */
const flatMat = (name: string, a: MatN) => ({
  [`${name}n`]: a.length,
  ...Object.fromEntries(a.flatMap((row, i) => row.map((v, j) => [`${name}${i}_${j}`, v]))),
})

/** Points flattened into problem data: { x0, y0, x1, y1, ... }. */
const flatPoints = (ps: readonly Vec2[]) =>
  Object.fromEntries(
    ps.flatMap((p, k) => [
      [`x${k}`, p[0]],
      [`y${k}`, p[1]],
    ]),
  )

const intMatrix = (rng: Rng, n: number, lo: number, hi: number) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => rng.int(lo, hi)))

const point = (p: readonly number[]) => `(${p.map(num).join(', ')})`

const det2Tex = (m: MatN) =>
  `${paren(m[0]![0]!)} \\cdot ${paren(m[1]![1]!)} - ${paren(m[0]![1]!)} \\cdot ${paren(m[1]![0]!)}`

/** The first-row cofactor expansion of a 3 x 3, written out. */
const cofactorLines = (a: MatN) => {
  const terms = [0, 1, 2].map((j) => {
    const m = minorMatrix(a, 0, j)
    return { j, entry: a[0]![j]!, m, d: detN(m) }
  })
  const parts = terms
    .map((t, k) => `${k === 1 ? '-' : k === 2 ? '+' : ''}\\,${paren(t.entry)}\\,(${det2Tex(t.m)})`)
    .join(' ')
  const values = terms
    .map(
      (t, k) => `${k === 0 ? '' : k === 1 ? ' - ' : ' + '}${paren(t.entry)} \\cdot ${paren(t.d)}`,
    )
    .join('')
  return [
    'Expand along the first row, with signs $+, -, +$; each entry multiplies the $2 \\times 2$ determinant left when its row and column are removed.',
    `$\\det A = ${parts}$`,
    `$= ${values} = ${num(detN(a))}$.`,
  ]
}

const ORDINAL = ['first', 'second', 'third', 'fourth']

/** Row operations described in words, with the factor each applies to the determinant. */
type Op =
  | { kind: 'swap'; i: number; j: number }
  | { kind: 'scale'; i: number; c: number }
  | { kind: 'add'; i: number; j: number; c: number }
  | { kind: 'all'; c: number }
  | { kind: 'transpose' }

const OP_CODE = { swap: 0, scale: 1, add: 2, all: 3, transpose: 4 } as const

const opWords = (op: Op, n: number) => {
  switch (op.kind) {
    case 'swap':
      return `swap the ${ORDINAL[op.i]} and ${ORDINAL[op.j]} rows`
    case 'scale':
      return `multiply the ${ORDINAL[op.i]} row by $${op.c}$`
    case 'add':
      return `add $${op.c}$ times the ${ORDINAL[op.j]} row to the ${ORDINAL[op.i]} row`
    case 'all':
      return `multiply the whole $${n} \\times ${n}$ matrix by $${op.c}$`
    case 'transpose':
      return 'transpose the matrix'
  }
}

const opFactor = (op: Op, n: number) => {
  switch (op.kind) {
    case 'swap':
      return -1
    case 'scale':
      return op.c
    case 'add':
      return 1
    case 'all':
      return op.c ** n
    case 'transpose':
      return 1
  }
}

const opReason = (op: Op, n: number) => {
  switch (op.kind) {
    case 'swap':
      return 'A swap flips the sign: factor $-1$.'
    case 'scale':
      return `Scaling one row scales the determinant: factor $${op.c}$.`
    case 'add':
      return 'Adding a multiple of one row to another keeps the determinant: factor $1$.'
    case 'all':
      return `Every one of the $${n}$ rows is scaled, so the factor is $${paren(op.c)}^{${n}} = ${op.c ** n}$.`
    case 'transpose':
      return '$\\det A^T = \\det A$: factor $1$.'
  }
}

const randomOp = (rng: Rng, n: number): Op => {
  const kind = rng.pick(['swap', 'scale', 'add', 'all', 'transpose'] as const)
  const [i, j] = rng.shuffle(Array.from({ length: n }, (_, k) => k)).slice(0, 2) as [number, number]
  switch (kind) {
    case 'swap':
      return { kind, i: Math.min(i, j), j: Math.max(i, j) }
    case 'scale':
      return { kind, i, c: rng.pick([-3, -2, 2, 3, 4, 5]) }
    case 'add':
      return { kind, i, j, c: rng.nonZeroInt(-4, 4) }
    case 'all':
      return { kind, c: rng.pick([-2, -1, 2, 3]) }
    case 'transpose':
      return { kind }
  }
}

const opData = (op: Op, k: number) => ({
  [`op${k}`]: OP_CODE[op.kind],
  [`op${k}i`]: 'i' in op ? op.i : -1,
  [`op${k}j`]: 'j' in op ? op.j : -1,
  [`op${k}c`]: 'c' in op ? op.c : 0,
})

/** Corners of a simple polygon: integer points sorted by angle around their mean. */
const randomPolygon = (rng: Rng, m: number): Vec2[] => {
  for (;;) {
    const ps: Vec2[] = []
    while (ps.length < m) {
      const p: Vec2 = [rng.int(0, 8), rng.int(0, 6)]
      if (!ps.some((q) => q[0] === p[0] && q[1] === p[1])) ps.push(p)
    }
    const cx = ps.reduce((s, p) => s + p[0], 0) / m
    const cy = ps.reduce((s, p) => s + p[1], 0) / m
    const sorted = [...ps].sort(
      (p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx),
    )
    // Every corner a real turn, and no two corners at the same angle from the mean.
    const ok = sorted.every((p, k) => {
      const q = sorted[(k + 1) % m]!
      const r = sorted[(k + 2) % m]!
      const turn = (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0])
      const fromMean = (p[0] - cx) * (q[1] - cy) - (p[1] - cy) * (q[0] - cx)
      return turn !== 0 && fromMean > 1e-9
    })
    if (ok && Math.abs(polygonArea(sorted)) >= 6) return sorted
  }
}

export const problems = defineProblems([
  {
    id: 'det-2x2',
    title: 'A 2 by 2 determinant',
    skills: ['computing-determinants'],
    difficulty: 1,
    generate: (rng) => {
      const a = intMatrix(rng, 2, -7, 7)
      const d = detN(a)
      return {
        prompt: `Compute $\\det ${bmatrix(a)}$.`,
        answer: { kind: 'number', value: d },
        hints: ['$\\det \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} = ad - bc$.'],
        solution: [`$ad - bc = ${det2Tex(a)} = ${d}$.`],
        data: flatMat('A', a),
      }
    },
  },
  {
    id: 'det-3x3',
    title: 'A 3 by 3 determinant',
    skills: ['computing-determinants'],
    difficulty: 2,
    generate: (rng) => {
      const a = intMatrix(rng, 3, -4, 4)
      return {
        prompt: `Compute $\\det A$ for $A = ${bmatrix(a)}$.`,
        answer: { kind: 'number', value: detN(a) },
        hints: [
          'Expand along a row or column, ideally one with zeros. The signs follow a checkerboard starting with $+$.',
          'Each entry multiplies the $2 \\times 2$ determinant left when its row and column are removed.',
        ],
        solution: cofactorLines(a),
        data: flatMat('A', a),
      }
    },
  },
  {
    id: 'triangular',
    title: 'A triangular matrix',
    skills: ['computing-determinants'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(3, 4)
      const upper = rng.bool()
      const a = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) =>
          i === j ? rng.nonZeroInt(-4, 4) : (upper ? j > i : j < i) ? rng.int(-9, 9) : 0,
        ),
      )
      const diag = a.map((row, i) => row[i]!)
      const d = diag.reduce((p, v) => p * v, 1)
      return {
        prompt: `Compute $\\det ${bmatrix(a)}$.`,
        answer: { kind: 'number', value: d },
        hints: ['Look at where the zeros are. Expand along the first column (or row) repeatedly.'],
        solution: [
          `The matrix is ${upper ? 'upper' : 'lower'} triangular, so its determinant is the product of its diagonal.`,
          `$${diag.map(paren).join(' \\cdot ')} = ${d}$.`,
        ],
        data: flatMat('A', a),
      }
    },
  },
  {
    id: 'det-4x4',
    title: 'A 4 by 4 determinant by elimination',
    skills: ['computing-determinants', 'determinant-rules'],
    difficulty: 3,
    generate: (rng) => {
      // A = L U with L unit lower triangular: elimination without swaps recovers U.
      const n = 4
      const L = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : j < i ? rng.int(-2, 2) : 0)),
      )
      const U = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) =>
          i === j ? rng.pick([-3, -2, -1, 1, 2, 3]) : j > i ? rng.int(-2, 2) : 0,
        ),
      )
      const a = matMul(L, U)
      const pivots = U.map((row, i) => row[i]!)
      const d = pivots.reduce((p, v) => p * v, 1)
      return {
        prompt: `Compute $\\det A$ for $A = ${bmatrix(a)}$. Elimination is faster than cofactors here.`,
        answer: { kind: 'number', value: d },
        hints: [
          'Subtract multiples of the first row to clear the first column below it; these keep the determinant.',
          'Continue column by column until the matrix is upper triangular; then multiply the pivots.',
        ],
        solution: [
          'Subtracting multiples of each row from the rows below it (no swaps are needed here) keeps the determinant and ends in',
          `$U = ${bmatrix(U)}$.`,
          `The pivots are $${pivots.map(num).join(', ')}$, so $\\det A = ${pivots.map(paren).join(' \\cdot ')} = ${d}$.`,
        ],
        data: flatMat('A', a),
      }
    },
  },
  {
    id: 'row-operations',
    title: 'After row operations',
    skills: ['determinant-rules'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(3, 4)
      const d = rng.nonZeroInt(-6, 6)
      const ops = [randomOp(rng, n), randomOp(rng, n)]
      const factor = ops.reduce((p, op) => p * opFactor(op, n), 1)
      return {
        prompt: `$A$ is a $${n} \\times ${n}$ matrix with $\\det A = ${d}$. The matrix $B$ is made from $A$ in two moves: first ${opWords(ops[0]!, n)}, then ${opWords(ops[1]!, n)}. What is $\\det B$?`,
        answer: { kind: 'number', value: d * factor },
        hints: [
          'Each move multiplies the determinant by a factor: a swap by $-1$, scaling a row by $c$ by $c$, adding a multiple of a row by $1$.',
        ],
        solution: [
          ...ops.map((op) => opReason(op, n)),
          `$\\det B = ${paren(d)} \\cdot ${paren(opFactor(ops[0]!, n))} \\cdot ${paren(opFactor(ops[1]!, n))} = ${d * factor}$.`,
        ],
        data: { n, d, ...opData(ops[0]!, 0), ...opData(ops[1]!, 1) },
      }
    },
  },
  {
    id: 'singular-k',
    title: 'The value that collapses the map',
    skills: ['determinant', 'computing-determinants'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const n = rng.int(2, 3)
        const a = intMatrix(rng, n, -4, 4)
        const i = rng.int(0, n - 1)
        const j = rng.int(0, n - 1)
        const at = (k: number) => a.map((row, r) => row.map((v, c) => (r === i && c === j ? k : v)))
        const beta = detN(at(0))
        const alpha = detN(at(1)) - beta
        if (alpha === 0 || beta % alpha !== 0) continue
        const k = -beta / alpha
        if (Math.abs(k) > 12 || k === a[i]![j]) continue
        const shown = a.map((row, r) =>
          row.map((v, c) => (r === i && c === j ? 'k' : num(v))).join(' & '),
        )
        const m = `\\begin{bmatrix} ${shown.join(' \\\\ ')} \\end{bmatrix}`
        return {
          prompt: `For which $k$ does $A = ${m}$ collapse the ${n === 2 ? 'plane onto a line or a point' : 'space onto a plane or less'}, that is, $\\det A = 0$?`,
          answer: { kind: 'number', value: k },
          hints: [
            '$\\det A$ is linear in $k$ (rule 2): write it as $\\alpha k + \\beta$.',
            n === 3
              ? `Expand along row ${i + 1} or column ${j + 1}, the line that holds $k$.`
              : 'Use $ad - bc$.',
          ],
          solution: [
            `Expanding, $\\det A = ${alpha === 1 ? '' : alpha === -1 ? '-' : alpha}k ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}$.`,
            `It is $0$ for $k = ${num(k)}$.`,
          ],
          data: { i, j, k, ...flatMat('A', at(k)) },
        }
      }
    },
  },
  {
    id: 'collinear',
    title: 'Three stakes on one line',
    skills: ['determinant', 'computing-determinants'],
    difficulty: 2,
    generate: (rng) => {
      const p: Vec2 = [rng.int(-5, 5), rng.int(-5, 5)]
      const dir: Vec2 = [rng.nonZeroInt(-3, 3), rng.int(-3, 3)]
      const s = rng.nonZeroInt(-2, 3)
      const t = rng.pick([-2, -1, 2, 3].filter((v) => v !== s))
      const q: Vec2 = [p[0] + s * dir[0], p[1] + s * dir[1]]
      const r: Vec2 = [p[0] + t * dir[0], p[1] + t * dir[1]]
      const yMinus = p[1] === 0 ? 'y' : `y ${p[1] < 0 ? '+' : '-'} ${Math.abs(p[1])}`
      return {
        prompt: `A straight fence will pass through stakes at $${point(p)}$ and $${point(q)}$ (in meters). A third stake goes at $(${r[0]}, y)$. For which $y$ is it on the same line?`,
        answer: { kind: 'number', value: r[1] },
        hints: [
          'Three points are on one line exactly when $\\det[\\mathbf{q} - \\mathbf{p}\\ \\ \\mathbf{r} - \\mathbf{p}] = 0$: the triangle has no area.',
        ],
        solution: [
          `$\\mathbf{q} - \\mathbf{p} = ${vector([q[0] - p[0], q[1] - p[1]])}$ and $\\mathbf{r} - \\mathbf{p} = (${r[0] - p[0]}, ${yMinus})$.`,
          `$\\det = ${paren(q[0] - p[0])}(${yMinus}) - ${paren(q[1] - p[1])} \\cdot ${paren(r[0] - p[0])} = 0$.`,
          `So $y = ${r[1]}$.`,
        ],
        data: flatPoints([p, q, r]),
      }
    },
  },
  {
    id: 'orientation',
    title: 'Which way round',
    skills: ['determinant'],
    difficulty: 1,
    generate: (rng) => {
      const pts: Vec2[] = Array.from({ length: 3 }, () => [rng.int(-5, 5), rng.int(-5, 5)])
      if (rng.int(0, 4) === 0) {
        // On one line sometimes, so the third answer occurs.
        const [p, q] = pts as [Vec2, Vec2]
        const t = rng.pick([-1, 2])
        pts[2] = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]
      }
      const [p, q, r] = pts as [Vec2, Vec2, Vec2]
      const u: Vec2 = [q[0] - p[0], q[1] - p[1]]
      const v: Vec2 = [r[0] - p[0], r[1] - p[1]]
      const d = u[0] * v[1] - u[1] * v[0]
      const options = ['Counterclockwise', 'Clockwise', 'They are on one line']
      return {
        prompt: `Going from $P = ${point(p)}$ to $Q = ${point(q)}$ to $R = ${point(r)}$, does the triangle turn counterclockwise or clockwise?`,
        answer: { kind: 'choice', options, correct: d > 0 ? 0 : d < 0 ? 1 : 2 },
        hints: [
          'The sign of $\\det[\\mathbf{q} - \\mathbf{p}\\ \\ \\mathbf{r} - \\mathbf{p}]$ gives the orientation.',
        ],
        solution: [
          `$\\mathbf{q} - \\mathbf{p} = ${vector(u)}$, $\\mathbf{r} - \\mathbf{p} = ${vector(v)}$.`,
          `$\\det = ${paren(u[0])} \\cdot ${paren(v[1])} - ${paren(u[1])} \\cdot ${paren(v[0])} = ${d}$.`,
          d > 0
            ? 'Positive: counterclockwise ($R$ is to the left of the direction from $P$ to $Q$).'
            : d < 0
              ? 'Negative: clockwise ($R$ is to the right of the direction from $P$ to $Q$).'
              : 'Zero: the three points are on one line.',
        ],
        data: flatPoints(pts),
      }
    },
  },
  {
    id: 'polygon-area',
    title: 'The area of a plot',
    skills: ['computing-determinants'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(4, 5)
      const ps = randomPolygon(rng, m)
      const signed = polygonArea(ps)
      const area = Math.abs(signed) * 100
      const terms = ps.map((p, k) => {
        const q = ps[(k + 1) % m]!
        return p[0] * q[1] - q[0] * p[1]
      })
      return {
        prompt: `A plot of land has corners ${ps.map((p) => `$${point(p)}$`).join(', ')}, in that order around it. One unit is $10$ meters. What is its area in square meters?`,
        answer: { kind: 'number', value: area },
        hints: [
          'Shoelace: area $= \\frac{1}{2}\\left|\\sum_k (x_ky_{k+1} - x_{k+1}y_k)\\right|$, going around and back to the first corner.',
          'One square unit is $10 \\times 10 = 100$ square meters.',
        ],
        solution: [
          `The terms $x_ky_{k+1} - x_{k+1}y_k$: $${terms.join(',\\ ')}$.`,
          `Their sum is $${terms.reduce((s, v) => s + v, 0)}$, so the area is $${num(Math.abs(signed))}$ square units.`,
          `That is $${num(area)}$ square meters.`,
        ],
        data: { m, ...flatPoints(ps) },
      }
    },
  },
  {
    id: 'image-area',
    title: 'The area of an image',
    skills: ['determinant'],
    difficulty: 2,
    generate: (rng) => {
      let a = intMatrix(rng, 2, -4, 4)
      while (detN(a) === 0) a = intMatrix(rng, 2, -4, 4)
      const d = detN(a)
      const shape = rng.int(0, 1)
      const w = rng.int(1, 5)
      const h = rng.int(1, 4)
      const area = shape === 0 ? w * h : (w * h) / 2
      const words =
        shape === 0
          ? `the rectangle with corners $(0, 0)$, $(${w}, 0)$, $(${w}, ${h})$, $(0, ${h})$`
          : `the triangle with corners $(0, 0)$, $(${w}, 0)$, $(0, ${h})$`
      return {
        prompt: `The map $\\mathbf{x} \\mapsto A\\mathbf{x}$ with $A = ${bmatrix(a)}$ is applied to ${words}. What is the area of the image?`,
        answer: { kind: 'number', value: Math.abs(d) * area },
        hints: [
          'A linear map multiplies every area by $|\\det A|$.',
          'Find the area of the region first.',
        ],
        solution: [
          `The region has area $${num(area)}$, and $\\det A = ${det2Tex(a)} = ${d}$.`,
          `The image has area $|${d}| \\cdot ${num(area)} = ${num(Math.abs(d) * area)}$. (The sign only says whether the image is flipped.)`,
        ],
        data: { shape, w, h, ...flatMat('A', a) },
      }
    },
  },
])
