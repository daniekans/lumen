import { add3, cross3, detN, dot3, fromColumns, scale3, sub3, type Vec3 } from '@/lib/math'
import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { num, paren, root, vector } = tex

/** A vector flattened into problem data: { P0: 1, P1: -2, P2: 3 }. */
const flat3 = (name: string, v: Vec3) => ({
  [`${name}0`]: v[0],
  [`${name}1`]: v[1],
  [`${name}2`]: v[2],
})

const intVec = (rng: Rng, lo: number, hi: number): Vec3 => [
  rng.int(lo, hi),
  rng.int(lo, hi),
  rng.int(lo, hi),
]
const isZero3 = (v: Vec3) => v[0] === 0 && v[1] === 0 && v[2] === 0

/** The three components of v x w written out: v2 w3 - v3 w2, and so on. */
const crossLines = (v: Vec3, w: Vec3, name = '\\mathbf{v} \\times \\mathbf{w}') => {
  const c = cross3(v, w)
  const part = (i: number, j: number) =>
    `${paren(v[i]!)} \\cdot ${paren(w[j]!)} - ${paren(v[j]!)} \\cdot ${paren(w[i]!)}`
  return [
    'Each component is a $2 \\times 2$ determinant of the other two coordinates: $(v_2w_3 - v_3w_2,\\ v_3w_1 - v_1w_3,\\ v_1w_2 - v_2w_1)$.',
    `$${name} = (${part(1, 2)},\\ ${part(2, 0)},\\ ${part(0, 1)}) = ${vector(c)}$.`,
  ]
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const AXES = ['x', 'y', 'z'] as const

/** Every fact a short product-rule problem can ask about, with its value. */
type Rule =
  | { kind: 'product' }
  | { kind: 'power'; k: number }
  | { kind: 'scalar'; c: number }
  | { kind: 'transpose-product' }
  | { kind: 'inverse' }
  | { kind: 'similar' }
const RULE_CODE = {
  product: 0,
  power: 1,
  scalar: 2,
  'transpose-product': 3,
  inverse: 4,
  similar: 5,
} as const

const PROOFS = [
  {
    prompt:
      'Prove from the three rules of the determinant (linear in each column, two equal columns give $0$, $\\det I = 1$) that swapping two columns of a square matrix flips the sign of its determinant.',
    hints: [
      'Put $\\mathbf{u} + \\mathbf{v}$ in both of the two columns: two equal columns.',
      'Expand with rule 2 in each of the two columns.',
    ],
    solution: [
      'Write only the two columns that are swapped, $\\mathbf{u}$ and $\\mathbf{v}$; the others stay fixed. Two equal columns give $0$, so $0 = \\det[\\mathbf{u} + \\mathbf{v}\\ \\ \\mathbf{u} + \\mathbf{v}]$.',
      'By rule 2 in each column, $0 = \\det[\\mathbf{u}\\ \\mathbf{u}] + \\det[\\mathbf{u}\\ \\mathbf{v}] + \\det[\\mathbf{v}\\ \\mathbf{u}] + \\det[\\mathbf{v}\\ \\mathbf{v}]$.',
      'The first and last terms have equal columns, so they are $0$. What is left: $\\det[\\mathbf{v}\\ \\mathbf{u}] = -\\det[\\mathbf{u}\\ \\mathbf{v}]$.',
    ],
  },
  {
    prompt:
      'Prove that $\\det(cA) = c^n\\det A$ for an $n \\times n$ matrix $A$ and a number $c$. Give an example showing that $\\det(cA) = c\\det A$ is false in general.',
    hints: [
      'Multiplying the matrix by $c$ multiplies every column by $c$.',
      'Rule 2 takes a factor out of one column at a time.',
    ],
    solution: [
      'The columns of $cA$ are $c\\mathbf{a}_1, \\ldots, c\\mathbf{a}_n$.',
      'Rule 2 (linear in each column) takes the factor $c$ out of the first column, then the second, and so on: $\\det[c\\mathbf{a}_1\\ \\cdots\\ c\\mathbf{a}_n] = c \\cdot c \\cdots c\\,\\det[\\mathbf{a}_1\\ \\cdots\\ \\mathbf{a}_n] = c^n\\det A$, one factor per column.',
      'Example: $\\det(2I_2) = 4$, not $2\\det I_2 = 2$. In the picture, doubling every length in the plane multiplies areas by $4$.',
    ],
  },
  {
    prompt:
      'Suppose $B$ undoes $A$: $BA = I$, for $n \\times n$ matrices. Prove that $\\det A \\ne 0$ and $\\det B = \\frac{1}{\\det A}$.',
    hints: ['Take the determinant of both sides of $BA = I$ and use the product rule.'],
    solution: [
      'By the product rule, $\\det(BA) = \\det B \\det A$, and $\\det I = 1$.',
      'So $\\det B \\det A = 1$. A product of two numbers that equals $1$ has no factor $0$, so $\\det A \\ne 0$.',
      'Dividing by $\\det A$: $\\det B = \\frac{1}{\\det A}$. (That $\\det A \\ne 0$ is also enough for such a $B$ to exist is shown in Systems and inverses.)',
    ],
  },
]

export const problems = defineProblems([
  {
    id: 'cross',
    title: 'A cross product',
    skills: ['cross-product'],
    difficulty: 1,
    generate: (rng) => {
      let v = intVec(rng, -4, 4)
      let w = intVec(rng, -4, 4)
      while (isZero3(cross3(v, w))) {
        v = intVec(rng, -4, 4)
        w = intVec(rng, -4, 4)
      }
      return {
        prompt: `Compute $\\mathbf{v} \\times \\mathbf{w}$ for $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${vector(w)}$.`,
        answer: { kind: 'vector', values: cross3(v, w) },
        hints: [
          '$\\mathbf{v} \\times \\mathbf{w} = (v_2w_3 - v_3w_2,\\ v_3w_1 - v_1w_3,\\ v_1w_2 - v_2w_1)$.',
          'Check: the result has dot product $0$ with both $\\mathbf{v}$ and $\\mathbf{w}$.',
        ],
        solution: crossLines(v, w),
        data: { ...flat3('v', v), ...flat3('w', w) },
      }
    },
  },
  {
    id: 'triangle-area',
    title: 'The area of a mesh triangle',
    skills: ['cross-product'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const p = intVec(rng, -3, 3)
        const q = intVec(rng, -3, 3)
        const r = intVec(rng, -3, 3)
        const n = cross3(sub3(q, p), sub3(r, p))
        if (isZero3(n)) continue
        const n2 = dot3(n, n)
        return {
          prompt: `A triangle of a 3D model has corners $P = ${vector(p)}$, $Q = ${vector(q)}$ and $R = ${vector(r)}$, in meters. What is its area in square meters, exactly or to two decimal places?`,
          answer: { kind: 'number', value: Math.sqrt(n2) / 2, tolerance: 0.006 },
          hints: [
            'The parallelogram on $\\mathbf{q} - \\mathbf{p}$ and $\\mathbf{r} - \\mathbf{p}$ has area $|(\\mathbf{q} - \\mathbf{p}) \\times (\\mathbf{r} - \\mathbf{p})|$.',
            'The triangle is half of it.',
          ],
          solution: [
            `$\\mathbf{q} - \\mathbf{p} = ${vector(sub3(q, p))}$ and $\\mathbf{r} - \\mathbf{p} = ${vector(sub3(r, p))}$.`,
            ...crossLines(sub3(q, p), sub3(r, p), '\\mathbf{n}').slice(1),
            `$|\\mathbf{n}| = \\sqrt{${n.map((c) => `${paren(c)}^2`).join(' + ')}} = ${root(n2)}$, so the area is $\\frac{1}{2}${root(n2) === '1' ? '' : `\\cdot ${root(n2)}`} \\approx ${num(Math.sqrt(n2) / 2)}$ square meters.`,
          ],
          data: { ...flat3('p', p), ...flat3('q', q), ...flat3('r', r) },
        }
      }
    },
  },
  {
    id: 'box-volume',
    title: 'The volume of a unit cell',
    skills: ['determinant', 'cross-product'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const u = intVec(rng, -2, 4)
        const v = intVec(rng, -2, 4)
        const w = intVec(rng, -2, 4)
        const d = detN(fromColumns(u, v, w))
        if (d === 0) continue
        const vw = cross3(v, w)
        return {
          prompt: `The unit cell of a crystal is the parallelepiped on the edges $\\mathbf{u} = ${vector(u)}$, $\\mathbf{v} = ${vector(v)}$ and $\\mathbf{w} = ${vector(w)}$, in ångströms. What is its volume in cubic ångströms?`,
          answer: { kind: 'number', value: Math.abs(d) },
          hints: [
            'The volume is $|\\det[\\mathbf{u}\\ \\mathbf{v}\\ \\mathbf{w}]| = |\\mathbf{u} \\cdot (\\mathbf{v} \\times \\mathbf{w})|$.',
          ],
          solution: [
            ...crossLines(v, w).slice(1),
            `$\\mathbf{u} \\cdot (\\mathbf{v} \\times \\mathbf{w}) = ${u.map((c, i) => `${paren(c)} \\cdot ${paren(vw[i]!)}`).join(' + ')} = ${d}$.`,
            `The volume is $|${d}| = ${Math.abs(d)}$ cubic ångströms.`,
          ],
          data: { ...flat3('u', u), ...flat3('v', v), ...flat3('w', w) },
        }
      }
    },
  },
  {
    id: 'tetrahedron',
    title: 'The volume of a tetrahedron',
    skills: ['determinant', 'cross-product'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const pts = [0, 1, 2, 3].map(() => intVec(rng, -2, 3))
        const [a, b, c, e] = pts as [Vec3, Vec3, Vec3, Vec3]
        const [u, v, w] = [sub3(b, a), sub3(c, a), sub3(e, a)]
        const d = dot3(u, cross3(v, w))
        if (d === 0) continue
        return {
          prompt: `What is the volume of the tetrahedron with corners $A = ${vector(a)}$, $B = ${vector(b)}$, $C = ${vector(c)}$ and $D = ${vector(e)}$?`,
          answer: { kind: 'number', value: Math.abs(d) / 6 },
          hints: [
            'Take the three edges from $A$. The box on them has volume $|\\det|$ of the edges.',
            'The tetrahedron is one sixth of that box.',
          ],
          solution: [
            `The edges from $A$: $\\mathbf{u} = ${vector(u)}$, $\\mathbf{v} = ${vector(v)}$, $\\mathbf{w} = ${vector(w)}$.`,
            `$\\mathbf{v} \\times \\mathbf{w} = ${vector(cross3(v, w))}$ and $\\mathbf{u} \\cdot (\\mathbf{v} \\times \\mathbf{w}) = ${d}$.`,
            `The volume is $\\frac{1}{6}|${d}| = ${num(Math.abs(d) / 6)}$.`,
          ],
          data: { ...flat3('a', a), ...flat3('b', b), ...flat3('c', c), ...flat3('d', e) },
        }
      }
    },
  },
  {
    id: 'coplanar-k',
    title: 'Four points in one plane',
    skills: ['cross-product', 'determinant'],
    difficulty: 3,
    generate: (rng) => {
      for (;;) {
        const a = intVec(rng, -2, 3)
        const b = intVec(rng, -2, 3)
        const c = intVec(rng, -2, 3)
        const n = cross3(sub3(b, a), sub3(c, a))
        if (isZero3(n)) continue
        const s = rng.nonZeroInt(-2, 2)
        const t = rng.nonZeroInt(-2, 2)
        const e = add3(a, add3(scale3(sub3(b, a), s), scale3(sub3(c, a), t)))
        const j = rng.pick([0, 1, 2].filter((i) => n[i] !== 0))
        const k = e[j]!
        const shown = e.map((v, i) => (i === j ? 'k' : num(v)))
        const rhs = dot3(n, a)
        const others = [0, 1, 2].filter((i) => i !== j).reduce((sum, i) => sum + n[i]! * e[i]!, 0)
        return {
          prompt: `For which $k$ do $A = ${vector(a)}$, $B = ${vector(b)}$, $C = ${vector(c)}$ and $D = (${shown.join(', ')})$ lie in one plane?`,
          answer: { kind: 'number', value: k },
          hints: [
            'The plane of $A$, $B$, $C$ has the normal $\\mathbf{n} = (\\mathbf{b} - \\mathbf{a}) \\times (\\mathbf{c} - \\mathbf{a})$.',
            '$D$ is in the plane when $\\mathbf{n} \\cdot \\mathbf{d} = \\mathbf{n} \\cdot \\mathbf{a}$ (the triple product of the three edges from $A$ is $0$).',
          ],
          solution: [
            ...crossLines(sub3(b, a), sub3(c, a), '\\mathbf{n}').slice(1),
            `The plane is $\\mathbf{n} \\cdot \\mathbf{x} = \\mathbf{n} \\cdot \\mathbf{a} = ${rhs}$.`,
            `For $D$: $${others} + ${paren(n[j]!)}k = ${rhs}$, so $k = ${num(k)}$.`,
          ],
          data: { j, ...flat3('a', a), ...flat3('b', b), ...flat3('c', c), ...flat3('d', e) },
        }
      }
    },
  },
  {
    id: 'plane-through-points',
    title: 'The plane through three points',
    skills: ['cross-product'],
    difficulty: 2,
    generate: (rng) => {
      for (;;) {
        const p = intVec(rng, -2, 3)
        const q = intVec(rng, -2, 3)
        const r = intVec(rng, -2, 3)
        const raw = cross3(sub3(q, p), sub3(r, p))
        if (isZero3(raw)) continue
        const g = gcd(gcd(raw[0], raw[1]), raw[2])
        const j = raw.findIndex((v) => v !== 0)
        const sign = Math.sign(raw[j]!)
        const n = scale3(raw, sign / g)
        const d = dot3(n, p)
        return {
          prompt: `Find the plane through $P = ${vector(p)}$, $Q = ${vector(q)}$ and $R = ${vector(r)}$ in the form $ax + by + cz = d$ with ${AXES[j]}-coefficient $${n[j]}$ and whole numbers. Type $(a, b, c, d)$.`,
          answer: { kind: 'vector', values: [...n, d] },
          hints: [
            '$(\\mathbf{q} - \\mathbf{p}) \\times (\\mathbf{r} - \\mathbf{p})$ is a normal vector $(a, b, c)$. Scale it so the coefficient matches.',
            '$d = \\mathbf{n} \\cdot \\mathbf{p}$, since $P$ is on the plane.',
          ],
          solution: [
            `$\\mathbf{q} - \\mathbf{p} = ${vector(sub3(q, p))}$ and $\\mathbf{r} - \\mathbf{p} = ${vector(sub3(r, p))}$.`,
            ...crossLines(sub3(q, p), sub3(r, p), '\\mathbf{n}').slice(1),
            sign / g === 1
              ? `It already has ${AXES[j]}-coefficient $${n[j]}$.`
              : `Multiplied by $${num(sign / g)}$: $${vector(n)}$, with ${AXES[j]}-coefficient $${n[j]}$.`,
            `$d = ${vector(n)} \\cdot ${vector(p)} = ${d}$, so the answer is $${vector([...n, d])}$.`,
          ],
          data: { j, ...flat3('p', p), ...flat3('q', q), ...flat3('r', r) },
        }
      }
    },
  },
  {
    id: 'torque',
    title: 'Torque on a bolt',
    skills: ['cross-product'],
    difficulty: 2,
    generate: (rng): Problem => {
      if (rng.bool()) {
        const L = rng.pick([0.2, 0.25, 0.3, 0.4])
        const F = rng.pick([20, 30, 40, 50, 60])
        const deg = rng.pick([30, 90, 150])
        const sin = deg === 90 ? 1 : 0.5
        const tau = L * F * sin
        return {
          prompt: `A force of $${F}$ newtons acts at the end of a wrench handle $${num(L, 1)}$ meters long, at an angle of $${deg}^\\circ$ to the handle. How many newton meters of torque does it give?`,
          answer: { kind: 'number', value: tau },
          hints: ['$|\\mathbf{r} \\times \\mathbf{F}| = |\\mathbf{r}||\\mathbf{F}|\\sin\\theta$.'],
          solution: [
            `$|\\boldsymbol{\\tau}| = ${num(L, 1)} \\cdot ${F} \\cdot \\sin ${deg}^\\circ = ${num(L, 1)} \\cdot ${F} \\cdot ${num(sin)} = ${num(tau, 1)}$ newton meters.`,
            deg === 90
              ? 'At a right angle the whole force turns the bolt.'
              : `Only the part of the force perpendicular to the handle counts, $${F} \\sin ${deg}^\\circ = ${num(F * sin)}$ newtons.`,
          ],
          data: { variant: 0, L, F, deg },
        }
      }
      for (;;) {
        const r: Vec3 = [rng.int(-4, 4) / 10, rng.int(-4, 4) / 10, rng.int(-2, 2) / 10]
        const F: Vec3 = [rng.int(-4, 4) * 5, rng.int(-4, 4) * 5, rng.int(-4, 4) * 5]
        const tau = cross3(r, F).map((v) => Number(v.toFixed(9)) + 0) as unknown as Vec3
        if (isZero3(tau)) continue
        return {
          prompt: `A wrench handle points from the bolt along $\\mathbf{r} = ${vector(r, 1)}$ meters, and a force $\\mathbf{F} = ${vector(F)}$ newtons acts at its end. Find the torque $\\boldsymbol{\\tau} = \\mathbf{r} \\times \\mathbf{F}$ in newton meters.`,
          answer: { kind: 'vector', values: tau, tolerance: 1e-9 },
          hints: [
            '$\\mathbf{r} \\times \\mathbf{F} = (r_2F_3 - r_3F_2,\\ r_3F_1 - r_1F_3,\\ r_1F_2 - r_2F_1)$.',
          ],
          solution: crossLines(r, F, '\\boldsymbol{\\tau}').map((line) =>
            line.replace(/v_(\d)w_(\d)/g, 'r_$1F_$2').replace(/v_(\d)/g, 'r_$1'),
          ),
          data: { variant: 1, ...flat3('r', r), ...flat3('F', F) },
        }
      }
    },
  },
  {
    id: 'product-rules',
    title: 'Products, powers and inverses',
    skills: ['determinant-rules'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(2, 4)
      const a = rng.nonZeroInt(-5, 5, [1, -1])
      const b = rng.nonZeroInt(-4, 4)
      const rule: Rule = rng.pick<Rule>([
        { kind: 'product' },
        { kind: 'power', k: rng.int(2, 3) },
        { kind: 'scalar', c: rng.pick([-2, 2, 3]) },
        { kind: 'transpose-product' },
        { kind: 'inverse' },
        { kind: 'similar' },
      ])
      const size = `$${n} \\times ${n}$`
      const given = `$A$ and $B$ are ${size} matrices with $\\det A = ${a}$ and $\\det B = ${b}$.`
      const [ask, value, lines]: [string, number, string[]] = (() => {
        switch (rule.kind) {
          case 'product':
            return [
              '\\det(AB)',
              a * b,
              [`$\\det(AB) = \\det A \\det B = ${paren(a)} \\cdot ${paren(b)} = ${a * b}$.`],
            ]
          case 'power':
            return [
              `\\det(A^${rule.k})`,
              a ** rule.k,
              [
                `Applying $A$ ${rule.k === 2 ? 'twice' : 'three times'} scales volumes by $\\det A$ each time: $\\det(A^${rule.k}) = ${paren(a)}^${rule.k} = ${a ** rule.k}$.`,
              ],
            ]
          case 'scalar':
            return [
              `\\det(${rule.c}A)`,
              rule.c ** n * a,
              [
                `All $${n}$ columns are multiplied by $${rule.c}$, so $\\det(${rule.c}A) = ${paren(rule.c)}^${n}\\det A = ${rule.c ** n} \\cdot ${paren(a)} = ${rule.c ** n * a}$.`,
              ],
            ]
          case 'transpose-product':
            return [
              '\\det(A^TB)',
              a * b,
              [
                `$\\det A^T = \\det A$, so $\\det(A^TB) = \\det A \\det B = ${paren(a)} \\cdot ${paren(b)} = ${a * b}$.`,
              ],
            ]
          case 'inverse':
            return [
              '\\det(A^{-1})',
              1 / a,
              [`$A^{-1}A = I$, so $\\det(A^{-1})\\det A = 1$ and $\\det(A^{-1}) = ${num(1 / a)}$.`],
            ]
          case 'similar':
            return [
              '\\det(A^{-1}BA)',
              b,
              [
                `$\\det(A^{-1}BA) = \\frac{1}{\\det A} \\cdot \\det B \\cdot \\det A = \\det B = ${b}$: the same map seen in another basis.`,
              ],
            ]
        }
      })()
      return {
        prompt: `${given} What is $${ask}$?`,
        answer: { kind: 'number', value },
        hints: [
          'Product rule: $\\det(AB) = \\det A \\det B$. Also $\\det A^T = \\det A$ and $\\det(cA) = c^n \\det A$.',
        ],
        solution: lines,
        data: {
          n,
          a,
          b,
          rule: RULE_CODE[rule.kind],
          k: 'k' in rule ? rule.k : 0,
          c: 'c' in rule ? rule.c : 0,
        },
      }
    },
  },
  {
    id: 'basis-products',
    title: 'Order and brackets',
    skills: ['cross-product'],
    difficulty: 2,
    generate: (rng) => {
      const names = ['\\hat{\\imath}', '\\hat{\\jmath}', '\\hat{k}']
      const basis: Vec3[] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]
      const [a, b, c] = [rng.int(0, 2), rng.int(0, 2), rng.int(0, 2)]
      const leftFirst = rng.bool()
      const [ea, eb, ec] = [basis[a]!, basis[b]!, basis[c]!]
      const inner = leftFirst ? cross3(ea, eb) : cross3(eb, ec)
      const result = leftFirst ? cross3(inner, ec) : cross3(ea, inner)
      const shown = leftFirst
        ? `(${names[a]} \\times ${names[b]}) \\times ${names[c]}`
        : `${names[a]} \\times (${names[b]} \\times ${names[c]})`
      const word = (v: Vec3) => {
        const k = v.findIndex((x) => x !== 0)
        if (k < 0) return '\\mathbf{0}'
        return `${v[k]! < 0 ? '-' : ''}${names[k]}`
      }
      return {
        prompt: `Compute $${shown}$. Type the result as $(a, b, c)$.`,
        answer: { kind: 'vector', values: result.map((x) => x + 0) },
        hints: [
          '$\\hat{\\imath} \\times \\hat{\\jmath} = \\hat{k}$, $\\hat{\\jmath} \\times \\hat{k} = \\hat{\\imath}$, $\\hat{k} \\times \\hat{\\imath} = \\hat{\\jmath}$; reversing the order flips the sign, and $\\mathbf{v} \\times \\mathbf{v} = \\mathbf{0}$.',
          'Work out the bracket first.',
        ],
        solution: [
          leftFirst
            ? `$${names[a]} \\times ${names[b]} = ${word(inner)}$.`
            : `$${names[b]} \\times ${names[c]} = ${word(inner)}$.`,
          `Then $${shown} = ${word(result)} = ${vector(result.map((x) => x + 0))}$.`,
        ],
        data: { a, b, c, leftFirst: leftFirst ? 1 : 0 },
      }
    },
  },
  {
    id: 'handedness',
    title: 'Right- or left-handed',
    skills: ['determinant', 'cross-product'],
    difficulty: 1,
    generate: (rng) => {
      for (;;) {
        const u = intVec(rng, -3, 3)
        const v = intVec(rng, -3, 3)
        const w = intVec(rng, -3, 3)
        const d = dot3(u, cross3(v, w))
        if (d === 0) continue
        const options = ['Right-handed', 'Left-handed']
        return {
          prompt: `Are $\\mathbf{u} = ${vector(u)}$, $\\mathbf{v} = ${vector(v)}$, $\\mathbf{w} = ${vector(w)}$, in this order, right-handed or left-handed?`,
          answer: { kind: 'choice', options, correct: d > 0 ? 0 : 1 },
          hints: [
            'The triple is right-handed exactly when $\\det[\\mathbf{u}\\ \\mathbf{v}\\ \\mathbf{w}] = \\mathbf{w} \\cdot (\\mathbf{u} \\times \\mathbf{v}) > 0$.',
          ],
          solution: [
            `$\\mathbf{u} \\times \\mathbf{v} = ${vector(cross3(u, v))}$, and $\\mathbf{w} \\cdot (\\mathbf{u} \\times \\mathbf{v}) = ${d}$.`,
            d > 0
              ? 'Positive: right-handed, like $\\hat{\\imath}, \\hat{\\jmath}, \\hat{k}$.'
              : 'Negative: left-handed, a mirror image of a right-handed triple.',
          ],
          data: { ...flat3('u', u), ...flat3('v', v), ...flat3('w', w) },
        }
      }
    },
  },
  {
    id: 'proof-short',
    title: 'A short proof',
    skills: ['determinant-rules'],
    difficulty: 3,
    generate: (rng) => {
      const which = rng.int(0, PROOFS.length - 1)
      const proof = PROOFS[which]!
      return {
        prompt: proof.prompt,
        answer: { kind: 'self' },
        hints: proof.hints,
        solution: proof.solution,
        data: { which },
      }
    },
  },
])
