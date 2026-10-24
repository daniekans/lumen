import { defineProblems, tex, type Rng } from '@/lib/practice'

const { poly, sum, paren, frac, term } = tex

const pointValues = (rng: Rng) => ({
  f0: rng.int(-5, 5),
  f1: rng.nonZeroInt(-4, 4),
  g0: rng.nonZeroInt(-4, 4),
  g1: rng.int(-4, 4),
  a: rng.int(1, 3),
})

export const problems = defineProblems([
  {
    id: 'polynomial',
    title: 'Polynomial',
    skills: ['basic-rules'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(3, 6)
      const a = rng.nonZeroInt(-5, 5)
      const b = rng.nonZeroInt(-6, 6)
      const c = rng.nonZeroInt(-9, 9)
      const d = rng.int(-9, 9)
      const ft = sum([
        [a, `x^{${n}}`],
        [b, 'x^{2}'],
        [c, 'x'],
        [d, ''],
      ])
      const answer = sum([
        [n * a, n - 1 === 1 ? 'x' : `x^{${n - 1}}`],
        [2 * b, 'x'],
        [c, ''],
      ])
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          'Differentiate term by term: the sum and constant multiple rules let you.',
          '$\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}$, and a constant has derivative $0$.',
        ],
        solution: [
          `$\\frac{d}{dx}\\left(${term(a, `x^{${n}}`)}\\right) = ${term(n * a, `x^{${n - 1}}`)}$, $\\frac{d}{dx}\\left(${term(b, 'x^{2}')}\\right) = ${term(2 * b, 'x')}$, and $\\frac{d}{dx}(${term(c, 'x')}) = ${c}$.`,
          `$f'(x) = ${answer}$.`,
        ],
        data: { n, a, b, c, d },
      }
    },
  },
  {
    id: 'negative-power',
    title: 'Negative powers',
    skills: ['basic-rules'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.int(1, 3)
      const a = rng.nonZeroInt(-6, 6)
      const c = rng.nonZeroInt(-8, 8)
      const xk = k === 1 ? 'x' : `x^{${k}}`
      const ft = `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{${xk}} ${c < 0 ? '-' : '+'} ${term(Math.abs(c), 'x')}`
      const answer = sum([
        [-k * a, `x^{${-k - 1}}`],
        [c, ''],
      ])
      return {
        prompt: `Find $f'(x)$ for $f(x) = ${ft}$, where $x \\neq 0$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0.4, 3] } },
        hints: [
          `Rewrite with a negative exponent: $\\frac{1}{${xk}} = x^{${-k}}$.`,
          'The power rule $\\frac{d}{dx}\\left(x^n\\right) = nx^{n-1}$ holds for negative integers $n$ when $x \\neq 0$.',
        ],
        solution: [
          `$f(x) = ${sum([
            [a, `x^{${-k}}`],
            [c, 'x'],
          ])}$.`,
          `$\\frac{d}{dx}\\left(${term(a, `x^{${-k}}`)}\\right) = ${paren(a)} \\cdot ${paren(-k)}x^{${-k - 1}} = ${term(-k * a, `x^{${-k - 1}}`)}$.`,
          `$f'(x) = ${answer}$.`,
        ],
        data: { k, a, c },
      }
    },
  },
  {
    id: 'product',
    title: 'Product rule',
    skills: ['basic-rules'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-4, 4)
      const b = rng.nonZeroInt(-5, 5)
      const c = rng.nonZeroInt(-3, 3)
      const d = rng.nonZeroInt(-5, 5)
      const u = poly([a, b])
      const v = poly([c, 0, d])
      const answer = poly([3 * a * c, 2 * b * c, a * d])
      return {
        prompt: `Find $f'(x)$ for $f(x) = (${u})(${v})$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          "The product rule: $(uv)' = u'v + uv'$.",
          `Here $u = ${u}$ with $u' = ${a}$, and $v = ${v}$ with $v' = ${term(2 * c, 'x')}$.`,
        ],
        solution: [
          `$f'(x) = ${a}(${v}) + (${u})(${term(2 * c, 'x')})$.`,
          `$= ${sum([
            [a * c, 'x^2'],
            [a * d, ''],
            [2 * a * c, 'x^2'],
            [2 * b * c, 'x'],
          ])}$.`,
          `$= ${answer}$.`,
        ],
        data: { a, b, c, d },
      }
    },
  },
  {
    id: 'quotient',
    title: 'Quotient rule',
    skills: ['basic-rules'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5)
      const d = rng.int(1, 5)
      const b = rng.nonZeroInt(-6, 6, [a * d])
      const top = a * d - b
      const den = `(${poly([1, d])})^2`
      const answer = `${top < 0 ? '-' : ''}\\frac{${Math.abs(top)}}{${den}}`
      return {
        prompt: `Find $f'(x)$ for $f(x) = \\frac{${poly([a, b])}}{${poly([1, d])}}$.`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [0, 3] } },
        hints: [
          "The quotient rule: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.",
          `Here $u' = ${a}$ and $v' = 1$.`,
        ],
        solution: [
          `$f'(x) = \\frac{${a}(${poly([1, d])}) - (${poly([a, b])}) \\cdot 1}{${den}}$.`,
          `The numerator is $${a}(${poly([1, d])}) - (${poly([a, b])}) = ${top}$.`,
          `$f'(x) = ${answer}$.`,
        ],
        data: { a, b, d },
      }
    },
  },
  {
    id: 'rules-at-a-point',
    title: 'Rules from values',
    skills: ['basic-rules'],
    difficulty: 2,
    generate: (rng) => {
      const { f0, f1, g0, g1, a } = pointValues(rng)
      const quotient = rng.bool()
      const value = quotient ? (f1 * g0 - f0 * g1) / (g0 * g0) : f1 * g0 + f0 * g1
      const what = quotient ? `\\left(\\frac{f}{g}\\right)'(${a})` : `(fg)'(${a})`
      return {
        prompt: `Suppose $f(${a}) = ${f0}$, $f'(${a}) = ${f1}$, $g(${a}) = ${g0}$ and $g'(${a}) = ${g1}$. Find $${what}$.`,
        answer: { kind: 'number', value },
        hints: [
          quotient
            ? "The quotient rule: $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$."
            : "The product rule: $(fg)' = f'g + fg'$.",
          'Evaluate every function at the same point and substitute.',
        ],
        solution: quotient
          ? [
              `$${what} = \\frac{f'(${a})g(${a}) - f(${a})g'(${a})}{g(${a})^2} = \\frac{${f1} \\cdot ${paren(g0)} - ${paren(f0)} \\cdot ${paren(g1)}}{${paren(g0)}^2}$.`,
              `$= \\frac{${f1 * g0 - f0 * g1}}{${g0 * g0}} = ${frac(f1 * g0 - f0 * g1, g0 * g0)}$.`,
            ]
          : [
              `$${what} = f'(${a})g(${a}) + f(${a})g'(${a}) = ${f1} \\cdot ${paren(g0)} + ${paren(f0)} \\cdot ${paren(g1)} = ${value}$.`,
            ],
        data: { f0, f1, g0, g1, quotient: Number(quotient) },
      }
    },
  },
  {
    id: 'tangent-line',
    title: 'Tangent line',
    skills: ['basic-rules'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.nonZeroInt(-2, 2)
      const b = rng.int(-3, 3)
      const c = rng.int(-4, 4)
      const d = rng.int(-5, 5)
      const x0 = rng.nonZeroInt(-2, 2)
      const f = (x: number) => a * x ** 3 + b * x * x + c * x + d
      const m = 3 * a * x0 * x0 + 2 * b * x0 + c
      const y0 = f(x0)
      const line = sum([
        [m, 'x'],
        [y0 - m * x0, ''],
      ])
      return {
        prompt: `Find the tangent line to $y = ${poly([a, b, c, d])}$ at $x = ${x0}$. Enter the right side of $y = mx + b$.`,
        answer: { kind: 'expression', tex: line },
        hints: [
          `The slope is $f'(${x0})$, and the line passes through $(${x0}, f(${x0}))$.`,
          "Point-slope form: $y = f(x_0) + f'(x_0)(x - x_0)$.",
        ],
        solution: [
          `$f'(x) = ${poly([3 * a, 2 * b, c])}$, so $m = f'(${x0}) = ${m}$.`,
          `$f(${x0}) = ${y0}$.`,
          `$y = ${y0} + ${paren(m)}(x - ${paren(x0)}) = ${line}$.`,
        ],
        data: { a, b, c, d, x0 },
      }
    },
  },
])
