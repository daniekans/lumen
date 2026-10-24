import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { poly, sum, paren, frac, num, signed } = tex

/** A quadratic a x^2 + b x + c with small integer coefficients, a nonzero. */
const quadratic = (rng: Rng) => {
  const a = rng.nonZeroInt(-3, 3)
  const b = rng.int(-5, 5)
  const c = rng.int(-5, 5)
  return { a, b, c, f: (x: number) => a * x * x + b * x + c, tex: poly([a, b, c]) }
}

export const problems = defineProblems([
  {
    id: 'definition-choice',
    title: 'The definition',
    skills: ['definition'],
    difficulty: 1,
    generate: (rng) => {
      const correct = '$\\lim_{h \\to 0} \\dfrac{f(a+h) - f(a)}{h}$'
      const options = rng.shuffle([
        correct,
        '$\\dfrac{f(a+h) - f(a)}{h}$ with $h = 1$',
        '$\\lim_{h \\to 0} \\dfrac{f(a+h) + f(a)}{h}$',
        '$\\lim_{h \\to 0} \\dfrac{f(a)}{h}$',
      ])
      return {
        prompt: "Which expression defines $f'(a)$, the derivative of $f$ at $a$?",
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: ['The derivative is the limit of secant slopes.'],
        solution: [
          'A secant through $a$ and $a + h$ has slope $\\dfrac{f(a+h) - f(a)}{h}$.',
          'The derivative is the limit of that slope as $h \\to 0$. A fixed $h = 1$ only gives an average rate of change.',
        ],
      }
    },
  },
  {
    id: 'secant-slope',
    title: 'Secant slope',
    skills: ['secant-slope'],
    difficulty: 1,
    generate: (rng) => {
      const { a, b, c, f, tex: ft } = quadratic(rng)
      const p = rng.int(-3, 2)
      const q = p + rng.int(1, 3)
      const m = (f(q) - f(p)) / (q - p)
      return {
        prompt: `For $f(x) = ${ft}$, find the slope of the secant line through the points of the graph at $x = ${p}$ and $x = ${q}$.`,
        answer: { kind: 'number', value: m },
        hints: [
          'The slope of a secant through $x = p$ and $x = q$ is $\\dfrac{f(q) - f(p)}{q - p}$.',
          `Start by computing $f(${p})$ and $f(${q})$.`,
        ],
        solution: [
          `$f(${p}) = ${f(p)}$ and $f(${q}) = ${f(q)}$.`,
          `$m = \\dfrac{f(${q}) - f(${p})}{${q} - ${paren(p)}} = \\dfrac{${f(q) - f(p)}}{${q - p}} = ${m}$.`,
        ],
        data: { a, b, c, p, q },
      }
    },
  },
  {
    id: 'difference-quotient',
    title: 'Difference quotient',
    skills: ['definition'],
    difficulty: 2,
    generate: (rng) => {
      const { a, b, c, f, tex: ft } = quadratic(rng)
      const x0 = rng.int(-3, 3)
      const linear = 2 * a * x0 + b
      return {
        prompt: `For $f(x) = ${ft}$ and $x_0 = ${x0}$, simplify the difference quotient $$\\frac{f(x_0 + h) - f(x_0)}{h}, \\quad h \\neq 0,$$ to an expression in $h$.`,
        answer: {
          kind: 'expression',
          tex: sum([
            [a, 'h'],
            [linear, ''],
          ]),
          ranges: { h: [0.2, 2] },
        },
        hints: [
          `Expand $f(${x0} + h)$ first, using $(${x0} + h)^2 = ${x0 * x0} + ${2 * x0}h + h^2$.`,
          'After subtracting $f(x_0)$, every remaining term has a factor $h$.',
        ],
        solution: [
          `$f(x_0) = f(${x0}) = ${f(x0)}$.`,
          `$f(${x0} + h) = ${sum([
            [a, 'h^2'],
            [linear, 'h'],
            [f(x0), ''],
          ])}$.`,
          `$f(${x0} + h) - f(${x0}) = ${sum([
            [a, 'h^2'],
            [linear, 'h'],
          ])}$.`,
          `Dividing by $h$: $${sum([
            [a, 'h'],
            [linear, ''],
          ])}$.`,
        ],
        data: { a, b, c, x0 },
      }
    },
  },
  {
    id: 'derivative-at-point',
    title: 'Derivative at a point',
    skills: ['definition'],
    difficulty: 2,
    generate: (rng) => {
      const { a, b, c, tex: ft } = quadratic(rng)
      const x0 = rng.int(-3, 3)
      const d = 2 * a * x0 + b
      return {
        prompt: `Use the limit definition to find $f'(${x0})$ for $f(x) = ${ft}$.`,
        answer: { kind: 'number', value: d },
        hints: [
          `Simplify $\\dfrac{f(${x0} + h) - f(${x0})}{h}$ first, then let $h \\to 0$.`,
          'The simplified quotient is a linear expression in $h$.',
        ],
        solution: [
          `$f(${x0} + h) - f(${x0}) = ${sum([
            [a, 'h^2'],
            [d, 'h'],
          ])}$.`,
          `$\\dfrac{f(${x0} + h) - f(${x0})}{h} = ${sum([
            [a, 'h'],
            [d, ''],
          ])}$.`,
          `$f'(${x0}) = \\lim_{h \\to 0} (${sum([
            [a, 'h'],
            [d, ''],
          ])}) = ${d}$.`,
        ],
        data: { a, b, c, x0 },
      }
    },
  },
  {
    id: 'derivative-function',
    title: 'Derivative function',
    skills: ['definition'],
    difficulty: 3,
    generate: (rng): Problem => {
      if (rng.bool()) {
        const { a, b, c, tex: ft } = quadratic(rng)
        const d = sum([
          [2 * a, 'x'],
          [b, ''],
        ])
        return {
          prompt: `Use the limit definition to find $f'(x)$ for $f(x) = ${ft}$.`,
          answer: { kind: 'expression', tex: d },
          hints: [
            'Use $(x + h)^2 = x^2 + 2xh + h^2$.',
            'Terms without $h$ cancel after subtracting $f(x)$.',
          ],
          solution: [
            `$f(x + h) - f(x) = ${sum([
              [a, '(2xh + h^2)'],
              [b, 'h'],
            ])}$.`,
            `$\\dfrac{f(x + h) - f(x)}{h} = ${sum([
              [2 * a, 'x'],
              [a, 'h'],
              [b, ''],
            ])}$.`,
            `Letting $h \\to 0$: $f'(x) = ${d}$.`,
          ],
          data: { degree: 2, a, b, c },
        }
      }
      const a = rng.nonZeroInt(-3, 3)
      const b = rng.int(-5, 5)
      const ft = poly([a, 0, b, 0])
      const d = sum([
        [3 * a, 'x^2'],
        [b, ''],
      ])
      return {
        prompt: `Use the limit definition to find $f'(x)$ for $f(x) = ${ft}$.`,
        answer: { kind: 'expression', tex: d },
        hints: [
          'Use $(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$.',
          'After dividing by $h$, two terms still contain $h$.',
        ],
        solution: [
          `$f(x + h) - f(x) = ${sum([
            [a, '(3x^2h + 3xh^2 + h^3)'],
            [b, 'h'],
          ])}$.`,
          `$\\dfrac{f(x + h) - f(x)}{h} = ${sum([
            [3 * a, 'x^2'],
            [3 * a, 'xh'],
            [a, 'h^2'],
            [b, ''],
          ])}$.`,
          `Letting $h \\to 0$: $f'(x) = ${d}$.`,
        ],
        data: { degree: 3, a, b },
      }
    },
  },
  {
    id: 'tangent-line',
    title: 'Tangent line',
    skills: ['definition'],
    difficulty: 3,
    generate: (rng) => {
      const { a, b, c, f, tex: ft } = quadratic(rng)
      const x0 = rng.int(-2, 2)
      const m = 2 * a * x0 + b
      const y0 = f(x0)
      const line = sum([
        [m, 'x'],
        [y0 - m * x0, ''],
      ])
      return {
        prompt: `Find the tangent line to the graph of $f(x) = ${ft}$ at $x = ${x0}$. Write it as $y = mx + k$ (typing only $mx + k$ is fine).`,
        answer: { kind: 'expression', tex: line },
        hints: [
          `The tangent touches the graph at $(${x0}, f(${x0}))$ and has slope $f'(${x0})$.`,
          `$f'(x) = ${sum([
            [2 * a, 'x'],
            [b, ''],
          ])}$, so the slope is $f'(${x0})$.`,
        ],
        solution: [
          `Point: $f(${x0}) = ${y0}$. Slope: $f'(${x0}) = ${m}$.`,
          `$y - ${paren(y0)} = ${m}(x - ${paren(x0)})$.`,
          `$y = ${line}$.`,
        ],
        data: { a, b, c, x0 },
      }
    },
  },
  {
    id: 'reciprocal-at-point',
    title: 'Derivative of k/x',
    skills: ['definition'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.nonZeroInt(-6, 6)
      const x0 = rng.nonZeroInt(-4, 4)
      const ft = `${k < 0 ? '-' : ''}\\dfrac{${Math.abs(k)}}{x}`
      return {
        prompt: `Use the limit definition to find $f'(${x0})$ for $f(x) = ${ft}$.`,
        answer: { kind: 'number', value: -k / (x0 * x0) },
        hints: [
          `Write $f(${x0} + h) - f(${x0})$ over the common denominator $${x0}(${x0} + h)$, as with limits of differences of fractions.`,
          'After combining, the numerator is a multiple of $h$, which cancels.',
        ],
        solution: [
          `$\\dfrac{${k}}{${x0} + h} - \\dfrac{${k}}{${x0}} = \\dfrac{${k} \\cdot ${paren(x0)} - ${paren(k)}(${x0} + h)}{${x0}(${x0} + h)} = \\dfrac{${-k}h}{${x0}(${x0} + h)}$.`,
          `Dividing by $h$: $\\dfrac{${-k}}{${x0}(${x0} + h)}$.`,
          `Letting $h \\to 0$: $f'(${x0}) = \\dfrac{${-k}}{${x0 * x0}} = ${frac(-k, x0 * x0)}$.`,
        ],
        data: { k, x0 },
      }
    },
  },
  {
    id: 'root-at-point',
    title: 'Derivative of a square root',
    skills: ['definition'],
    difficulty: 3,
    generate: (rng) => {
      const c = rng.int(1, 4)
      const a = rng.int(1, 5)
      const x0 = a * a
      const ft = c === 1 ? '\\sqrt{x}' : `${c}\\sqrt{x}`
      return {
        prompt: `Use the limit definition to find $f'(${x0})$ for $f(x) = ${ft}$.`,
        answer: { kind: 'number', value: c / (2 * a) },
        hints: [
          `Multiply $\\dfrac{\\sqrt{${x0} + h} - ${a}}{h}$ by $\\dfrac{\\sqrt{${x0} + h} + ${a}}{\\sqrt{${x0} + h} + ${a}}$, as when rationalizing a limit.`,
          `The numerator becomes $(${x0} + h) - ${x0} = h$.`,
        ],
        solution: [
          `$f(${x0}) = ${c === 1 ? '' : `${c} \\cdot `}${a}$, so the quotient is $${c === 1 ? '' : c}\\dfrac{\\sqrt{${x0} + h} - ${a}}{h}$.`,
          `Rationalizing: $\\dfrac{\\sqrt{${x0} + h} - ${a}}{h} = \\dfrac{h}{h(\\sqrt{${x0} + h} + ${a})} = \\dfrac{1}{\\sqrt{${x0} + h} + ${a}}$.`,
          `Letting $h \\to 0$: $f'(${x0}) = ${c === 1 ? '' : `${c} \\cdot `}\\dfrac{1}{${2 * a}} = ${frac(c, 2 * a)}$.`,
        ],
        data: { c, a },
      }
    },
  },
  {
    id: 'differentiable-join',
    title: 'A smooth join',
    skills: ['derivative-graphs'],
    difficulty: 3,
    generate: (rng) => {
      const p = rng.nonZeroInt(-2, 2)
      const b = rng.int(-4, 4)
      const a = rng.nonZeroInt(-2, 3)
      const y0 = p * a * a + b * a
      const m = 2 * p * a + b
      const shift = sum([
        [1, 'x'],
        [-a, ''],
      ])
      return {
        prompt: `The function $$f(x) = \\begin{cases} ${poly([p, b, 0])} & x < ${a} \\\\ m(${shift})${signed(y0)} & x \\ge ${a} \\end{cases}$$ is continuous at $x = ${a}$ for every $m$. Find the value of $m$ that makes $f$ differentiable at $x = ${a}$.`,
        answer: { kind: 'number', value: m },
        hints: [
          'Differentiable means the slope from the left equals the slope from the right, so the graph has no corner.',
          `The left piece has slope $${sum([
            [2 * p, 'x'],
            [b, ''],
          ])}$ at $x$; the right piece is a line with slope $m$.`,
        ],
        solution: [
          `Both pieces equal $${num(y0)}$ at $x = ${a}$, so $f$ is continuous there.`,
          `Left slope at $${a}$: $${2 * p} \\cdot ${paren(a)}${signed(b)} = ${m}$. Right slope: $m$.`,
          `The slopes must match, so $m = ${m}$. Any other $m$ leaves a corner.`,
        ],
        data: { p, b, a },
      }
    },
  },
])
