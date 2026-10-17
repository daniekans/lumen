import { intervalTex, type Interval } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, paren, poly, sum } = tex

export type Op = '<' | '\\leq' | '>' | '\\geq'
const OPS: readonly Op[] = ['<', '\\leq', '>', '\\geq']
const strict = (op: Op) => op === '<' || op === '>'
const flip: Record<Op, Op> = { '<': '>', '\\leq': '\\geq', '>': '<', '\\geq': '\\leq' }

/** ax + b as TeX: x + 3, 2x - 1. */
const linear = (a: number, b: number) =>
  sum([
    [a, 'x'],
    [b, ''],
  ])

/** The factor x - z in a product: (x - 2), or x alone for z = 0. */
const factor = (z: number) => (z === 0 ? 'x' : `(${linear(1, -z)})`)

/** (x - u)(x - v), with a bare x first: x(x - 3). */
const product = (u: number, v: number) =>
  v === 0 ? `${factor(v)}${factor(u)}` : `${factor(u)}${factor(v)}`

const R = Infinity

/** An integer in [lo, hi] other than `not`. */
const intExcept = (rng: Rng, lo: number, hi: number, not: number) => {
  let v = not
  while (v === not) v = rng.int(lo, hi)
  return v
}

/** An end of an interval at p/q, written as a reduced fraction. */
const end = (p: number, q = 1) => ({ value: p / q, tex: frac(p, q) })
type End = ReturnType<typeof end>

const left = (e: End, closed: boolean): Interval => ({
  from: -R,
  to: e.value,
  closedTo: closed,
  toTex: e.tex,
})
const right = (e: End, closed: boolean): Interval => ({
  from: e.value,
  to: R,
  closedFrom: closed,
  fromTex: e.tex,
})
const between = (a: End, b: End, closedA: boolean, closedB: boolean): Interval => ({
  from: a.value,
  to: b.value,
  closedFrom: closedA,
  closedTo: closedB,
  fromTex: a.tex,
  toTex: b.tex,
})

/** A choice between solution sets in interval notation; `correct` is the first set. */
const setChoice = (rng: Rng, correct: readonly Interval[], others: readonly Interval[][]) => {
  const answer = `$${intervalTex(correct)}$`
  const rest = [...new Set(others.map((s) => `$${intervalTex(s)}$`))].filter((o) => o !== answer)
  const options = rng.shuffle([answer, ...rng.shuffle(rest).slice(0, 3)])
  return { kind: 'choice' as const, options, correct: options.indexOf(answer) }
}

/** The four sets "inside or outside [a, b], ends in or out", for quadratics and absolute values. */
const insideOutside = (a: End, b: End) => ({
  inside: (closed: boolean) => [between(a, b, closed, closed)],
  outside: (closed: boolean) => [left(a, closed), right(b, closed)],
})

const DISTANCE: Record<Op, string> = {
  '<': 'less than',
  '\\leq': 'at most',
  '>': 'more than',
  '\\geq': 'at least',
}

/** The text of x satisfying a relation, for solutions: x < 3, x \geq -\frac{1}{2}. */
const relation = (op: Op, e: End) => `x ${op} ${e.tex}`

export const problems = defineProblems([
  {
    id: 'linear-equation',
    title: 'Solve a linear equation',
    skills: ['equations'],
    difficulty: 1,
    generate: (rng) => {
      const x = rng.int(-6, 6)
      const a = rng.nonZeroInt(-5, 6)
      const c = rng.nonZeroInt(-5, 6, [a])
      const b = rng.int(-9, 9)
      const d = a * x + b - c * x
      return {
        prompt: `Solve $${linear(a, b)} = ${linear(c, d)}$.`,
        answer: { kind: 'number', value: x },
        hints: ['Collect the $x$ terms on one side and the constants on the other.'],
        solution: [
          `Move the $x$ terms to the left and the constants to the right: $${linear(a - c, 0)} = ${d - b}$.`,
          `Divide by $${a - c}$: $x = ${x}$.`,
        ],
        data: { a, b, c, d },
      }
    },
  },
  {
    id: 'quadratic-equation',
    title: 'Solve a quadratic by factoring',
    skills: ['equations'],
    difficulty: 1,
    generate: (rng) => {
      const p = rng.int(-7, 7)
      const q = intExcept(rng, -7, 7, p)
      const [b, c] = [-(p + q), p * q]
      return {
        prompt: `Solve $${poly([1, b, c])} = 0$. List every solution, separated by commas.`,
        answer: { kind: 'list', values: [p, q] },
        hints: [
          `Find two numbers whose product is $${c}$ and whose sum is $${b}$.`,
          'A product is zero exactly when one of its factors is zero.',
        ],
        solution: [`$${poly([1, b, c])} = ${product(p, q)}$.`, `So $x = ${p}$ or $x = ${q}$.`],
        data: { b, c },
      }
    },
  },
  {
    id: 'quadratic-formula',
    title: 'The quadratic formula',
    skills: ['equations'],
    difficulty: 2,
    generate: (rng) => {
      let b: number, c: number, D: number
      do {
        b = rng.int(-6, 6)
        c = rng.nonZeroInt(-6, 6)
        D = b * b - 4 * c
      } while (D <= 0 || Number.isInteger(Math.sqrt(D)))
      const r = Math.sqrt(D)
      return {
        prompt: `Solve $${poly([1, b, c])} = 0$. List both solutions, separated by commas. Roots such as $\\sqrt{5}$ are fine.`,
        // The shown answer is rounded to six places, so allow for that.
        answer: { kind: 'list', values: [(-b - r) / 2, (-b + r) / 2], tolerance: 1e-5 },
        hints: [
          'The roots are not integers. Use $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.',
          `Here $b^2 - 4ac = ${D}$.`,
        ],
        solution: [
          `$a = 1$, $b = ${b}$, $c = ${c}$, so $b^2 - 4ac = ${paren(b)}^2 - 4 \\cdot ${paren(c)} = ${D}$.`,
          `$x = \\dfrac{${-b} \\pm \\sqrt{${D}}}{2}$.`,
        ],
        data: { b, c },
      }
    },
  },
  {
    id: 'rational-equation',
    title: 'A rational equation',
    skills: ['equations', 'rational-expressions'],
    difficulty: 2,
    generate: (rng) => {
      let r: number, a: number
      do {
        r = rng.int(-5, 5)
        a = intExcept(rng, -5, 5, r)
      } while (r + a === 0)
      const c = rng.int(-5, 5)
      const [d, e] = [r + a, c - r * a]
      const den = linear(1, -a)
      const lhs = `\\dfrac{${sum([
        [1, 'x^2'],
        [c, ''],
      ])}}{${den}}`
      const rhs = `\\dfrac{${linear(d, e)}}{${den}}`
      return {
        prompt: `Solve $${lhs} = ${rhs}$. The equation has one solution.`,
        answer: { kind: 'number', value: r },
        hints: [
          `Multiply both sides by $${den}$, and remember that $x = ${a}$ is not allowed.`,
          'Solve the quadratic, then check each candidate in the original equation.',
        ],
        solution: [
          `For $x \\neq ${a}$, the equation becomes $${sum([
            [1, 'x^2'],
            [c, ''],
          ])} = ${linear(d, e)}$, that is $${poly([1, -d, c - e])} = 0$.`,
          `$${poly([1, -d, c - e])} = ${product(r, a)}$, with candidates $x = ${r}$ and $x = ${a}$.`,
          `$x = ${a}$ makes the denominator zero, so it is extraneous. The solution is $x = ${r}$.`,
        ],
        data: { r, a, c },
      }
    },
  },
  {
    id: 'radical-equation',
    title: 'A radical equation',
    skills: ['equations'],
    difficulty: 3,
    generate: (rng) => {
      // Squaring sqrt(x + k) = x + m gives a quadratic with roots r (valid) and s (extraneous).
      let m: number, r: number, s: number, k: number
      do {
        m = rng.int(-3, 3)
        r = rng.int(2 - m, 6 - m)
        s = 1 - 2 * m - r
        k = m * m - r * s
      } while (Math.abs(k) > 15 || s === r)
      const rad = `\\sqrt{${linear(1, k)}}`
      const rhs = linear(1, m)
      return {
        prompt: `Solve $${rad} = ${rhs}$. The equation has one solution.`,
        answer: { kind: 'number', value: r },
        hints: [
          'Square both sides, solve the quadratic, then check each candidate.',
          'A square root is never negative, so the right side must be at least $0$.',
        ],
        solution: [
          `Squaring gives $${linear(1, k)} = ${m === 0 ? 'x^2' : `(${rhs})^2`}$, that is $${poly([1, 2 * m - 1, m * m - k])} = 0$.`,
          `The candidates are $x = ${r}$ and $x = ${s}$.`,
          `At $x = ${s}$ the right side is $${s + m} < 0$, so it is extraneous. At $x = ${r}$ both sides are $${r + m}$.`,
        ],
        data: { m, k },
      }
    },
  },
  {
    id: 'linear-inequality',
    title: 'Solve a linear inequality',
    skills: ['inequalities'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5)
      const b = rng.int(-9, 9)
      const c = intExcept(rng, -9, 9, b)
      const op = rng.pick(OPS)
      const e = end(c - b, a)
      const solved = a > 0 ? op : flip[op]
      const closed = !strict(op)
      const below = solved === '<' || solved === '\\leq'
      const set = (lower: boolean, cl: boolean) => [lower ? left(e, cl) : right(e, cl)]
      return {
        prompt: `Solve $${linear(a, b)} ${op} ${c}$.`,
        answer: setChoice(rng, set(below, closed), [
          set(!below, closed),
          set(below, !closed),
          set(!below, !closed),
        ]),
        hints: [
          `Move the constant to the right, then divide by $${a}$.`,
          'Dividing by a negative number reverses the inequality.',
        ],
        solution: [
          `$${linear(a, 0)} ${op} ${c - b}$.`,
          a > 0
            ? `Divide by $${a}$: $${relation(solved, e)}$.`
            : `Divide by $${a}$ and reverse the sign: $${relation(solved, e)}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'quadratic-inequality',
    title: 'Solve a quadratic inequality',
    skills: ['inequalities', 'factor'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.int(-6, 5)
      const q = rng.int(p + 1, 7)
      const op = rng.pick(OPS)
      const closed = !strict(op)
      const below = op === '<' || op === '\\leq'
      const sets = insideOutside(end(p), end(q))
      const pick = (inside: boolean, cl: boolean) => (inside ? sets.inside(cl) : sets.outside(cl))
      return {
        prompt: `Solve $${poly([1, -(p + q), p * q])} ${op} 0$.`,
        answer: setChoice(rng, pick(below, closed), [
          pick(!below, closed),
          pick(below, !closed),
          pick(!below, !closed),
        ]),
        hints: [
          'Factor, and mark the zeros on the number line.',
          'The parabola opens upward: it is below the axis between its zeros.',
        ],
        solution: [
          `$${poly([1, -(p + q), p * q])} = ${product(p, q)}$, with zeros $${p}$ and $${q}$.`,
          `It is negative between them and positive outside, so the solution is $${intervalTex(pick(below, closed))}$.`,
        ],
        data: { p, q },
      }
    },
  },
  {
    id: 'rational-inequality',
    title: 'A sign chart for a quotient',
    skills: ['inequalities', 'rational-expressions'],
    difficulty: 3,
    generate: (rng) => {
      const p = rng.int(-6, 6)
      const q = intExcept(rng, -6, 6, p)
      const op = rng.pick(OPS)
      const [zero, pole] = [end(p), end(q)]
      const [lo, hi] = p < q ? [zero, pole] : [pole, zero]
      const ends = (closeZero: boolean, closePole: boolean) => {
        const at = (e: End) => (e === zero ? closeZero : closePole)
        return {
          inside: [between(lo, hi, at(lo), at(hi))],
          outside: [left(lo, at(lo)), right(hi, at(hi))],
        }
      }
      const positive = op === '>' || op === '\\geq'
      const correct = ends(!strict(op), false)[positive ? 'outside' : 'inside']
      const others = [false, true].flatMap((cz) =>
        [false, true].flatMap((cp) => [ends(cz, cp).inside, ends(cz, cp).outside]),
      )
      const fraction = `\\dfrac{${linear(1, -p)}}{${linear(1, -q)}}`
      return {
        prompt: `Solve $${fraction} ${op} 0$.`,
        answer: setChoice(rng, correct, others),
        hints: [
          `The quotient can change sign only at $x = ${p}$ and at $x = ${q}$.`,
          'A value that makes the denominator zero is never part of the solution.',
        ],
        solution: [
          `The numerator is zero at $x = ${p}$; the denominator is zero at $x = ${q}$, which is excluded.`,
          `For $x < ${lo.tex}$ both factors are negative and for $x > ${hi.tex}$ both are positive, so the quotient is positive outside and negative between.`,
          `So the solution is $${intervalTex(correct)}$.`,
        ],
        data: { p, q },
      }
    },
  },
  {
    id: 'abs-equation',
    title: 'An absolute value equation',
    skills: ['absolute-value', 'equations'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.pick([1, 1, 2, 3])
      const b = rng.int(-8, 8)
      const c = rng.int(1, 9)
      const inner = linear(a, b)
      return {
        prompt: `Solve $\\lvert ${inner} \\rvert = ${c}$. List both solutions, separated by commas.`,
        answer: { kind: 'list', values: [(c - b) / a, (-c - b) / a] },
        hints: [`$\\lvert u \\rvert = ${c}$ means $u = ${c}$ or $u = -${c}$.`],
        solution: [
          `$${inner} = ${c}$ or $${inner} = -${c}$.`,
          `So $x = ${frac(c - b, a)}$ or $x = ${frac(-c - b, a)}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'abs-inequality',
    title: 'An absolute value inequality',
    skills: ['absolute-value', 'inequalities'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.pick([1, 1, 2, 3])
      const a = rng.int(-5, 5)
      const r = rng.int(1, 5)
      const op = rng.pick(OPS)
      const closed = !strict(op)
      const below = op === '<' || op === '\\leq'
      const sets = insideOutside(end(a - r), end(a + r))
      const pick = (inside: boolean, cl: boolean) => (inside ? sets.inside(cl) : sets.outside(cl))
      const lhs = `\\lvert ${linear(k, -k * a)} \\rvert`
      return {
        prompt: `Solve $${lhs} ${op} ${k * r}$.`,
        answer: setChoice(rng, pick(below, closed), [
          pick(!below, closed),
          pick(below, !closed),
          pick(!below, !closed),
        ]),
        hints: [
          k === 1
            ? `$\\lvert x - a \\rvert$ is the distance from $x$ to $a$.`
            : `Divide both sides by $${k}$ first.`,
          below
            ? 'A distance below $r$ means the points within $r$ of the center.'
            : 'A distance above $r$ means the points farther than $r$ from the center.',
        ],
        solution: [
          ...(k === 1 ? [] : [`Divide by $${k}$: $\\lvert ${linear(1, -a)} \\rvert ${op} ${r}$.`]),
          `The distance from $x$ to $${a}$ is ${DISTANCE[op]} $${r}$.`,
          `So the solution is $${intervalTex(pick(below, closed))}$.`,
        ],
        data: { k, a, r },
      }
    },
  },
])
