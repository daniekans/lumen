import { polyFromRoots } from '@/lib/math'
import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

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

/** The classification options with oscillation added, for functions such as sin(1/x). */
export const KINDS_OSC = [...KINDS, 'Oscillating discontinuity'] as const

/** Equations with one root in [lo, lo + 1], for bisection: TeX, g with g = 0 at the root, lo. */
export const BISECT = [
  { tex: '\\cos x = x', g: (x: number) => Math.cos(x) - x, lo: 0, gTex: '\\cos x - x' },
  { tex: 'e^{-x} = x', g: (x: number) => Math.exp(-x) - x, lo: 0, gTex: 'e^{-x} - x' },
  { tex: 'x^3 = x + 1', g: (x: number) => x ** 3 - x - 1, lo: 1, gTex: 'x^3 - x - 1' },
  { tex: 'x^3 - 2x - 5 = 0', g: (x: number) => x ** 3 - 2 * x - 5, lo: 2, gTex: 'x^3 - 2x - 5' },
  { tex: '\\ln x = 2 - x', g: (x: number) => Math.log(x) - 2 + x, lo: 1, gTex: '\\ln x - 2 + x' },
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
          `Each quotient of a sine and its argument tends to $1$, since each argument tends to $0$ and is not $0$ for $x \\neq 0$${variant === 2 ? '. Also $\\cos 0 = 1$' : ''}. So the limit is $${value}$.`,
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
          `With $u = ${exponent}$, $u \\to 0$ and $u \\neq 0$ for $x \\neq 0$, so the second factor tends to $1$ and the limit is $${frac(a, b)}$.`,
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
          'Use $\\lim_{x \\to \\infty} \\left(1 + \\frac{a}{x}\\right)^x = e^a$, which holds for real $x$, not only whole numbers.',
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
  {
    id: 'build-squeeze',
    title: 'Build the squeeze',
    skills: ['standard-limits'],
    difficulty: 2,
    generate: (rng): Problem => {
      if (rng.bool()) {
        const c = rng.int(-5, 5)
        const n = rng.int(1, 3)
        const trig = rng.pick(['\\sin', '\\cos'])
        const xn = n === 1 ? 'x' : `x^{${n}}`
        const absN = n === 2 ? 'x^2' : `|x|${n === 1 ? '' : `^{${n}}`}`
        const body = `${xn} ${trig}\\frac{1}{x}`
        return {
          prompt: `Find $${lim('0')} \\left(${c === 0 ? '' : `${c} + `}${body}\\right)$.`,
          answer: { kind: 'number', value: c },
          hints: [
            `$${trig}\\frac{1}{x}$ has no limit at $0$, so the product law does not apply.`,
            `$-1 \\le ${trig}\\frac{1}{x} \\le 1$. Multiply by $|${xn}|$.`,
          ],
          solution: [
            `$|${body}| \\le ${absN}$, so $-${absN} \\le ${body} \\le ${absN}$ for $x \\neq 0$.`,
            `Both bounds tend to $0$, so by the squeeze theorem $${body} \\to 0$, and the limit is $${c}$.`,
          ],
          data: { c, n, variant: 0 },
        }
      }
      const a = rng.int(0, 4)
      const b = rng.int(1, 4)
      const top = a === 0 ? '\\sin x' : `${tex.term(a, 'x')} + \\sin x`
      const bottom = tex.term(b, 'x')
      return {
        prompt: `Find $${lim('\\infty')} \\frac{${top}}{${bottom}}$.`,
        answer: { kind: 'number', value: a / b },
        hints: [
          '$\\sin x$ keeps oscillating, but it stays between $-1$ and $1$.',
          `Bound the top between $${a === 0 ? '-1' : `${tex.term(a, 'x')} - 1`}$ and $${a === 0 ? '1' : `${tex.term(a, 'x')} + 1`}$.`,
        ],
        solution: [
          `For $x > 0$: $\\frac{${a === 0 ? '-1' : `${tex.term(a, 'x')} - 1`}}{${bottom}} \\le \\frac{${top}}{${bottom}} \\le \\frac{${a === 0 ? '1' : `${tex.term(a, 'x')} + 1`}}{${bottom}}$.`,
          `Both bounds tend to $${frac(a, b)}$, so by the squeeze theorem the limit is $${frac(a, b)}$.`,
        ],
        data: { a, b, variant: 1 },
      }
    },
  },
  {
    id: 'classify-oscillating',
    title: 'Oscillation near a point',
    skills: ['continuity', 'standard-limits'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.int(-2, 3)
      const kind = rng.pick([0, 1, 4] as const)
      const xa = sum([
        [1, 'x'],
        [-a, ''],
      ])
      const inner = `\\sin\\frac{1}{${xa}}`
      const expr = kind === 4 ? inner : `(${xa}) ${inner}`
      const v = kind === 1 ? nonzero(rng, -3, 3) : 0
      const def = `f(x) = \\begin{cases} ${expr} & x \\neq ${a} \\\\ ${v} & x = ${a} \\end{cases}`
      return {
        prompt: `Is $${def}$ continuous at $x = ${a}$? If not, what kind of discontinuity does it have there?`,
        answer: { kind: 'choice', options: [...KINDS_OSC], correct: kind },
        hints: [
          `$${inner}$ swings between $-1$ and $1$ infinitely often near $${a}$.`,
          kind === 4
            ? 'Does anything damp the swings?'
            : `The factor $${xa}$ tends to $0$. Squeeze.`,
        ],
        solution:
          kind === 4
            ? [
                `Every interval around $${a}$ contains inputs where $f = 1$ and inputs where $f = -1$, so the values never settle: no limit, from either side.`,
                'Not a jump (no one-sided limits) and not infinite (the values stay between $-1$ and $1$): an oscillating discontinuity.',
              ]
            : [
                `$|${expr}| \\le |${xa}|$, which tends to $0$, so by the squeeze theorem the limit at $${a}$ is $0$.`,
                kind === 0
                  ? `$f(${a}) = 0$ equals the limit, so $f$ is continuous at $${a}$.`
                  : `$f(${a}) = ${v}$ differs from the limit $0$: a removable discontinuity.`,
              ],
        data: { a, kind, v },
      }
    },
  },
  {
    id: 'bisection-steps',
    title: 'Bisection to an accuracy',
    skills: ['continuity'],
    difficulty: 2,
    generate: (rng) => {
      const i = rng.int(0, BISECT.length - 1)
      const { tex: eq, gTex, g, lo } = BISECT[i]!
      const tol = rng.pick([0.1, 0.05, 0.01, 0.005, 0.001, 0.0001])
      let k = 0
      while (2 ** -k >= tol) k++
      const [glo, ghi] = [g(lo), g(lo + 1)]
      return {
        prompt: `The equation $${eq}$ has a solution in $[${lo}, ${lo + 1}]$. Starting from this interval, how many bisection steps are needed before the interval that traps the solution is narrower than $${tol}$?`,
        answer: { kind: 'number', value: k },
        hints: [
          `Write the equation as $g(x) = ${gTex} = 0$ and check the signs at the ends.`,
          'Each step halves the width: after $k$ steps it is $\\frac{1}{2^k}$.',
        ],
        solution: [
          `$g(x) = ${gTex}$ is continuous, with $g(${lo}) \\approx ${glo.toFixed(3)}$ and $g(${lo + 1}) \\approx ${ghi.toFixed(3)}$, of opposite signs, so the intermediate value theorem traps a root.`,
          `After $k$ steps the width is $\\frac{1}{2^k}$. Need $\\frac{1}{2^k} < ${tol}$: $2^{${k - 1}} = ${2 ** (k - 1)}$ is not enough, $2^{${k}} = ${2 ** k}$ is. So $k = ${k}$.`,
        ],
        data: { i, tol },
      }
    },
  },
  {
    id: 'continuous-interest',
    title: 'Continuous compounding',
    skills: ['standard-limits'],
    difficulty: 2,
    generate: (rng) => {
      const P = rng.pick([100, 500, 1000, 2000])
      const r = rng.pick([2, 3, 4, 5, 6, 8, 10])
      const t = rng.pick([1, 2, 5, 10, 20])
      const rt = (r * t) / 100
      const rate = r / 100
      const value = P * Math.exp(rt)
      return {
        prompt: `A deposit of $${P}$ dollars earns $${r}\\%$ a year, compounded $n$ times a year. After $${t}$ years it is worth $${P}\\left(1 + \\frac{${rate}}{n}\\right)^{${t === 1 ? 'n' : `${t}n`}}$ dollars. What does this tend to as $n \\to \\infty$? Give it to the cent, or exactly, such as $100e^{0.3}$.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          'Use $\\lim_{n \\to \\infty} \\left(1 + \\frac{a}{n}\\right)^n = e^a$.',
          t === 1
            ? 'The exponent is already $n$.'
            : `Write the power as $\\left(\\left(1 + \\frac{${rate}}{n}\\right)^{n}\\right)^{${t}}$.`,
        ],
        solution: [
          `$\\left(1 + \\frac{${rate}}{n}\\right)^{n} \\to e^{${rate}}$, and raising to the power $${t}$ is continuous, so the amount tends to $${P}\\left(e^{${rate}}\\right)^{${t}} = ${P}e^{${+rt.toFixed(4)}}$.`,
          `That is about $${value.toFixed(2)}$ dollars, the value under continuous compounding.`,
        ],
        data: { P, rate, t },
      }
    },
  },
])
