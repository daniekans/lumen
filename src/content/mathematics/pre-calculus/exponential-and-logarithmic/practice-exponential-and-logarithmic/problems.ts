import { defineProblems, tex } from '@/lib/practice'

const { frac, num, sum } = tex

/** \log_{b} as TeX. */
const log = (b: number) => `\\log_{${b}}`

/** b^k as TeX, with negative powers as fractions: 8, \frac{1}{9}. */
const power = (b: number, k: number) => (k >= 0 ? String(b ** k) : frac(1, b ** -k))

/** x + h as TeX: x + 2, x - 3, or x. */
const shifted = (h: number) =>
  sum([
    [1, 'x'],
    [h, ''],
  ])

/** A term with an exponent that is left out when it is 1: x, x^{3}. */
const pow = (v: string, k: number) => (k === 1 ? v : `${v}^{${k}}`)

/** A short decimal: 0.05, 1.1, 2. Rates read better as decimals than as fractions. */
const dec = (v: number) => String(+v.toFixed(4))

/**
 * Equations log_b x + log_b (x + d) = k with a whole number root r: b^k = r(r + d). The other root
 * of x^2 + dx - b^k = 0 is -(r + d), which is extraneous.
 */
const EXTRANEOUS = [2, 3, 5, 6, 10].flatMap((b) =>
  [1, 2, 3, 4, 5, 6]
    .filter((k) => b ** k <= 100)
    .flatMap((k) => {
      const n = b ** k
      const out: { b: number; k: number; r: number; d: number }[] = []
      for (let r = 1; r * r < n; r++) if (n % r === 0) out.push({ b, k, r, d: n / r - r })
      return out
    }),
)

export const problems = defineProblems([
  {
    id: 'evaluate-log',
    title: 'Evaluate a logarithm',
    skills: ['logarithms'],
    difficulty: 1,
    generate: (rng) => {
      if (rng.bool()) {
        const b = rng.pick([2, 3, 4, 5, 10])
        const k = rng.int(-2, b === 10 ? 3 : 4)
        const arg = power(b, k)
        return {
          prompt: `Find $${log(b)} ${arg}$.`,
          answer: { kind: 'number', value: k },
          hints: [`Ask which power of $${b}$ gives $${arg}$.`],
          solution: [
            k < 0 ? `$${arg} = \\frac{1}{${b}^{${-k}}} = ${b}^{${k}}$.` : `$${arg} = ${b}^{${k}}$.`,
            `So $${log(b)} ${arg} = ${k}$.`,
          ],
          data: { b, arg: b ** k },
        }
      }
      // A base and an argument that are both powers of s: log_{s^p} s^q = q / p.
      const s = rng.pick([2, 3])
      const p = rng.pick([2, 3])
      const q = rng.pick([1, 2, 3, 4, 5].filter((v) => v % p !== 0 && s ** v <= 243))
      const [b, arg] = [s ** p, s ** q]
      return {
        prompt: `Find $${log(b)} ${arg}$.`,
        answer: { kind: 'number', value: q / p },
        hints: [
          `Write both numbers as powers of $${s}$.`,
          `If $${b}^y = ${arg}$, then $${s}^{${p}y} = ${s}^{${q}}$.`,
        ],
        solution: [
          `$${b} = ${s}^{${p}}$ and $${arg} = ${s}^{${q}}$.`,
          `$${b}^y = ${s}^{${p}y}$ equals $${s}^{${q}}$ when $${p}y = ${q}$.`,
          `So $${log(b)} ${arg} = ${frac(q, p)}$.`,
        ],
        data: { b, arg },
      }
    },
  },
  {
    id: 'expand-log',
    title: 'Expand a logarithm',
    skills: ['logarithms'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(2, 4)
      const n = rng.int(1, 3)
      const k = rng.int(1, 3)
      const arg = `\\frac{${pow('x', m)}${pow('y', n)}}{${pow('z', k)}}`
      const correct = sum([
        [m, '\\ln x'],
        [n, '\\ln y'],
        [-k, '\\ln z'],
      ])
      const wrong = [
        '\\ln x + \\ln y - \\ln z',
        sum([
          [m, '\\ln x'],
          [n, '\\ln y'],
          [k, '\\ln z'],
        ]),
        `\\frac{${sum([
          [m, '\\ln x'],
          [n, '\\ln y'],
        ])}}{${sum([[k, '\\ln z']])}}`,
      ]
      const options = rng.shuffle([correct, ...wrong].map((o) => `$${o}$`))
      return {
        prompt: `For positive $x$, $y$ and $z$, which is equal to $\\ln ${arg}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(`$${correct}$`) },
        hints: [
          'A quotient becomes a difference, a product a sum.',
          'A power comes down as a factor: $\\ln (u^k) = k \\ln u$.',
        ],
        solution: [
          `$\\ln ${arg} = \\ln (${pow('x', m)}) + \\ln (${pow('y', n)}) - \\ln (${pow('z', k)})$.`,
          `Bring the powers down: $${correct}$.`,
        ],
        data: { m, n, k },
      }
    },
  },
  {
    id: 'combine-logs',
    title: 'Combine logarithms',
    skills: ['logarithms'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.pick([2, 3, 5])
      // k >= 2 leaves a split of c * b^k into two factors other than c and b^k.
      const k = rng.int(2, b === 5 ? 2 : 3)
      const c = rng.pick([3, 6, 7, 10, 11].filter((v) => v % b !== 0))
      const n = c * b ** k
      const divisors = Array.from({ length: n - 1 }, (_, i) => i + 1).filter(
        (d) => d > 1 && d < n && n % d === 0 && d !== c && n / d !== c,
      )
      const a = rng.pick(divisors)
      const d = n / a
      const expr = `${log(b)} ${a} + ${log(b)} ${d} - ${log(b)} ${c}`
      return {
        prompt: `Find $${expr}$.`,
        answer: { kind: 'number', value: k },
        hints: [
          'Combine into one logarithm: a sum multiplies the arguments, a difference divides.',
        ],
        solution: [
          `$${expr} = ${log(b)} \\frac{${a} \\cdot ${d}}{${c}}$.`,
          `$\\frac{${a * d}}{${c}} = ${b ** k} = ${b}^{${k}}$, so the value is $${k}$.`,
        ],
        data: { b, a, d, c },
      }
    },
  },
  {
    id: 'exponential-model',
    title: 'Exponential through two points',
    skills: ['exponential-models'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([2, 3, 5, 6])
      const b = rng.pick([2, 3, 4, 0.5])
      const [x1, x2] = rng.pick([
        [1, 3],
        [2, 4],
        [0, 2],
        [1, 2],
      ] as const)
      const target = rng.pick([0, 1, 2, 3, 5].filter((x) => x !== x1 && x !== x2))
      const [y1, y2] = [a * b ** x1, a * b ** x2]
      const value = a * b ** target
      const gap = x2 - x1
      return {
        prompt: `An exponential function $f(x) = a \\cdot b^x$ with $b > 0$ has $f(${x1}) = ${num(y1, 64)}$ and $f(${x2}) = ${num(y2, 64)}$. Find $f(${target})$.`,
        answer: { kind: 'number', value },
        hints: [
          `Divide the two values: $\\frac{f(${x2})}{f(${x1})} = ${pow('b', gap)}$.`,
          'Then find $a$ from one of the points.',
        ],
        solution: [
          `$${pow('b', gap)} = \\frac{${num(y2, 64)}}{${num(y1, 64)}} = ${num(b ** gap, 64)}$, so $b = ${num(b)}$.`,
          `$a = \\frac{f(${x1})}{b^{${x1}}} = ${num(a)}$.`,
          `$f(${target}) = ${a} \\cdot ${b < 1 ? `\\left(${num(b)}\\right)` : b}^{${target}} = ${num(value, 64)}$.`,
        ],
        data: { x1, y1, x2, y2, target },
      }
    },
  },
  {
    id: 'half-life',
    title: 'Half-life',
    skills: ['exponential-models'],
    difficulty: 1,
    generate: (rng) => {
      const m = rng.int(1, 4)
      const h = rng.pick([2, 3, 5, 6, 8])
      const left = rng.int(5, 40)
      const a0 = left * 2 ** m
      const t = m * h
      const askTime = rng.bool()
      const model = `A(t) = ${a0} \\left(\\tfrac{1}{2}\\right)^{t / ${h}}`
      return askTime
        ? {
            prompt: `A sample of $${a0}$ mg has a half-life of $${h}$ hours. After how many hours are $${left}$ mg left?`,
            answer: { kind: 'number', value: t },
            hints: [
              `How many times must $${a0}$ be halved to reach $${left}$?`,
              'Each halving takes one half-life.',
            ],
            solution: [
              `$\\frac{${a0}}{${left}} = ${2 ** m} = 2^{${m}}$: ${m === 1 ? 'one halving' : `${m} halvings`}.`,
              `$${m} \\cdot ${h} = ${t}$ hours.`,
            ],
            data: { a0, h, t, left },
          }
        : {
            prompt: `A sample of $${a0}$ mg has a half-life of $${h}$ hours. How many mg are left after $${t}$ hours?`,
            answer: { kind: 'number', value: left },
            hints: [`$${t}$ hours is how many half-lives?`, `Use $${model}$.`],
            solution: [
              `$\\frac{${t}}{${h}} = ${m}$ half-lives.`,
              `$${a0} \\cdot \\left(\\tfrac{1}{2}\\right)^{${m}} = \\frac{${a0}}{${2 ** m}} = ${left}$ mg.`,
            ],
            data: { a0, h, t, left },
          }
    },
  },
  {
    id: 'continuous-growth',
    title: 'Continuous growth',
    skills: ['natural-exponential'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.pick([500, 1000, 2000, 2500])
      const pct = rng.int(2, 8)
      const t = rng.pick([5, 10, 15, 20])
      const r = pct / 100
      const value = p * Math.exp(r * t)
      return {
        prompt: `$${p}$ is invested at $${pct}\\%$ a year, compounded continuously. What is the balance after $${t}$ years, to the nearest whole number?`,
        answer: { kind: 'number', value, tolerance: 0.51 },
        hints: ['Continuous growth at rate $r$ is $A = Pe^{rt}$.', `Here $rt = ${dec(r * t)}$.`],
        solution: [
          `$A = ${p} e^{${dec(r)} \\cdot ${t}} = ${p} e^{${dec(r * t)}}$.`,
          `$e^{${dec(r * t)}} \\approx ${(+Math.exp(r * t).toFixed(5)).toString()}$, so $A \\approx ${Math.round(value)}$.`,
        ],
        data: { p, r, t },
      }
    },
  },
  {
    id: 'doubling-time',
    title: 'Doubling time',
    skills: ['natural-exponential', 'exponential-models'],
    difficulty: 2,
    generate: (rng) => {
      const pct = rng.pick([2, 3, 4, 5, 6, 8, 10, 12])
      const r = pct / 100
      const continuous = rng.bool()
      const value = continuous ? Math.log(2) / r : Math.log(2) / Math.log(1 + r)
      const how = continuous ? 'compounded continuously' : 'compounded once a year'
      return {
        prompt: `A quantity grows at $${pct}\\%$ a year, ${how}. How many years does it take to double? Give two decimal places.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: continuous
          ? ['Solve $e^{rt} = 2$.', 'Take $\\ln$ of both sides: $rt = \\ln 2$.']
          : [
              `Solve $${dec(1 + r)}^t = 2$.`,
              `Take $\\ln$ of both sides: $t \\ln ${dec(1 + r)} = \\ln 2$.`,
            ],
        solution: continuous
          ? [
              `$e^{${dec(r)}t} = 2$, so $${dec(r)}t = \\ln 2$.`,
              `$t = \\frac{\\ln 2}{${dec(r)}} \\approx ${value.toFixed(2)}$ years.`,
            ]
          : [
              `$${dec(1 + r)}^t = 2$, so $t \\ln ${dec(1 + r)} = \\ln 2$.`,
              `$t = \\frac{\\ln 2}{\\ln ${dec(1 + r)}} \\approx ${value.toFixed(2)}$ years.`,
            ],
        data: { r, continuous: continuous ? 1 : 0 },
      }
    },
  },
  {
    id: 'solve-exponential',
    title: 'Solve an exponential equation',
    skills: ['exp-log-equations'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([1, 2, 3, 5])
      const b = rng.pick([2, 3, 5])
      const h = rng.int(-2, 2)
      const e = rng.int(0, b === 2 ? 6 : 4)
      const x = e - h
      const c = a * b ** e
      const lhs = `${a === 1 ? '' : `${a} \\cdot `}${b}^{${shifted(h)}}`
      return {
        prompt: `Solve $${lhs} = ${c}$.`,
        answer: { kind: 'number', value: x },
        hints: [
          a === 1 ? `Write $${c}$ as a power of $${b}$.` : `Divide both sides by $${a}$ first.`,
          'Equal powers of the same base have equal exponents.',
        ],
        solution: [
          ...(a === 1 ? [] : [`Divide by $${a}$: $${b}^{${shifted(h)}} = ${b ** e}$.`]),
          `$${b ** e} = ${b}^{${e}}$, so $${shifted(h)} = ${e}$.`,
          `$x = ${x}$.`,
        ],
        data: { a, b, h, c },
      }
    },
  },
  {
    id: 'solve-with-ln',
    title: 'Solve with ln',
    skills: ['exp-log-equations', 'natural-exponential'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([2, 3, 4, 5])
      const k = rng.pick([1, 2, 3])
      const m = rng.pick([3, 5, 6, 7, 10])
      const c = a * m
      const value = Math.log(m) / k
      const lhs = `${a}e^{${k === 1 ? '' : k}x}`
      return {
        prompt: `Solve $${lhs} = ${c}$. Give two decimal places, or an exact form with $\\ln$.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [`Divide by $${a}$ first.`, 'Then take $\\ln$ of both sides.'],
        solution: [
          `$e^{${k === 1 ? '' : k}x} = ${m}$.`,
          `$${k === 1 ? '' : k}x = \\ln ${m}$, so $x = ${k === 1 ? `\\ln ${m}` : `\\frac{\\ln ${m}}{${k}}`} \\approx ${value.toFixed(2)}$.`,
        ],
        data: { a, k, c },
      }
    },
  },
  {
    id: 'solve-log',
    title: 'Solve a logarithmic equation',
    skills: ['exp-log-equations', 'logarithms'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.pick([2, 3, 5, 10])
      const k = rng.int(1, b === 2 ? 4 : 2)
      const h = rng.nonZeroInt(-6, 6)
      const x = b ** k - h
      return {
        prompt: `Solve $${log(b)}(${shifted(h)}) = ${k}$.`,
        answer: { kind: 'number', value: x },
        hints: [`$${log(b)} u = ${k}$ means $u = ${b}^{${k}}$.`],
        solution: [
          `$${shifted(h)} = ${b}^{${k}} = ${b ** k}$.`,
          `$x = ${x}$. Check: $${shifted(h)} = ${b ** k} > 0$, so the logarithm is defined.`,
        ],
        data: { b, h, k },
      }
    },
  },
  {
    id: 'extraneous-log',
    title: 'Logarithms with a false root',
    skills: ['exp-log-equations', 'logarithms'],
    difficulty: 3,
    generate: (rng) => {
      const { b, k, r, d } = rng.pick(EXTRANEOUS)
      const n = b ** k
      const other = -(r + d)
      return {
        prompt: `Solve $${log(b)} x + ${log(b)}(x + ${d}) = ${k}$.`,
        answer: { kind: 'number', value: r },
        hints: [
          'Combine the left side into one logarithm.',
          `Then $x(x + ${d}) = ${b}^{${k}}$. Check each root in the original equation.`,
        ],
        solution: [
          `$${log(b)} \\big(x(x + ${d})\\big) = ${k}$, so $x^2 + ${d === 1 ? '' : d}x = ${n}$.`,
          `$x^2 + ${d === 1 ? '' : d}x - ${n} = (x - ${r})(x + ${r + d}) = 0$, so $x = ${r}$ or $x = ${other}$.`,
          `$${log(b)}(${other})$ is not defined, so $${other}$ is extraneous. The solution is $x = ${r}$.`,
        ],
        data: { b, k, d, other },
      }
    },
  },
])
