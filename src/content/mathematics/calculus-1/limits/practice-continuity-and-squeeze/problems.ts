import { polyFromRoots } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, poly, sum } = tex

/** x - r as TeX, in parentheses unless it is just x: (x - 3), (x + 2), x. */
const factor = (r: number) =>
  r === 0
    ? 'x'
    : `(${sum([
        [1, 'x'],
        [-r, ''],
      ])})`

/** The limit as TeX: \lim_{x \to 2}. */
const lim = (a: string) => `\\lim_{x \\to ${a}}`

/** k times x as TeX: x, 3x, -2x. */
const kx = (k: number) => tex.term(k, 'x')

/** Distinct whole numbers in [lo, hi], none of them in `avoid`. */
const distinct = (rng: Rng, n: number, lo: number, hi: number, avoid: number[] = []) => {
  const out: number[] = []
  while (out.length < n) {
    const v = rng.int(lo, hi)
    if (!out.includes(v) && !avoid.includes(v)) out.push(v)
  }
  return out
}

const nonzero = (rng: Rng, lo: number, hi: number) => rng.pick(distinct(rng, 1, lo, hi, [0]))

/** The options of the classification problems, in this order. */
export const KINDS = [
  'Continuous',
  'Removable discontinuity',
  'Jump discontinuity',
  'Infinite discontinuity',
] as const

export const problems = defineProblems([
  {
    id: 'piecewise-parameter',
    title: 'Make a piecewise function continuous',
    skills: ['continuity'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-2, 3)
      const m = nonzero(rng, -4, 4)
      const p = rng.pick([-2, -1, 1, 2])
      const q = rng.int(-6, 6)
      const right = p * a * a + q
      const c = right - m * a
      const def = `f(x) = \\begin{cases} ${kx(m)} + c & x < ${a} \\\\ ${poly([p, 0, q])} & x \\geq ${a} \\end{cases}`
      return {
        prompt: `Find the constant $c$ that makes $${def}$ continuous everywhere.`,
        answer: { kind: 'number', value: c },
        hints: [
          'Both pieces are polynomials, so the only point to check is where they meet.',
          `The limit from the left must equal $f(${a})$.`,
        ],
        solution: [
          `From the left, $${kx(m)} + c \\to ${m * a} + c$. From the right, and at the point, $f(${a}) = ${right}$.`,
          `Continuity needs $${m * a} + c = ${right}$, so $c = ${c}$.`,
        ],
        data: { a, m, p, q },
      }
    },
  },
  {
    id: 'classify-piecewise',
    title: 'Classify a discontinuity',
    skills: ['continuity'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(-2, 3)
      const [m1, b1] = [nonzero(rng, -3, 3), rng.int(-4, 4)]
      const m2 = nonzero(rng, -3, 3)
      const left = m1 * a + b1
      const kind = rng.int(0, 2)
      const right = kind === 2 ? left + rng.pick([-3, -2, -1, 1, 2, 3]) : left
      const b2 = right - m2 * a
      const v = kind === 0 ? left : rng.pick(distinct(rng, 1, -6, 6, [left, right]))
      const def = `f(x) = \\begin{cases} ${poly([m1, b1])} & x < ${a} \\\\ ${v} & x = ${a} \\\\ ${poly([m2, b2])} & x > ${a} \\end{cases}`
      return {
        prompt: `Is $${def}$ continuous at $x = ${a}$? If not, what kind of discontinuity does it have there?`,
        answer: { kind: 'choice', options: [...KINDS], correct: kind },
        hints: ['Find the limit from each side, then compare with the value at the point.'],
        solution: [
          `From the left: $${poly([m1, b1])} \\to ${left}$. From the right: $${poly([m2, b2])} \\to ${right}$. The value is $f(${a}) = ${v}$.`,
          kind === 2
            ? 'The one-sided limits differ: a jump discontinuity.'
            : kind === 1
              ? `The limit is $${left}$ but $f(${a}) = ${v}$: a removable discontinuity. Redefining $f(${a}) = ${left}$ would remove it.`
              : `The limit is $${left}$, which equals $f(${a})$, so $f$ is continuous at $${a}$.`,
        ],
        data: { a, m1, b1, m2, b2, v, kind },
      }
    },
  },
  {
    id: 'classify-rational',
    title: 'Hole or asymptote',
    skills: ['continuity'],
    difficulty: 2,
    generate: (rng) => {
      const [r, s, t] = distinct(rng, 3, -4, 4) as [number, number, number]
      const atHole = rng.bool()
      const point = atHole ? r : t
      const top = poly(polyFromRoots([r, s]))
      const bottom = poly(polyFromRoots([r, t]))
      return {
        prompt: `$f(x) = \\frac{${top}}{${bottom}}$ is undefined at $x = ${point}$. What kind of discontinuity is it?`,
        answer: { kind: 'choice', options: [...KINDS], correct: atHole ? 1 : 3 },
        hints: ['Factor the top and the bottom.', 'A factor that cancels leaves a hole.'],
        solution: [
          `$f(x) = \\frac{${factor(r)}${factor(s)}}{${factor(r)}${factor(t)}}$, which is $\\frac{${factor(s).replace(/^\(|\)$/g, '')}}{${factor(t).replace(/^\(|\)$/g, '')}}$ for $x \\neq ${r}$.`,
          atHole
            ? `At $x = ${r}$ the factor cancels and the limit is $${frac(r - s, r - t)}$: a removable discontinuity (a hole).`
            : `At $x = ${t}$ the bottom tends to $0$ and the top to $${t - s}$, so the values grow without bound: an infinite discontinuity (a vertical asymptote).`,
        ],
        data: { r, s, t, point },
      }
    },
  },
  {
    id: 'squeeze-bounds',
    title: 'Squeeze theorem',
    skills: ['standard-limits'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-3, 3)
      const L = rng.int(-5, 5)
      const m = rng.int(-3, 3)
      const k = rng.int(1, 3)
      // g(x) = m(x - a) + L below, h(x) = g(x) + k(x - a)^2 above.
      const g = [m, L - m * a]
      const h = [k, m - 2 * k * a, k * a * a + L - m * a]
      return {
        prompt: `For all $x$ near $${a}$, $${poly(g)} \\leq f(x) \\leq ${poly(h)}$. Find $${lim(String(a))} f(x)$.`,
        answer: { kind: 'number', value: L },
        hints: ['Find the limit of each bound at the point.'],
        solution: [
          `Both bounds are polynomials, so substitute $x = ${a}$: the lower bound gives $${L}$ and the upper bound gives $${L}$.`,
          `The bounds share the limit $${L}$, so by the squeeze theorem $${lim(String(a))} f(x) = ${L}$.`,
        ],
        data: { a, L, m, k },
      }
    },
  },
  {
    id: 'sin-limit',
    title: 'A limit with sine',
    skills: ['standard-limits'],
    difficulty: 2,
    generate: (rng) => {
      const [a, b] = distinct(rng, 2, 1, 7) as [number, number]
      const variant = rng.int(0, 2)
      const sinA = `\\sin ${kx(a)}`
      const bottom = variant === 1 ? `\\sin ${kx(b)}` : kx(b)
      const top = variant === 2 ? `\\tan ${kx(a)}` : sinA
      const value = frac(a, b)
      return {
        prompt: `Find $${lim('0')} \\frac{${top}}{${bottom}}$.`,
        answer: { kind: 'number', value: a / b },
        hints: [
          'Use $\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1$.',
          `Write the quotient so that $\\sin ${kx(a)}$ sits over $${kx(a)}$.`,
        ],
        solution: [
          variant === 0
            ? `$\\frac{\\sin ${kx(a)}}{${kx(b)}} = \\frac{${a}}{${b}} \\cdot \\frac{\\sin ${kx(a)}}{${kx(a)}}$.`
            : variant === 1
              ? `$\\frac{\\sin ${kx(a)}}{\\sin ${kx(b)}} = \\frac{\\sin ${kx(a)}}{${kx(a)}} \\cdot \\frac{${kx(b)}}{\\sin ${kx(b)}} \\cdot \\frac{${a}}{${b}}$.`
              : `$\\tan ${kx(a)} = \\frac{\\sin ${kx(a)}}{\\cos ${kx(a)}}$, so $\\frac{\\tan ${kx(a)}}{${kx(b)}} = \\frac{${a}}{${b}} \\cdot \\frac{\\sin ${kx(a)}}{${kx(a)}} \\cdot \\frac{1}{\\cos ${kx(a)}}$.`,
          `Each quotient of a sine and its argument tends to $1$${variant === 2 ? ', and $\\cos 0 = 1$' : ''}, so the limit is $${value}$.`,
        ],
        data: { a, b, variant },
      }
    },
  },
  {
    id: 'exp-limit',
    title: 'A limit with e',
    skills: ['standard-limits'],
    difficulty: 2,
    generate: (rng) => {
      const a = nonzero(rng, -4, 4)
      const b = rng.int(1, 6)
      const exponent = a === 1 ? 'x' : `${a}x`
      return {
        prompt: `Find $${lim('0')} \\frac{e^{${exponent}} - 1}{${kx(b)}}$.`,
        answer: { kind: 'number', value: a / b },
        hints: ['Use $\\lim_{u \\to 0} \\frac{e^u - 1}{u} = 1$.', `Let $u = ${exponent}$.`],
        solution: [
          `$\\frac{e^{${exponent}} - 1}{${kx(b)}} = \\frac{${a}}{${b}} \\cdot \\frac{e^{${exponent}} - 1}{${exponent}}$.`,
          `With $u = ${exponent} \\to 0$ the second factor tends to $1$, so the limit is $${frac(a, b)}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'compound-limit',
    title: 'A limit of the form 1 to the infinity',
    skills: ['standard-limits'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.pick([-2, -1, 1, 2, 3])
      const b = rng.pick([1, 2, 3])
      const exponent = b === 1 ? 'x' : `${b}x`
      const inside = a < 0 ? `1 - \\frac{${-a}}{x}` : `1 + \\frac{${a}}{x}`
      const power = a * b === 1 ? 'e' : `e^{${a * b}}`
      return {
        prompt: `Find $${lim('\\infty')} \\left(${inside}\\right)^{${exponent}}$. Exact forms such as $e^{2}$ are accepted.`,
        answer: { kind: 'number', value: Math.exp(a * b), tolerance: 1e-5 },
        hints: [
          'Use $\\lim_{n \\to \\infty} \\left(1 + \\frac{a}{n}\\right)^n = e^a$.',
          b === 1
            ? 'The exponent is already $x$.'
            : `Write the power as $\\left(\\left(${inside}\\right)^{x}\\right)^{${b}}$.`,
        ],
        solution: [
          `$\\left(${inside}\\right)^{x} \\to e^{${a}}$.`,
          b === 1
            ? `So the limit is $${power}$.`
            : `Raising to the power $${b}$ (a continuous operation) gives $\\left(e^{${a}}\\right)^{${b}} = ${power}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'ivt-interval',
    title: 'Locate a root',
    skills: ['continuity'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(-3, 2)
      const p = rng.int(1, 4)
      // f(n) < 0 < f(n + 1) for f(x) = x^3 + px + q.
      const lo = -((n + 1) ** 3 + p * (n + 1))
      const hi = -(n ** 3 + p * n)
      const q = rng.int(lo + 1, hi - 1)
      const start = n - rng.int(0, 3)
      const options = Array.from({ length: 4 }, (_, i) => `$[${start + i}, ${start + i + 1}]$`)
      const f = (x: number) => x ** 3 + p * x + q
      return {
        prompt: `By the intermediate value theorem, which interval must contain a root of $f(x) = ${poly([1, 0, p, q])}$?`,
        answer: { kind: 'choice', options, correct: n - start },
        hints: [
          'A polynomial is continuous. Look for an interval where $f$ changes sign.',
          `Evaluate $f$ at the whole numbers from $${start}$ to $${start + 4}$.`,
        ],
        solution: [
          `$f(${n}) = ${f(n)} < 0$ and $f(${n + 1}) = ${f(n + 1)} > 0$.`,
          `$f$ is continuous and changes sign on $[${n}, ${n + 1}]$, so it has a root there. (It is increasing, so the root is the only one and the other intervals have no sign change.)`,
        ],
        data: { n, p, q, start },
      }
    },
  },
])
