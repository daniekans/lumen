import { defineProblems, tex } from '@/lib/practice'

const { poly, sum, paren, frac, term } = tex

/** A fraction as a coefficient of `body`: 'x' for 1, '-x' for -1, '\\frac{3}{2}x' otherwise. */
const coef = (p: number, q: number, body: string) => {
  const c = frac(p, q)
  return c === '1' ? body : c === '-1' ? `-${body}` : `${c}${body}`
}

/** Exponents p/q (reduced) that are not whole numbers. */
const FRACTIONAL: readonly (readonly [number, number])[] = [
  [1, 2],
  [3, 2],
  [5, 2],
  [-1, 2],
  [1, 3],
  [2, 3],
  [4, 3],
  [-2, 3],
]

/** x^{p/q} as TeX. */
const fracPower = (p: number, q: number) => `x^{${frac(p, q)}}`

const BASES = [2, 3, 5, 10] as const

export const problems = defineProblems([
  {
    id: 'elementary',
    title: 'Exponential, logarithm, sine',
    skills: ['transcendental-derivatives'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5)
      const b = rng.nonZeroInt(-5, 5)
      const c = rng.nonZeroInt(-5, 5)
      const ft = sum([
        [a, 'e^{x}'],
        [b, '\\sin x'],
        [c, '\\ln x'],
      ])
      const answer = `${sum([
        [a, 'e^{x}'],
        [b, '\\cos x'],
      ])} ${c < 0 ? '-' : '+'} \\frac{${Math.abs(c)}}{x}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$, where $x > 0$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0.4, 3] } },
        hints: [
          'Differentiate term by term.',
          '$\\frac{d}{dx}e^x = e^x$, $\\frac{d}{dx}\\sin x = \\cos x$ and $\\frac{d}{dx}\\ln x = \\frac{1}{x}$.',
        ],
        solution: [`$f'(x) = ${answer}$.`],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'base-and-tangent',
    title: 'Other bases and tangent',
    skills: ['transcendental-derivatives'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.pick(BASES)
      const a = rng.nonZeroInt(-4, 4)
      const c = rng.nonZeroInt(-4, 4)
      const ft = sum([
        [a, `${b}^{x}`],
        [c, '\\tan x'],
      ])
      const answer = `${term(a, `\\ln(${b}) \\cdot ${b}^{x}`)} ${c < 0 ? '-' : '+'} \\frac{${Math.abs(c)}}{\\cos^{2} x}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [-1.2, 1.2] } },
        hints: [
          '$\\frac{d}{dx}b^x = (\\ln b)\\,b^x$.',
          '$\\frac{d}{dx}\\tan x = \\frac{1}{\\cos^2 x}$, from the quotient rule on $\\frac{\\sin x}{\\cos x}$.',
        ],
        solution: [
          `$\\frac{d}{dx}\\left(${term(a, `${b}^{x}`)}\\right) = ${term(a, `\\ln(${b}) \\cdot ${b}^{x}`)}$.`,
          `$\\frac{d}{dx}\\left(${term(c, '\\tan x')}\\right) = ${c < 0 ? '-' : ''}\\frac{${Math.abs(c)}}{\\cos^{2} x}$.`,
          `$f'(x) = ${answer}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'fractional-power',
    title: 'Fractional exponent',
    skills: ['transcendental-derivatives'],
    difficulty: 1,
    generate: (rng) => {
      const [p, q] = rng.pick(FRACTIONAL)
      const a = rng.nonZeroInt(-6, 6)
      const answer = coef(a * p, q, fracPower(p - q, q))
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${coef(a, 1, fracPower(p, q))}$, where $x > 0$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0.4, 3] } },
        hints: [
          'For $x > 0$, $\\frac{d}{dx}\\left(x^r\\right) = rx^{r-1}$ for every real $r$.',
          `Here $r = ${frac(p, q)}$, so $r - 1 = ${frac(p - q, q)}$.`,
        ],
        solution: [
          `$f'(x) = ${paren(a)} \\cdot ${frac(p, q)} \\, x^{${frac(p, q)} - 1} = ${answer}$.`,
        ],
        data: { a, p, q },
      }
    },
  },
  {
    id: 'power-of-linear',
    title: 'Power of a linear function',
    skills: ['chain-rule'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5)
      const b = rng.nonZeroInt(-6, 6)
      const n = rng.int(2, 7)
      const inner = poly([a, b])
      const pow = (base: string, k: number) => (k === 1 ? base : `${base}^{${k}}`)
      const answer = `${n * a}${pow(`(${inner})`, n - 1)}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = (${inner})^{${n}}$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          `The outer function is $u^{${n}}$ with $u = ${inner}$.`,
          "Chain rule: the outer derivative at $u$, times $u'$.",
        ],
        solution: [
          `$\\frac{d}{du}u^{${n}} = ${n}${pow('u', n - 1)}$ and $\\frac{du}{dx} = ${a}$.`,
          `$f'(x) = ${n}${pow(`(${inner})`, n - 1)} \\cdot ${paren(a)} = ${answer}$.`,
        ],
        data: { a, b, n },
      }
    },
  },
  {
    id: 'root-of-quadratic',
    title: 'Root of a quadratic',
    skills: ['chain-rule'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(1, 6)
      const b = rng.int(1, 9)
      const inner = poly([a, 0, b])
      const answer = `\\frac{${term(a, 'x')}}{\\sqrt{${inner}}}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = \\sqrt{${inner}}$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          `Write $f(x) = u^{\\frac{1}{2}}$ with $u = ${inner}$.`,
          '$\\frac{d}{du}\\sqrt{u} = \\frac{1}{2\\sqrt{u}}$.',
        ],
        solution: [
          `$f'(x) = \\frac{1}{2\\sqrt{${inner}}} \\cdot ${term(2 * a, 'x')} = ${answer}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'exp-of-polynomial',
    title: 'Exponential of a polynomial',
    skills: ['chain-rule', 'transcendental-derivatives'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-2, 2)
      const b = rng.int(-3, 3)
      const c = rng.nonZeroInt(-3, 3)
      const inner = poly([a, b, 0])
      const answer = `(${poly([2 * a * c, b * c])})e^{${inner}}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${term(c, `e^{${inner}}`)}$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [-1, 1] } },
        hints: [
          `The outer function is $${term(c, 'e^{u}')}$ with $u = ${inner}$.`,
          "$\\frac{d}{dx}e^{u} = e^{u} \\cdot u'$.",
        ],
        solution: [
          `$u' = ${poly([2 * a, b])}$.`,
          `$f'(x) = ${paren(c)} \\cdot e^{${inner}} \\cdot (${poly([2 * a, b])}) = ${answer}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'trig-of-inner',
    title: 'Sine or cosine of an inner function',
    skills: ['chain-rule', 'transcendental-derivatives'],
    difficulty: 2,
    generate: (rng) => {
      const square = rng.bool()
      const a = rng.nonZeroInt(-4, 4)
      const b = square ? 0 : rng.nonZeroInt(-5, 5)
      const inner = square ? term(a, 'x^{2}') : poly([a, b])
      const fn = square ? 'cos' : 'sin'
      const answer = square ? `${term(-2 * a, 'x')}\\sin(${inner})` : term(a, `\\cos(${inner})`)
      return {
        prompt: `Find $f'(x)$ for $f(x) = \\${fn}(${inner})$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          `The outer function is $\\${fn} u$ with $u = ${inner}$.`,
          square
            ? "$\\frac{d}{dx}\\cos u = -\\sin u \\cdot u'$."
            : "$\\frac{d}{dx}\\sin u = \\cos u \\cdot u'$.",
        ],
        solution: square
          ? [
              `$u' = ${term(2 * a, 'x')}$.`,
              `$f'(x) = -\\sin(${inner}) \\cdot ${term(2 * a, 'x')} = ${answer}$.`,
            ]
          : [`$u' = ${a}$.`, `$f'(x) = \\cos(${inner}) \\cdot ${paren(a)} = ${answer}$.`],
        data: { a, b, square: Number(square) },
      }
    },
  },
  {
    id: 'log-of-quadratic',
    title: 'Logarithm of a quadratic',
    skills: ['chain-rule', 'transcendental-derivatives'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(1, 4)
      const k = rng.int(1, 9)
      const inner = poly([a, 0, k])
      const answer = `\\frac{${term(2 * a, 'x')}}{${inner}}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = \\ln(${inner})$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          `The outer function is $\\ln u$ with $u = ${inner}$, which is always positive.`,
          "$\\frac{d}{dx}\\ln u = \\frac{u'}{u}$.",
        ],
        solution: [`$f'(x) = \\frac{1}{${inner}} \\cdot ${term(2 * a, 'x')} = ${answer}$.`],
        data: { a, k },
      }
    },
  },
  {
    id: 'product-with-chain',
    title: 'Product and chain',
    skills: ['chain-rule', 'basic-rules'],
    difficulty: 3,
    generate: (rng) => {
      const m = rng.int(1, 3)
      const a = rng.nonZeroInt(-3, 3)
      const xm = m === 1 ? 'x' : `x^{${m}}`
      const xm1 = m === 1 ? '' : m === 2 ? 'x' : `x^{${m - 1}}`
      const e = `e^{${term(a, 'x')}}`
      const answer = `(${sum([
        [a, xm],
        [m, xm1],
      ])})${e}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${xm}${e}$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [-1, 1.5] } },
        hints: [
          "Product rule first: $(uv)' = u'v + uv'$ with $u = " + xm + '$ and $v = ' + e + '$.',
          `The chain rule gives $\\frac{d}{dx}${e} = ${term(a, e)}$.`,
        ],
        solution: [
          `$f'(x) = ${term(m, xm1 || '1')} \\cdot ${e} + ${xm} \\cdot ${term(a, e)}$.`,
          `$= ${answer}$.`,
        ],
        data: { m, a },
      }
    },
  },
  {
    id: 'chain-from-values',
    title: 'Chain rule from values',
    skills: ['chain-rule'],
    difficulty: 2,
    generate: (rng) => {
      const x0 = rng.int(0, 3)
      const g0 = rng.pick([-4, -3, -2, -1, 0, 1, 2, 3, 4].filter((v) => v !== x0))
      const g1 = rng.nonZeroInt(-5, 5)
      const f1 = rng.nonZeroInt(-5, 5)
      const decoy = rng.nonZeroInt(-5, 5, [f1])
      return {
        prompt: `Suppose $g(${x0}) = ${g0}$, $g'(${x0}) = ${g1}$, $f'(${g0}) = ${f1}$ and $f'(${x0}) = ${decoy}$. Find $h'(${x0})$ for $h(x) = f(g(x))$.`,
        answer: { kind: 'number', value: f1 * g1 },
        hints: [
          "$h'(x) = f'(g(x))\\,g'(x)$: the outer derivative is taken at the inner value.",
          `So you need $f'$ at $g(${x0}) = ${g0}$, not at $${x0}$.`,
        ],
        solution: [
          `$h'(${x0}) = f'(g(${x0}))\\,g'(${x0}) = f'(${g0}) \\cdot ${paren(g1)} = ${f1} \\cdot ${paren(g1)} = ${f1 * g1}$.`,
        ],
        data: { x0, g0, g1, f1 },
      }
    },
  },
  {
    id: 'rates-with-units',
    title: 'Rates that multiply',
    skills: ['chain-rule'],
    difficulty: 2,
    generate: (rng) => {
      if (rng.bool()) {
        const k = rng.pick([0.005, 0.006, 0.0065, 0.008])
        const v = rng.pick([8, 10, 12, 15, 20])
        const value = -k * v
        return {
          prompt: `A hiker climbs at $${v}$ meters per minute. The air temperature drops by $${k}$ degrees for every meter of height. How fast is the temperature around the hiker changing, in degrees per minute? (Negative means cooling.)`,
          answer: { kind: 'number', value, tolerance: 1e-6 },
          hints: [
            'Temperature $T$ depends on height $h$, and $h$ depends on time $t$.',
            '$\\frac{dT}{dt} = \\frac{dT}{dh}\\,\\frac{dh}{dt}$: degrees per meter times meters per minute.',
          ],
          solution: [
            `$\\frac{dT}{dh} = -${k}$ degrees per meter and $\\frac{dh}{dt} = ${v}$ meters per minute.`,
            `$\\frac{dT}{dt} = -${k} \\cdot ${v} = ${+value.toFixed(6)}$ degrees per minute.`,
          ],
          data: { kind: 0, rate: -k, speed: v },
        }
      }
      const k = rng.pick([0.05, 0.06, 0.07, 0.08])
      const v = rng.pick([50, 60, 80, 90, 100, 120])
      const value = k * v
      return {
        prompt: `A car burns $${k}$ liters of fuel per kilometer and drives at $${v}$ km/h. How fast is it using fuel, in liters per hour?`,
        answer: { kind: 'number', value, tolerance: 1e-6 },
        hints: [
          'The fuel used $F$ depends on the distance $s$, and $s$ depends on time $t$.',
          '$\\frac{dF}{dt} = \\frac{dF}{ds}\\,\\frac{ds}{dt}$: liters per kilometer times kilometers per hour.',
        ],
        solution: [`$\\frac{dF}{dt} = ${k} \\cdot ${v} = ${+value.toFixed(6)}$ liters per hour.`],
        data: { kind: 1, rate: k, speed: v },
      }
    },
  },
])
