import { defineProblems, tex } from '@/lib/practice'

const { paren, poly, sum, term } = tex

/** `x - h` with the sign folded in: x - 2, x + 3. */
const shift = (h: number, v = 'x') =>
  sum([
    [1, v],
    [-h, ''],
  ])

export const problems = defineProblems([
  {
    id: 'compose-evaluate',
    title: 'Evaluate a composition',
    skills: ['compose'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-4, 4)
      const b = rng.int(-5, 5)
      const c = rng.int(-5, 5)
      const k = rng.int(-3, 3)
      const fg = rng.bool()
      const f = (x: number) => a * x + b
      const g = (x: number) => x * x + c
      const inner = fg ? g(k) : f(k)
      const value = fg ? f(inner) : g(inner)
      const [outerName, innerName] = fg ? ['f', 'g'] : ['g', 'f']
      return {
        prompt: `Let $f(x) = ${poly([a, b])}$ and $g(x) = ${poly([1, 0, c])}$. Find $${outerName}(${innerName}(${k}))$.`,
        answer: { kind: 'number', value },
        hints: [`Work from the inside out: compute $${innerName}(${k})$ first.`],
        solution: [
          `$${innerName}(${k}) = ${inner}$.`,
          `$${outerName}(${inner}) = ${value}$, so $${outerName}(${innerName}(${k})) = ${value}$.`,
        ],
        data: { a, b, c, k, fg: fg ? 1 : 0 },
      }
    },
  },
  {
    id: 'compose-formula',
    title: 'Formula of a composition',
    skills: ['compose'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.int(-5, 5)
      const m = rng.nonZeroInt(-3, 3, [1])
      const q = rng.nonZeroInt(-4, 4)
      const fg = rng.bool()
      const g = poly([m, q])
      const answer = fg ? poly([m * m, 2 * m * q, q * q + p]) : poly([m, 0, m * p + q])
      return {
        prompt: `Let $f(x) = ${poly([1, 0, p])}$ and $g(x) = ${g}$. Find $(${fg ? 'f \\circ g' : 'g \\circ f'})(x)$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          fg
            ? `$(f \\circ g)(x) = f(g(x))$: substitute $(${g})$ for $x$ in $f$.`
            : `$(g \\circ f)(x) = g(f(x))$: substitute $(${poly([1, 0, p])})$ for $x$ in $g$.`,
        ],
        solution: fg
          ? [
              `$f(g(x)) = (${g})^2 ${p < 0 ? '-' : '+'} ${Math.abs(p)}$.`,
              `$(${g})^2 = ${poly([m * m, 2 * m * q, q * q])}$.`,
              `$f(g(x)) = ${answer}$.`,
            ]
          : [
              `$g(f(x)) = ${term(m, `(${poly([1, 0, p])})`)} ${q < 0 ? '-' : '+'} ${Math.abs(q)}$.`,
              `$= ${answer}$.`,
            ],
        data: { p, m, q, fg: fg ? 1 : 0 },
      }
    },
  },
  {
    id: 'decompose',
    title: 'Find the inner function',
    skills: ['compose'],
    difficulty: 3,
    generate: (rng) => {
      const m = rng.nonZeroInt(-4, 4, [1])
      const q = rng.nonZeroInt(-6, 6)
      const g = poly([m, q])
      return {
        prompt: `Let $f(x) = x^3$ and $h(x) = (${g})^3$. Find the function $g$ with $h = f \\circ g$.`,
        answer: { kind: 'expression', tex: g },
        hints: [
          '$f$ cubes whatever it receives. What does $h$ cube?',
          'Since cubing is one-to-one, $g$ is the only function that works.',
        ],
        solution: [
          `$f(g(x)) = (g(x))^3$, and this must equal $(${g})^3$ for every $x$.`,
          `Taking cube roots: $g(x) = ${g}$.`,
        ],
        data: { m, q },
      }
    },
  },
  {
    id: 'inverse-evaluate',
    title: 'Evaluate an inverse',
    skills: ['inverse'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5, [1, -1])
      const b = rng.int(-9, 9)
      const k = rng.int(-4, 4)
      const c = a * k + b
      return {
        prompt: `Let $f(x) = ${poly([a, b])}$. Find $f^{-1}(${c})$.`,
        answer: { kind: 'number', value: k },
        hints: [`$f^{-1}(${c})$ is the input $x$ with $f(x) = ${c}$.`],
        solution: [
          `Solve $${poly([a, b])} = ${c}$.`,
          `$${term(a, 'x')} = ${c - b}$, so $x = ${k}$.`,
          `Check: $f(${k}) = ${c}$.`,
        ],
        data: { a, b, k },
      }
    },
  },
  {
    id: 'inverse-linear',
    title: 'Inverse of a linear function',
    skills: ['inverse'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.nonZeroInt(-5, 5, [1])
      const b = rng.nonZeroInt(-9, 9)
      const answer =
        a === -1
          ? sum([
              [-1, 'x'],
              [b, ''],
            ])
          : `${a < 0 ? '-' : ''}\\frac{${shift(b)}}{${Math.abs(a)}}`
      return {
        prompt: `Find the inverse of $f(x) = ${poly([a, b])}$.`,
        answer: { kind: 'expression', tex: answer },
        hints: [
          'Write $y = f(x)$ and solve for $x$.',
          `First move $${paren(b)}$ to the other side, then divide by $${a}$.`,
        ],
        solution: [
          `$y = ${poly([a, b])}$, so $${term(a, 'x')} = ${shift(b, 'y')}$.`,
          `$x = \\dfrac{${shift(b, 'y')}}{${a}}$.`,
          `Renaming the variable: $f^{-1}(x) = ${answer}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'inverse-cubic',
    title: 'Recognize the inverse',
    skills: ['inverse'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.nonZeroInt(-8, 8)
      const correct = `$\\sqrt[3]{${shift(b)}}$`
      const options = rng.shuffle([
        correct,
        `$${sum([
          [1, '\\sqrt[3]{x}'],
          [-b, ''],
        ])}$`,
        `$\\sqrt[3]{${shift(-b)}}$`,
        `$\\dfrac{1}{${poly([1, 0, 0, b])}}$`,
      ])
      return {
        prompt: `Which function is the inverse of $f(x) = ${poly([1, 0, 0, b])}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(correct) },
        hints: [
          '$f$ cubes first and then adds. The inverse undoes the last step first.',
          '$f^{-1}$ does not mean $\\dfrac{1}{f}$.',
        ],
        solution: [
          `Solve $y = ${poly([1, 0, 0, b])}$ for $x$: $x^3 = ${shift(b, 'y')}$, so $x = \\sqrt[3]{${shift(b, 'y')}}$.`,
          `$f^{-1}(x) = \\sqrt[3]{${shift(b)}}$. Undo the addition first, then the cube.`,
        ],
        data: { b },
      }
    },
  },
  {
    id: 'inverse-rational',
    title: 'Inverse of a fraction',
    skills: ['inverse'],
    difficulty: 3,
    generate: (rng) => {
      const q = rng.nonZeroInt(-5, 5)
      const p = rng.nonZeroInt(-6, 6, [-q])
      const answer = `\\frac{${poly([q, p])}}{x - 1}`
      return {
        prompt: `Find the inverse of $$f(x) = \\frac{${shift(-p)}}{${shift(q)}}.$$`,
        answer: { kind: 'expression', tex: answer, ranges: { x: [2, 6] } },
        hints: [
          `Write $y = \\dfrac{${shift(-p)}}{${shift(q)}}$ and multiply both sides by $${shift(q)}$.`,
          'Collect the terms with $x$ on one side, then factor out $x$.',
        ],
        solution: [
          `$y(${shift(q)}) = ${shift(-p)}$, so $xy ${q < 0 ? '+' : '-'} ${term(Math.abs(q), 'y')} = ${shift(-p)}$.`,
          `$xy - x = ${poly([q, p], 'y')}$, so $x(y - 1) = ${poly([q, p], 'y')}$.`,
          `$x = \\dfrac{${poly([q, p], 'y')}}{y - 1}$, and $f^{-1}(x) = ${answer.replace('\\frac', '\\dfrac')}$.`,
        ],
        data: { p, q },
      }
    },
  },
])
