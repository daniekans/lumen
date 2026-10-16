import { defineProblems, tex } from '@/lib/practice'

const { sum, term } = tex

/** `x - h` with the sign folded in: x - 2, x + 3. */
const shift = (h: number, v = 'x') =>
  sum([
    [1, v],
    [-h, ''],
  ])

/** Base graphs, as TeX applied to an inner expression, and as functions for the tests. */
const bases = [
  { name: 'square', f: (u: string) => (u === 'x' ? 'x^2' : `(${u})^2`) },
  { name: 'abs', f: (u: string) => `|${u}|` },
] as const

/** "right 3", "left 2", "up 1", "down 4". */
const horizontal = (h: number) => `${h > 0 ? 'right' : 'left'} by $${Math.abs(h)}$`
const vertical = (k: number) => `${k > 0 ? 'up' : 'down'} by $${Math.abs(k)}$`
/** "+ 3" or "- 2", for appending a constant. */
const plus = (k: number) => (k < 0 ? `- ${-k}` : `+ ${k}`)

export const problems = defineProblems([
  {
    id: 'shift-formula',
    title: 'Formula from shifts',
    skills: ['transform'],
    difficulty: 1,
    generate: (rng) => {
      const base = rng.int(0, 1)
      const h = rng.nonZeroInt(-5, 5)
      const k = rng.nonZeroInt(-5, 5)
      const b = bases[base]!
      const answer = `${b.f(shift(h))} ${plus(k)}`
      return {
        prompt: `The graph of $f(x) = ${b.f('x')}$ is moved ${horizontal(h)} and ${vertical(k)}. Write the formula of the new graph.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          `Moving right by $h$ replaces $x$ with $x - h$. Moving left uses $x + h$.`,
          'Moving up adds to the output, outside $f$.',
        ],
        solution: [
          `Horizontal: replace $x$ with $${shift(h)}$, giving $${b.f(shift(h))}$.`,
          `Vertical: add $${k}$, giving $y = ${answer}$.`,
        ],
        data: { base, h, k },
      }
    },
  },
  {
    id: 'describe-shift',
    title: 'Describe the shift',
    skills: ['transform'],
    difficulty: 1,
    generate: (rng) => {
      const h = rng.nonZeroInt(-5, 5)
      const k = rng.nonZeroInt(-5, 5)
      const describe = (hh: number, kk: number) => `${horizontal(hh)}, ${vertical(kk)}`
      const correct = describe(h, k)
      const options = rng.shuffle([correct, describe(-h, k), describe(h, -k), describe(-h, -k)])
      return {
        prompt: `How is the graph of $g(x) = (${shift(h)})^2 ${plus(k)}$ obtained from the graph of $f(x) = x^2$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          'Inside the square, $x - h$ moves the graph right by $h$, so $x + h$ moves it left.',
          'Outside, $+k$ moves it up.',
        ],
        solution: [
          `$${shift(h)} = x - ${h < 0 ? `(${h})` : h}$, so the graph moves ${horizontal(h)}.`,
          `The constant $${k}$ outside moves it ${vertical(k)}.`,
        ],
        data: { h, k },
      }
    },
  },
  {
    id: 'reflect-stretch',
    title: 'Reflect and stretch',
    skills: ['transform'],
    difficulty: 2,
    generate: (rng) => {
      const base = rng.int(0, 1)
      const s = rng.int(2, 4)
      const k = rng.nonZeroInt(-5, 5)
      const b = bases[base]!
      const answer = `${term(-s, b.f('x'))} ${plus(k)}`
      return {
        prompt: `Reflect the graph of $f(x) = ${b.f('x')}$ across the $x$-axis, stretch it vertically by a factor of $${s}$, then move it ${vertical(k)}. Write the formula of the result.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          'Reflecting across the $x$-axis and stretching both multiply the output: by $-1$ and by the factor.',
          'Shift last, outside everything else.',
        ],
        solution: [
          `Reflect: $-${b.f('x')}$. Stretch: $${term(-s, b.f('x'))}$.`,
          `Shift: $y = ${answer}$.`,
        ],
        data: { base, s, k },
      }
    },
  },
  {
    id: 'point-image',
    title: 'Where a point goes',
    skills: ['transform'],
    difficulty: 2,
    generate: (rng) => {
      const x0 = rng.int(-3, 3)
      const y0 = rng.nonZeroInt(-4, 4)
      const a = rng.pick([-2, -1, 2, 3])
      const h = rng.nonZeroInt(-4, 4)
      const k = rng.nonZeroInt(-4, 4, [-y0])
      const pt = (x: number, y: number) => `$(${x}, ${y})$`
      const correct = pt(x0 + h, a * y0 + k)
      const options = rng.shuffle([
        correct,
        pt(x0 - h, a * y0 + k),
        pt(x0 + h, a * (y0 + k)),
        pt(x0 + h, y0 + k),
      ])
      const outer = a === -1 ? '-' : String(a)
      return {
        prompt: `The point $(${x0}, ${y0})$ is on the graph of $f$. Which point must be on the graph of $g(x) = ${outer}f(${shift(h)}) ${plus(k)}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          `$g$ reaches the input $${x0}$ of $f$ when $${shift(h)} = ${x0}$.`,
          'The output of $f$ is multiplied first, then shifted.',
        ],
        solution: [
          `$${shift(h)} = ${x0}$ gives $x = ${x0 + h}$.`,
          `$g(${x0 + h}) = ${outer}f(${x0}) ${plus(k)} = ${a} \\cdot ${y0 < 0 ? `(${y0})` : y0} ${plus(k)} = ${a * y0 + k}$.`,
          `The point is ${correct}.`,
        ],
        data: { x0, y0, a, h, k },
      }
    },
  },
  {
    id: 'horizontal-stretch',
    title: 'Horizontal stretch',
    skills: ['transform'],
    difficulty: 3,
    generate: (rng) => {
      const b = rng.pick([-3, -2, 2, 3])
      const m = rng.nonZeroInt(-3, 3)
      const x0 = b * m
      const y0 = rng.int(-5, 5)
      return {
        prompt: `The point $(${x0}, ${y0})$ is on the graph of $f$. The point $(c, ${y0})$ is on the graph of $g(x) = f(${b}x)$. Find $c$.`,
        answer: { kind: 'number', value: m },
        hints: [
          `$g(c) = f(${b}c)$, so $g(c) = ${y0}$ when $${b}c = ${x0}$.`,
          `Multiplying the input by $${b}$ ${Math.abs(b) > 1 ? 'squeezes' : 'stretches'} the graph horizontally${b < 0 ? ' and reflects it across the $y$-axis' : ''}.`,
        ],
        solution: [
          `$${b}c = ${x0}$, so $c = ${m}$.`,
          `Check: $g(${m}) = f(${b} \\cdot ${m < 0 ? `(${m})` : m}) = f(${x0}) = ${y0}$.`,
        ],
        data: { b, m, x0, y0 },
      }
    },
  },
])
