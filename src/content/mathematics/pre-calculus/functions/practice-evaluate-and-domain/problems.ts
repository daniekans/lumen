import { intervalTex, type Interval } from '@/lib/math'
import { defineProblems, tex } from '@/lib/practice'

const { frac, paren, poly, sum, term } = tex
const R = Infinity

/** Interval notation wrapped for inline TeX, as used by choice options. */
const set = (...parts: Interval[]) => `$${intervalTex(parts)}$`

/** `x - h` with the sign folded in: x - 2, x + 3. */
const shift = (h: number, v = 'x') =>
  sum([
    [1, v],
    [-h, ''],
  ])

export const problems = defineProblems([
  {
    id: 'evaluate-quadratic',
    title: 'Evaluate a formula',
    skills: ['evaluate'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-3, 3)
      const b = rng.int(-6, 6)
      const c = rng.int(-9, 9)
      const k = rng.int(-4, 4)
      const value = a * k * k + b * k + c
      return {
        prompt: `Let $f(x) = ${poly([a, b, c])}$. Find $f(${k})$.`,
        answer: { kind: 'number', value },
        hints: [`Replace every $x$ with $${paren(k)}$, keeping the parentheses.`],
        solution: [
          `$f(${k}) = ${term(a, '')} \\cdot ${paren(k)}^2 + ${paren(b)} \\cdot ${paren(k)} + ${paren(c)}$.`,
          `$= ${a * k * k} + ${paren(b * k)} + ${paren(c)} = ${value}$.`,
        ],
        data: { a, b, c, k },
      }
    },
  },
  {
    id: 'evaluate-piecewise',
    title: 'Piecewise rule',
    skills: ['evaluate'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.int(-2, 2)
      const m = rng.nonZeroInt(-4, 4)
      const q = rng.int(-5, 5)
      const r = rng.int(-5, 5)
      const x = k + rng.pick([-2, -1, 0, 1, 2])
      const left = x < k
      const value = left ? m * x + q : x * x + r
      const leftTex = sum([
        [m, 'x'],
        [q, ''],
      ])
      const rightTex = sum([
        [1, 'x^2'],
        [r, ''],
      ])
      return {
        prompt: `Let $$f(x) = \\begin{cases} ${leftTex} & x < ${k} \\\\ ${rightTex} & x \\geq ${k} \\end{cases}$$ Find $f(${x})$.`,
        answer: { kind: 'number', value },
        hints: [
          `First decide which condition $x = ${x}$ satisfies.`,
          'Only that piece is used; the other one is ignored.',
        ],
        solution: [
          left
            ? `$${x} < ${k}$, so the first piece applies.`
            : `$${x} \\geq ${k}$, so the second piece applies.`,
          left
            ? `$f(${x}) = ${term(m, '')} \\cdot ${paren(x)} + ${paren(q)} = ${value}$.`
            : `$f(${x}) = ${paren(x)}^2 + ${paren(r)} = ${value}$.`,
        ],
        data: { k, m, q, r, x },
      }
    },
  },
  {
    id: 'evaluate-expression',
    title: 'Substitute an expression',
    skills: ['evaluate'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.int(-5, 5)
      const p = rng.nonZeroInt(-4, 4)
      const linear = 2 * p + b
      const constant = p * p + b * p
      const answer = sum([
        [1, 't^2'],
        [linear, 't'],
        [constant, ''],
      ])
      const u = shift(-p, 't')
      return {
        prompt: `Let $f(x) = ${poly([1, b, 0])}$. Write $f(${u})$ as an expression in $t$.`,
        answer: { kind: 'expression', tex: answer, ranges: { t: [-3, 3] } },
        hints: [
          `Replace every $x$ with $(${u})$.`,
          `Expand $(${u})^2 = ${sum([
            [1, 't^2'],
            [2 * p, 't'],
            [p * p, ''],
          ])}$.`,
        ],
        solution: [
          `$f(${u}) = ${sum([
            [1, `(${u})^2`],
            [b, `(${u})`],
          ])}$.`,
          // Both products expanded, as signed terms: t^2 + 2pt + p^2 + bt + bp.
          `$= ${sum([
            [1, 't^2'],
            [2 * p, 't'],
            [p * p, ''],
            [b, 't'],
            [b * p, ''],
          ])}$.`,
          `$= ${answer}$.`,
        ],
        data: { b, p },
      }
    },
  },
  {
    id: 'domain-root',
    title: 'Domain of a square root',
    skills: ['domain-range'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-3, 3)
      const b = rng.int(-6, 6)
      const e = -b / a
      const eTex = frac(-b, a)
      const negTex = frac(b, a)
      const right = a > 0
      const correct = right
        ? set({ from: e, to: R, closedFrom: true, fromTex: eTex })
        : set({ from: -R, to: e, closedTo: true, toTex: eTex })
      const options = rng.shuffle([
        correct,
        right
          ? set({ from: -R, to: e, closedTo: true, toTex: eTex })
          : set({ from: e, to: R, closedFrom: true, fromTex: eTex }),
        right ? set({ from: e, to: R, fromTex: eTex }) : set({ from: -R, to: e, toTex: eTex }),
        e === 0
          ? set({ from: -R, to: R })
          : right
            ? set({ from: -e, to: R, closedFrom: true, fromTex: negTex })
            : set({ from: -R, to: -e, closedTo: true, toTex: negTex }),
      ])
      const inner = poly([a, b])
      return {
        prompt: `What is the domain of $f(x) = \\sqrt{${inner}}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          'A square root is defined only when the expression under it is at least $0$.',
          `Solve $${inner} \\geq 0$. Dividing by a negative number flips the inequality.`,
        ],
        solution: [
          `Require $${inner} \\geq 0$.`,
          right
            ? `$${term(a, 'x')} \\geq ${-b}$, so $x \\geq ${eTex}$.`
            : `$${term(a, 'x')} \\geq ${-b}$. Dividing by $${a}$ flips the inequality: $x \\leq ${eTex}$.`,
          `The domain is ${correct}. The endpoint is included because $\\sqrt{0} = 0$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'domain-fraction',
    title: 'Excluded inputs',
    skills: ['domain-range'],
    difficulty: 2,
    generate: (rng) => {
      const r1 = rng.int(-5, 5)
      const r2 = rng.nonZeroInt(-5, 5, [r1])
      const p = rng.nonZeroInt(-6, 6, [-r1, -r2])
      const den = poly([1, -(r1 + r2), r1 * r2])
      return {
        prompt: `List every real number that is not in the domain of $$f(x) = \\frac{${poly([1, p])}}{${den}}.$$`,
        answer: { kind: 'list', values: [r1, r2] },
        hints: [
          'A fraction is undefined where its denominator is $0$.',
          `Factor $${den}$ as $(x - r_1)(x - r_2)$.`,
        ],
        solution: [
          `$${den} = (${shift(r1)})(${shift(r2)})$.`,
          `The denominator is $0$ for $x = ${r1}$ and $x = ${r2}$, so both are excluded. Every other real number is in the domain.`,
        ],
        data: { r1, r2, p },
      }
    },
  },
  {
    id: 'range-vertex',
    title: 'Range of a parabola',
    skills: ['domain-range'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-3, 3)
      const h = rng.nonZeroInt(-4, 4)
      const k = rng.nonZeroInt(-6, 6, [h])
      const up = a > 0
      const correct = up
        ? set({ from: k, to: R, closedFrom: true })
        : set({ from: -R, to: k, closedTo: true })
      const options = rng.shuffle([
        correct,
        up ? set({ from: -R, to: k, closedTo: true }) : set({ from: k, to: R, closedFrom: true }),
        up ? set({ from: h, to: R, closedFrom: true }) : set({ from: -R, to: h, closedTo: true }),
        set({ from: -R, to: R }),
      ])
      const f = `${term(a, `(${shift(h)})^2`)} ${k < 0 ? '-' : '+'} ${Math.abs(k)}`
      return {
        prompt: `What is the range of $f(x) = ${f}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          `A square is never negative: $(${shift(h)})^2 \\geq 0$, with equality at $x = ${h}$.`,
          `Multiplying by $${a}$ ${up ? 'keeps' : 'flips'} the inequality.`,
        ],
        solution: [
          `$(${shift(h)})^2 \\geq 0$, so $${term(a, `(${shift(h)})^2`)} ${up ? '\\geq' : '\\leq'} 0$.`,
          `Adding $${k}$: $f(x) ${up ? '\\geq' : '\\leq'} ${k}$, with $f(${h}) = ${k}$. Every value on that side is reached.`,
          `The range is ${correct}.`,
        ],
        data: { a, h, k },
      }
    },
  },
  {
    id: 'domain-root-over-linear',
    title: 'Root over a linear factor',
    skills: ['domain-range'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.int(-4, 3)
      const b = a + rng.int(1, 4)
      const correct = set({ from: a, to: b, closedFrom: true }, { from: b, to: R })
      const options = rng.shuffle([
        correct,
        set({ from: a, to: R, closedFrom: true }),
        set({ from: a, to: b }, { from: b, to: R }),
        set({ from: -R, to: b }, { from: b, to: R }),
      ])
      return {
        prompt: `What is the domain of $$f(x) = \\frac{\\sqrt{${shift(a)}}}{${shift(b)}}?$$`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          'Two conditions: the root needs a nonnegative argument, and the denominator must not be $0$.',
          `$x \\geq ${a}$ from the root, $x \\neq ${b}$ from the denominator.`,
        ],
        solution: [
          `The root requires $${shift(a)} \\geq 0$, so $x \\geq ${a}$.`,
          `The denominator requires $x \\neq ${b}$, which lies inside $[${a}, \\infty)$.`,
          `Removing $${b}$ leaves ${correct}.`,
        ],
        data: { a, b },
      }
    },
  },
])
