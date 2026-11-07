import {
  cross3,
  dot3,
  matVec,
  rank,
  rotationAbout,
  transpose,
  type Axis3,
  type MatN,
} from '@/lib/math'
import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { bmatrix, cleanMatrix, num, paren, sum, trig, trigMatrix, vector } = tex

/** Entries flattened into problem data: { A0_0: 2, A0_1: -1, ... }, with the shape. */
const flatMat = (name: string, a: MatN) => ({
  [`${name}m`]: a.length,
  [`${name}n`]: a[0]!.length,
  ...Object.fromEntries(a.flatMap((row, i) => row.map((v, j) => [`${name}${i}_${j}`, v]))),
})

const flatVec = (name: string, v: readonly number[]) =>
  Object.fromEntries(v.map((x, i) => [`${name}${i}`, x]))

const AXES: readonly Axis3[] = ['x', 'y', 'z']

const intVec = (rng: Rng, n: number, lo: number, hi: number) =>
  Array.from({ length: n }, () => rng.int(lo, hi))

/** Two whole-number vectors of space that are not parallel. */
const independentPair = (rng: Rng): [number[], number[]] => {
  for (;;) {
    const a = intVec(rng, 3, -2, 3)
    const b = intVec(rng, 3, -2, 3)
    const n = cross3(a as [number, number, number], b as [number, number, number])
    if (n.some((v) => v !== 0)) return [a, b]
  }
}

const combine = (p: number, a: readonly number[], q: number, b: readonly number[]) =>
  a.map((v, i) => p * v + q * b[i]!)

const DEGREES = [90, 180, -90, 30, 45, 60, 120, 135, 150, -30, -45, -60] as const

const turnWords = (deg: number, axis: Axis3) =>
  `$${Math.abs(deg)}^\\circ$ about the $${axis}$-axis, ${deg > 0 ? 'counterclockwise' : 'clockwise'} when seen from the positive $${axis}$-axis`

/** The two coordinates a rotation about each axis turns, in the cyclic order. */
const PAIR: Record<Axis3, string> = { x: '$y$ and $z$', y: '$z$ and $x$', z: '$x$ and $y$' }

/** Maps of space described in words, with a matrix and their kernel and image. */
export const DESCRIBED: readonly {
  words: string
  m: number[][]
  kernel: string
  image: string
}[] = [
  {
    words: 'the projection of space onto the $xy$-plane, $(x, y, z) \\mapsto (x, y, 0)$',
    m: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    kernel: 'the $z$-axis',
    image: 'the $xy$-plane',
  },
  {
    words: 'the projection of space onto the $z$-axis, $(x, y, z) \\mapsto (0, 0, z)$',
    m: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ],
    kernel: 'the $xy$-plane',
    image: 'the $z$-axis',
  },
  {
    words: 'the rotation by $90^\\circ$ about the $z$-axis',
    m: [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ],
    kernel: 'only $\\mathbf{0}$',
    image: 'all of space',
  },
  {
    words: 'the map $(x, y, z) \\mapsto (x + y + z)(1, 1, 1)$',
    m: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    kernel: 'the plane $x + y + z = 0$',
    image: 'the line along $(1, 1, 1)$',
  },
  {
    words: 'the zero map, $(x, y, z) \\mapsto (0, 0, 0)$',
    m: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    kernel: 'all of space',
    image: 'only $\\mathbf{0}$',
  },
]

export const KERNEL_OPTIONS = [
  'only $\\mathbf{0}$',
  'the $z$-axis',
  'the $xy$-plane',
  'the plane $x + y + z = 0$',
  'all of space',
] as const
export const IMAGE_OPTIONS = [
  'only $\\mathbf{0}$',
  'the $z$-axis',
  'the $xy$-plane',
  'the line along $(1, 1, 1)$',
  'all of space',
] as const

const PROOFS = [
  {
    prompt:
      'Let $A$ be an $m \\times n$ matrix. Prove that its kernel, $\\ker A = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}$, is a subspace: it contains $\\mathbf{0}$, and it contains $a\\mathbf{u} + b\\mathbf{v}$ whenever it contains $\\mathbf{u}$ and $\\mathbf{v}$.',
    hints: ['Use $A(a\\mathbf{u} + b\\mathbf{v}) = aA\\mathbf{u} + bA\\mathbf{v}$.'],
    solution: [
      '$A\\mathbf{0} = \\mathbf{0}$, since every entry of $A\\mathbf{0}$ is a sum of zeros. So $\\mathbf{0} \\in \\ker A$.',
      'Let $\\mathbf{u}, \\mathbf{v} \\in \\ker A$ and $a, b$ be numbers. By linearity, $A(a\\mathbf{u} + b\\mathbf{v}) = aA\\mathbf{u} + bA\\mathbf{v} = a\\mathbf{0} + b\\mathbf{0} = \\mathbf{0}$.',
      'So $a\\mathbf{u} + b\\mathbf{v} \\in \\ker A$, and the kernel is a subspace.',
    ],
  },
  {
    prompt:
      'Let $A$ be an $m \\times n$ matrix. Prove that its image, $\\operatorname{im} A = \\{A\\mathbf{x} : \\mathbf{x} \\in \\mathbb{R}^n\\}$, is a subspace: it contains $\\mathbf{0}$, and it contains $a\\mathbf{y} + b\\mathbf{z}$ whenever it contains $\\mathbf{y}$ and $\\mathbf{z}$.',
    hints: ['Each output is $A$ of some input. Which input gives $a\\mathbf{y} + b\\mathbf{z}$?'],
    solution: [
      '$\\mathbf{0} = A\\mathbf{0}$ is an output, so $\\mathbf{0} \\in \\operatorname{im} A$.',
      'Let $\\mathbf{y} = A\\mathbf{u}$ and $\\mathbf{z} = A\\mathbf{v}$ be two outputs. Then $a\\mathbf{y} + b\\mathbf{z} = aA\\mathbf{u} + bA\\mathbf{v} = A(a\\mathbf{u} + b\\mathbf{v})$, the output of the input $a\\mathbf{u} + b\\mathbf{v}$.',
      'So $a\\mathbf{y} + b\\mathbf{z} \\in \\operatorname{im} A$, and the image is a subspace.',
    ],
  },
  {
    prompt:
      'Let $T$ be a linear map. Prove that $T(\\mathbf{0}) = \\mathbf{0}$, using only the rule $T(c\\mathbf{v}) = cT(\\mathbf{v})$.',
    hints: ['Write $\\mathbf{0}$ as a multiple of a vector.'],
    solution: [
      'For any vector $\\mathbf{v}$, $\\mathbf{0} = 0\\mathbf{v}$.',
      'So $T(\\mathbf{0}) = T(0\\mathbf{v}) = 0\\,T(\\mathbf{v}) = \\mathbf{0}$.',
    ],
  },
  {
    prompt:
      'Let $T$ be a linear map with $T(\\mathbf{u}) = T(\\mathbf{v})$. Prove that $\\mathbf{u} - \\mathbf{v}$ is in the kernel of $T$, and that if the kernel is only $\\mathbf{0}$, then $\\mathbf{u} = \\mathbf{v}$.',
    hints: ['Apply $T$ to $\\mathbf{u} - \\mathbf{v}$ and use linearity.'],
    solution: [
      '$T(\\mathbf{u} - \\mathbf{v}) = T(\\mathbf{u}) - T(\\mathbf{v}) = \\mathbf{0}$, so $\\mathbf{u} - \\mathbf{v}$ is in the kernel.',
      'If the kernel is only $\\mathbf{0}$, then $\\mathbf{u} - \\mathbf{v} = \\mathbf{0}$, so $\\mathbf{u} = \\mathbf{v}$: different inputs have different outputs.',
    ],
  },
] as const

export const problems = defineProblems([
  {
    id: 'rotation-3d',
    title: 'The matrix of a rotation in space',
    skills: ['maps-in-3d'],
    difficulty: 2,
    generate: (rng) => {
      const axis = rng.pick(AXES)
      const deg = rng.pick(DEGREES)
      const t = (deg * Math.PI) / 180
      const r = cleanMatrix(rotationAbout(axis, t))
      const [c, sn] = cleanMatrix([[Math.cos(t), Math.sin(t)]])[0]!
      return {
        prompt: `Write the $3 \\times 3$ matrix of the rotation by ${turnWords(deg, axis)}. Exact values such as $\\frac{\\sqrt{3}}{2}$ can be typed as they are.`,
        answer: { kind: 'matrix', rows: r, tolerance: 1e-6 },
        hints: [
          `The $${axis}$-axis stays, so its column is a standard basis vector, and its row has a $1$ on the diagonal.`,
          `${PAIR[axis]} turn as in the plane, in that order: the first goes toward the second.`,
          deg < 0
            ? 'Clockwise means $\\theta$ is negative.'
            : 'Use $\\cos\\theta$ and $\\sin\\theta$.',
        ],
        solution: [
          `The rotation keeps the $${axis}$-axis and turns ${PAIR[axis]} by $\\theta = ${deg}^\\circ$, with $\\cos\\theta = ${trig(c!)}$ and $\\sin\\theta = ${trig(sn!)}$.`,
          `So the matrix is $${trigMatrix(r)}$.`,
        ],
        data: { axis: AXES.indexOf(axis), deg },
      }
    },
  },
  {
    id: 'rotate-vector-3d',
    title: 'A vector turned about an axis',
    skills: ['maps-in-3d'],
    difficulty: 2,
    generate: (rng) => {
      const axis = rng.pick(AXES)
      const deg = rng.pick([90, 180, -90])
      const v = intVec(rng, 3, -4, 4)
      if (!v.some((x) => x !== 0)) v[0] = 1
      const r = cleanMatrix(rotationAbout(axis, (deg * Math.PI) / 180))
      const out = matVec(r, v).map((x) => Math.round(x) + 0)
      return {
        prompt: `Rotate $\\mathbf{v} = ${vector(v)}$ by ${turnWords(deg, axis)}.`,
        answer: { kind: 'vector', values: out },
        hints: [
          `The $${axis}$-component stays.`,
          'Write the rotation matrix, or turn the other two components as in the plane.',
        ],
        solution: [
          `The rotation matrix is $${bmatrix(r)}$.`,
          `So $R\\mathbf{v} = ${vector(out)}$.`,
        ],
        data: { axis: AXES.indexOf(axis), deg, ...flatVec('v', v) },
      }
    },
  },
  {
    id: 'nonsquare',
    title: 'Maps between spaces of different sizes',
    skills: ['maps-in-3d'],
    difficulty: 1,
    generate: (rng): Problem => {
      const variant = rng.int(0, 2)
      if (variant === 0) {
        // Keep two coordinates of space, in some order.
        const [i, j] = rng.shuffle([0, 1, 2]).slice(0, 2) as [number, number]
        const names = ['x', 'y', 'z']
        const m = [0, 1].map((r) => [0, 1, 2].map((c) => (c === [i, j][r] ? 1 : 0)))
        return {
          prompt: `Write the matrix of the map from $\\mathbb{R}^3$ to $\\mathbb{R}^2$ with $(x, y, z) \\mapsto (${names[i]}, ${names[j]})$.`,
          answer: { kind: 'matrix', rows: m },
          hints: [
            'The matrix is $2 \\times 3$: one row per output, one column per input.',
            'Column $j$ is the image of the $j$-th standard basis vector.',
          ],
          solution: [
            `$\\hat{\\imath}$, $\\hat{\\jmath}$ and $\\hat{k}$ go to ${[0, 1, 2].map((c) => `$${vector(m.map((row) => row[c]!))}$`).join(', ')}, so the matrix is $${bmatrix(m)}$.`,
          ],
          data: { variant, i, j },
        }
      }
      if (variant === 1) {
        const [a, b] = independentPair(rng)
        const m = transpose([a, b])
        return {
          prompt: `A linear map from $\\mathbb{R}^2$ to $\\mathbb{R}^3$ sends $\\hat{\\imath}$ to $${vector(a)}$ and $\\hat{\\jmath}$ to $${vector(b)}$. Write its matrix.`,
          answer: { kind: 'matrix', rows: m },
          hints: ['The matrix is $3 \\times 2$, with the two images as its columns.'],
          solution: [`The columns are the images of the basis: $${bmatrix(m)}$.`],
          data: { variant, ...flatVec('a', a), ...flatVec('b', b) },
        }
      }
      const k = rng.int(0, 2)
      const names = ['$yz$', '$xz$', '$xy$']
      const m = [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === c && r !== k ? 1 : 0)))
      return {
        prompt: `Write the $3 \\times 3$ matrix of the projection of space onto the ${names[k]}-plane.`,
        answer: { kind: 'matrix', rows: m },
        hints: [
          'The projection keeps the two coordinates of the plane and sets the third to $0$.',
          'Where do $\\hat{\\imath}$, $\\hat{\\jmath}$ and $\\hat{k}$ land?',
        ],
        solution: [
          `The axis perpendicular to the ${names[k]}-plane lands on $\\mathbf{0}$; the other two basis vectors stay.`,
          `So the matrix is $${bmatrix(m)}$.`,
        ],
        data: { variant, k },
      }
    },
  },
  {
    id: 'map-shape',
    title: 'From where to where',
    skills: ['maps-in-3d'],
    difficulty: 1,
    generate: (rng) => {
      const m = rng.int(1, 5)
      const n = rng.pick([1, 2, 3, 4, 5].filter((v) => v !== m))
      const options = rng.shuffle([
        `$\\mathbb{R}^{${n}} \\to \\mathbb{R}^{${m}}$`,
        `$\\mathbb{R}^{${m}} \\to \\mathbb{R}^{${n}}$`,
        `$\\mathbb{R}^{${m}} \\to \\mathbb{R}^{${m}}$`,
        `$\\mathbb{R}^{${n}} \\to \\mathbb{R}^{${n}}$`,
      ])
      return {
        prompt: `$A$ is a $${m} \\times ${n}$ matrix. The map $\\mathbf{x} \\mapsto A\\mathbf{x}$ goes from where to where?`,
        answer: {
          kind: 'choice',
          options,
          correct: options.indexOf(`$\\mathbb{R}^{${n}} \\to \\mathbb{R}^{${m}}$`),
        },
        hints: [
          '$A\\mathbf{x}$ needs one component of $\\mathbf{x}$ per column, and gives one output per row.',
        ],
        solution: [
          `$A$ has $${n}$ columns, so $\\mathbf{x}$ has $${n}$ components, and $${m}$ rows, so $A\\mathbf{x}$ has $${m}$.`,
          `The map goes from $\\mathbb{R}^{${n}}$ to $\\mathbb{R}^{${m}}$.`,
        ],
        data: { m, n },
      }
    },
  },
  {
    id: 'kernel-vector',
    title: 'A vector in the kernel',
    skills: ['kernel-and-image'],
    difficulty: 2,
    generate: (rng) => {
      if (rng.bool()) {
        let a = intVec(rng, 2, -3, 3)
        if (a.every((v) => v === 0)) a = [1, 2]
        const k = rng.nonZeroInt(-3, 3)
        const m = transpose([a, a.map((v) => k * v)])
        const x = [-k, 1]
        return {
          prompt: `Find the vector $\\mathbf{x} = (x_1, 1)$ in the kernel of $A = ${bmatrix(m)}$, that is, with $A\\mathbf{x} = \\mathbf{0}$.`,
          answer: { kind: 'vector', values: x },
          hints: ['Compare the two columns.', `$A\\mathbf{x} = x_1\\mathbf{a}_1 + \\mathbf{a}_2$.`],
          solution: [
            `The second column is $${k}$ times the first: $\\mathbf{a}_2 = ${k}\\mathbf{a}_1$.`,
            `So $x_1\\mathbf{a}_1 + \\mathbf{a}_2 = (${sum([
              [1, 'x_1'],
              [k, ''],
            ])})\\mathbf{a}_1 = \\mathbf{0}$ when $x_1 = ${-k}$: $\\mathbf{x} = ${vector(x)}$.`,
          ],
          data: { ...flatMat('A', m) },
        }
      }
      const [a, b] = independentPair(rng)
      const p = rng.nonZeroInt(-2, 2)
      const q = rng.nonZeroInt(-2, 2)
      const c = combine(p, a, q, b)
      const m = transpose([a, b, c])
      const x = [p, q, -1].map((v) => -v + 0)
      return {
        prompt: `Find the vector $\\mathbf{x} = (x_1, x_2, 1)$ in the kernel of $A = ${bmatrix(m)}$.`,
        answer: { kind: 'vector', values: x },
        hints: [
          'Write the third column as a combination of the first two.',
          '$A\\mathbf{x} = x_1\\mathbf{a}_1 + x_2\\mathbf{a}_2 + \\mathbf{a}_3$.',
        ],
        solution: [
          `The third column is $\\mathbf{a}_3 = ${sum([
            [p, '\\mathbf{a}_1'],
            [q, '\\mathbf{a}_2'],
          ])}$ (check it entry by entry).`,
          `So $${sum([
            [-p, '\\mathbf{a}_1'],
            [-q, '\\mathbf{a}_2'],
            [1, '\\mathbf{a}_3'],
          ])} = \\mathbf{0}$, and $\\mathbf{x} = ${vector(x)}$.`,
          'The first two columns are not parallel, so this is the only kernel vector with last component $1$.',
        ],
        data: { ...flatMat('A', m) },
      }
    },
  },
  {
    id: 'rank',
    title: 'The rank of a matrix',
    skills: ['kernel-and-image'],
    difficulty: 2,
    generate: (rng) => {
      const r = rng.int(1, 3)
      let cols: number[][]
      if (r === 1) {
        let u = intVec(rng, 3, -3, 3)
        if (u.every((v) => v === 0)) u = [1, -2, 1]
        cols = [rng.nonZeroInt(-2, 2), rng.nonZeroInt(-3, 3), rng.int(-2, 2)].map((k) =>
          u.map((v) => k * v + 0),
        )
      } else if (r === 2) {
        const [a, b] = independentPair(rng)
        cols = [a, b, combine(rng.nonZeroInt(-2, 2), a, rng.int(-2, 2), b)]
      } else {
        for (;;) {
          const [a, b] = independentPair(rng)
          const c = intVec(rng, 3, -3, 3)
          const det = dot3(
            c as [number, number, number],
            cross3(a as [number, number, number], b as [number, number, number]),
          )
          if (det !== 0) {
            cols = [a, b, c]
            break
          }
        }
      }
      const m = transpose(rng.shuffle(cols))
      const rk = rank(m)
      const imageWords = ['only $\\mathbf{0}$', 'a line', 'a plane', 'all of space'][rk]
      return {
        prompt: `What is the rank of $A = ${bmatrix(m)}$, the dimension of its image?`,
        answer: { kind: 'number', value: rk },
        hints: [
          'The image is the span of the columns.',
          'Is one column a combination of the others? Are all of them multiples of one?',
        ],
        solution: [
          rk === 3
            ? 'No column is a combination of the other two (the three are independent), so the image is all of space.'
            : rk === 2
              ? 'Two of the columns are independent, and the third is a combination of them, so the image is a plane.'
              : 'Every column is a multiple of one nonzero vector, so the image is a line.',
          `The image is ${imageWords}, and the rank is $${rk}$.`,
        ],
        data: { r, ...flatMat('A', m) },
      }
    },
  },
  {
    id: 'reachable',
    title: 'Can the map reach this vector?',
    skills: ['kernel-and-image'],
    difficulty: 3,
    generate: (rng) => {
      const [a, b] = independentPair(rng)
      const c = combine(rng.nonZeroInt(-2, 2), a, rng.nonZeroInt(-2, 2), b)
      const m = transpose([a, b, c])
      const s = rng.nonZeroInt(-2, 2)
      const t = rng.int(-2, 2)
      const reach = rng.bool()
      let target = combine(s, a, t, b)
      if (!reach) {
        const n = cross3(a as [number, number, number], b as [number, number, number])
        const k = [0, 1, 2].find((i) => n[i] !== 0)!
        target = target.map((v, i) => (i === k ? v + 1 : v))
      }
      const options = ['Yes', 'No']
      return {
        prompt: `Is $\\mathbf{b} = ${vector(target)}$ in the image of $A = ${bmatrix(m)}$, that is, is there an $\\mathbf{x}$ with $A\\mathbf{x} = \\mathbf{b}$?`,
        answer: { kind: 'choice', options, correct: reach ? 0 : 1 },
        hints: [
          'The third column is a combination of the first two, so the image is the plane they span.',
          'Is $\\mathbf{b}$ a combination of the first two columns? Try the first two components, then check the third.',
        ],
        solution: reach
          ? [
              `$\\mathbf{b} = ${sum([
                [s, '\\mathbf{a}_1'],
                [t, '\\mathbf{a}_2'],
              ])}$.`,
              `So $\\mathbf{x} = ${vector([s, t, 0])}$ gives $A\\mathbf{x} = \\mathbf{b}$: yes.`,
            ]
          : [
              'The image is the plane spanned by $\\mathbf{a}_1$ and $\\mathbf{a}_2$, with normal $\\mathbf{n} = \\mathbf{a}_1 \\times \\mathbf{a}_2 = ' +
                vector(cross3(a as [number, number, number], b as [number, number, number])) +
                '$.',
              `$\\mathbf{n} \\cdot \\mathbf{b} = ${num(dot3(cross3(a as [number, number, number], b as [number, number, number]), target as [number, number, number]))} \\ne 0$, so $\\mathbf{b}$ is not in that plane: no.`,
            ],
        data: { reach: reach ? 1 : 0, ...flatMat('A', m), ...flatVec('b', target) },
      }
    },
  },
  {
    id: 'kernel-or-image',
    title: 'Kernel and image of a described map',
    skills: ['kernel-and-image'],
    difficulty: 1,
    generate: (rng) => {
      const i = rng.int(0, DESCRIBED.length - 1)
      const map = DESCRIBED[i]!
      const askKernel = rng.bool()
      const options: string[] = askKernel ? [...KERNEL_OPTIONS] : [...IMAGE_OPTIONS]
      const correct = options.indexOf(askKernel ? map.kernel : map.image)
      return {
        prompt: `What is the ${askKernel ? 'kernel' : 'image'} of ${map.words}?`,
        answer: { kind: 'choice', options, correct },
        hints: [
          askKernel
            ? 'Which inputs land on $\\mathbf{0}$?'
            : 'Which outputs can the map produce? They are the span of the columns.',
        ],
        solution: [
          `The matrix is $${bmatrix(map.m)}$.`,
          askKernel
            ? `It sends exactly ${map.kernel} to $\\mathbf{0}$.`
            : `Its columns span ${map.image}.`,
        ],
        data: { i, askKernel: askKernel ? 1 : 0 },
      }
    },
  },
  {
    id: 'same-predictions',
    title: 'Weights that give the same predictions',
    skills: ['kernel-and-image'],
    difficulty: 3,
    generate: (rng) => {
      let rows: number[][]
      for (;;) {
        rows = Array.from({ length: 3 }, () => {
          const c1 = rng.int(0, 4)
          const c2 = rng.int(0, 4)
          return [c1, c2, c1 + c2]
        })
        // The first two columns must be independent, so the kernel is one line.
        const [c1, c2] = [rows.map((r) => r[0]!), rows.map((r) => r[1]!)]
        if (
          cross3(c1 as [number, number, number], c2 as [number, number, number]).some(
            (v) => v !== 0,
          )
        )
          break
      }
      const w = [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)]
      let s = rng.int(-2, 3)
      if (s === w[2]) s += 1
      const shift = w[2]! - s
      const ab = [w[0]! + shift, w[1]! + shift]
      return {
        prompt: `The data table $X = ${bmatrix(rows)}$ has columns class hours, home hours and total hours, so the third column is the sum of the first two. A model with weights $\\mathbf{w} = ${vector(w)}$ predicts $X\\mathbf{w}$. Find $a$ and $b$ such that $\\mathbf{w}' = (a, b, ${s})$ gives exactly the same predictions. Enter $(a, b)$.`,
        answer: { kind: 'vector', values: ab },
        hints: [
          '$X(1, 1, -1) = \\mathbf{0}$, since column 1 plus column 2 minus column 3 is zero.',
          "$X\\mathbf{w}' = X\\mathbf{w}$ exactly when $\\mathbf{w}' - \\mathbf{w}$ is in the kernel of $X$.",
        ],
        solution: [
          `The first two columns are independent, so the kernel of $X$ is the line along $(1, 1, -1)$, and $\\mathbf{w}' = \\mathbf{w} + t(1, 1, -1)$.`,
          `The third component gives $${w[2]} - t = ${s}$, so $t = ${shift}$.`,
          `Then $\\mathbf{w}' = ${vector(w)} + ${paren(shift)}(1, 1, -1) = ${vector([...ab, s])}$, so $(a, b) = ${vector(ab)}$.`,
        ],
        data: { s, ...flatMat('X', rows), ...flatVec('w', w) },
      }
    },
  },
  {
    id: 'proof-kernel-image',
    title: 'A short proof about kernels and images',
    skills: ['kernel-and-image'],
    difficulty: 3,
    generate: (rng) => {
      const k = rng.int(0, PROOFS.length - 1)
      const p = PROOFS[k]!
      return {
        prompt: p.prompt,
        answer: { kind: 'self' },
        hints: [...p.hints],
        solution: [...p.solution],
        data: { k },
      }
    },
  },
])
