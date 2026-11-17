import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { poly, frac, paren, sum } = tex

/** A decimal without trailing zeros: 0.250 -> '0.25'. */
const dec = (v: number, digits = 4) => String(Number(v.toFixed(digits)))

/**
 * A cubic with critical points p < q: f(x) = s(x^3 - 3/2 (p + q) x^2 + 3pq x) + d, so
 * f'(x) = 3s(x - p)(x - q). p + q is even, so every coefficient is a whole number.
 */
const cubicWithCritical = (rng: Rng) => {
  let p: number
  let q: number
  do {
    p = rng.int(-4, 3)
    q = rng.int(p + 1, 5)
  } while ((p + q) % 2 !== 0)
  const s = rng.pick([1, -1])
  const d = rng.int(-6, 6)
  const c3 = s
  const c2 = (-3 * s * (p + q)) / 2
  const c1 = 3 * s * p * q
  const f = (x: number) => c3 * x ** 3 + c2 * x ** 2 + c1 * x + d
  return {
    p,
    q,
    s,
    d,
    c3,
    c2,
    c1,
    f,
    tex: poly([c3, c2, c1, d]),
    dtex: `${s < 0 ? '-' : ''}3(${poly([1, -p])})(${poly([1, -q])})`,
  }
}

const ROOTS = [
  { k: 2, bases: [16, 25, 36, 49, 64, 81, 100], name: '\\sqrt' },
  { k: 3, bases: [27, 64, 125], name: '\\sqrt[3]' },
] as const

const SHAPES = [
  {
    what: 'the volume of a sphere',
    formula: 'V = \\frac{4}{3}\\pi r^3',
    diff: 'dV = 4\\pi r^2\\,dr',
    unit: '\\text{cm}^3',
    coef: (r: number) => 4 * Math.PI * r * r,
    coefTex: (r: number) => `4\\pi \\cdot ${r}^2`,
  },
  {
    what: 'the area of a circle',
    formula: 'A = \\pi r^2',
    diff: 'dA = 2\\pi r\\,dr',
    unit: '\\text{cm}^2',
    coef: (r: number) => 2 * Math.PI * r,
    coefTex: (r: number) => `2\\pi \\cdot ${r}`,
  },
  {
    what: 'the volume of a cube with edge $r$',
    formula: 'V = r^3',
    diff: 'dV = 3r^2\\,dr',
    unit: '\\text{cm}^3',
    coef: (r: number) => 3 * r * r,
    coefTex: (r: number) => `3 \\cdot ${r}^2`,
  },
] as const

/** Functions for the over-or-under question, each with the sign of f'' on its interval. */
const BENDS = [
  { tex: '\\sqrt{x}', a: [4, 9, 16, 25], concave: -1 },
  { tex: '\\ln x', a: [1, 2, 3, 5], concave: -1 },
  { tex: 'e^x', a: [0, 1, 2], concave: 1 },
  { tex: 'x^3', a: [1, 2, 3], concave: 1 },
  { tex: '\\frac{1}{x}', a: [1, 2, 4], concave: 1 },
] as const

export const problems = defineProblems([
  {
    id: 'linear-estimate',
    title: 'Estimate with the tangent',
    skills: ['linear-approximation'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, 1)
      const root = ROOTS[kind]!
      const b = rng.pick(root.bases)
      const r = Math.round(b ** (1 / root.k))
      // Small steps relative to b, so the estimate is a good one.
      const reach = Math.max(1, Math.floor(b / 12))
      const dx = rng.nonZeroInt(-reach, reach)
      const n = b + dx
      const slopeDen = root.k * r ** (root.k - 1)
      const value = r + dx / slopeDen
      const fx = `${root.name}{x}`
      const dfx = root.k === 2 ? '\\frac{1}{2\\sqrt{x}}' : '\\frac{1}{3\\sqrt[3]{x^2}}'
      return {
        prompt: `Use the linearization of $f(x) = ${fx}$ at $a = ${b}$ to estimate $${root.name}{${n}}$.`,
        answer: { kind: 'number', value, tolerance: 1e-6 },
        hints: [
          "$L(x) = f(a) + f'(a)(x - a)$, with $a$ chosen so that $f(a)$ is easy.",
          `$f'(x) = ${dfx}$, so $f'(${b}) = ${frac(1, slopeDen)}$.`,
        ],
        solution: [
          `$f(${b}) = ${r}$ and $f'(${b}) = ${frac(1, slopeDen)}$; the step is $dx = ${dx}$.`,
          `$${root.name}{${n}} \\approx ${r} + ${frac(1, slopeDen)} \\cdot ${paren(dx)} = ${r} ${dx < 0 ? '-' : '+'} ${frac(Math.abs(dx), slopeDen)} = ${dec(value, 6)}$.`,
        ],
        data: { kind, b, r, dx, k: root.k },
      }
    },
  },
  {
    id: 'differential-error',
    title: 'Error from a measurement',
    skills: ['linear-approximation'],
    difficulty: 2,
    generate: (rng) => {
      const shape = rng.int(0, SHAPES.length - 1)
      const sh = SHAPES[shape]!
      const r = rng.int(2, 12)
      const dr = rng.pick([0.05, 0.1, 0.2])
      const value = sh.coef(r) * dr
      return {
        prompt: `A length $r$ is measured as $${r}$ cm, with an error of at most $${dr}$ cm. Use differentials to estimate the largest error in ${sh.what}, in $${sh.unit}$. Give it exactly (with $\\pi$) or to two decimal places.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          `Start from $${sh.formula}$ and take differentials in $r$.`,
          `$${sh.diff}$, with $dr = ${dr}$.`,
        ],
        solution: [
          `$${sh.diff} = ${sh.coefTex(r)} \\cdot ${dr} \\approx ${value.toFixed(2)}\\ ${sh.unit}$.`,
        ],
        data: { shape, r, dr },
      }
    },
  },
  {
    id: 'estimate-sign',
    title: 'Too high or too low?',
    skills: ['linear-approximation', 'concavity'],
    difficulty: 2,
    generate: (rng) => {
      const which = rng.int(0, BENDS.length - 1)
      const fn = BENDS[which]!
      const a = rng.pick(fn.a)
      const dx = rng.pick([-0.3, -0.2, -0.1, 0.1, 0.2, 0.3])
      const high = fn.concave < 0
      return {
        prompt: `The tangent line of $f(x) = ${fn.tex}$ at $a = ${a}$ is used to estimate $f(${dec(a + dx)})$. Is the estimate too high or too low?`,
        answer: { kind: 'choice', options: ['Too high', 'Too low'], correct: high ? 0 : 1 },
        hints: [
          'A concave up graph lies above its tangents; a concave down graph lies below them.',
          `Find the sign of $f''$ near $x = ${a}$.`,
        ],
        solution: [
          `$f''$ is ${high ? 'negative' : 'positive'} near $x = ${a}$, so $f$ is concave ${high ? 'down' : 'up'} there.`,
          `The graph lies ${high ? 'below' : 'above'} the tangent on both sides of $a$, so the estimate is too ${high ? 'high' : 'low'}, whichever side $${dec(a + dx)}$ is on.`,
        ],
        data: { which, a, dx },
      }
    },
  },
  {
    id: 'critical-points',
    title: 'Critical points',
    skills: ['extrema'],
    difficulty: 1,
    generate: (rng) => {
      const c = cubicWithCritical(rng)
      return {
        prompt: `Find the critical points of $f(x) = ${c.tex}$. Enter them separated by commas.`,
        answer: { kind: 'list', values: [c.p, c.q] },
        hints: [
          "Critical points are where $f'(x) = 0$ or $f'$ does not exist. A polynomial has a derivative everywhere.",
          `Factor $f'(x) = ${poly([3 * c.c3, 2 * c.c2, c.c1])}$.`,
        ],
        solution: [
          `$f'(x) = ${poly([3 * c.c3, 2 * c.c2, c.c1])} = ${c.dtex}$.`,
          `$f'(x) = 0$ at $x = ${c.p}$ and $x = ${c.q}$.`,
        ],
        data: { c3: c.c3, c2: c.c2, c1: c.c1, d: c.d },
      }
    },
  },
  {
    id: 'classify',
    title: 'Maximum, minimum or neither',
    skills: ['extrema'],
    difficulty: 2,
    generate: (rng) => {
      const flat = rng.int(0, 3) === 0
      const options = ['Local maximum', 'Local minimum', 'Neither']
      if (flat) {
        // f'(x) = 3s(x - p)^2 keeps its sign through p.
        const p = rng.int(-3, 3)
        const s = rng.pick([1, -1])
        const d = rng.int(-5, 5)
        const coeffs = [s, -3 * s * p, 3 * s * p * p, d]
        return {
          prompt: `$f(x) = ${poly(coeffs)}$ has a critical point at $x = ${p}$. Is $f(${p})$ a local maximum, a local minimum, or neither?`,
          answer: { kind: 'choice', options, correct: 2 },
          hints: [
            "Factor $f'(x)$ and find its sign on each side of the critical point.",
            `$f'(x) = ${s < 0 ? '-' : ''}3(${poly([1, -p])})^2$.`,
          ],
          solution: [
            `$f'(x) = ${s < 0 ? '-' : ''}3(${poly([1, -p])})^2$ is ${s > 0 ? 'positive' : 'negative'} on both sides of $${p}$.`,
            'The sign does not change, so by the first derivative test there is no extremum: the tangent is flat, but the graph keeps going the same way.',
          ],
          data: { c3: coeffs[0]!, c2: coeffs[1]!, c1: coeffs[2]!, d, at: p },
        }
      }
      const c = cubicWithCritical(rng)
      const at = rng.pick([c.p, c.q])
      // Left of p and right of q, f' has the sign of s; between them, the opposite.
      const leftSign = at === c.p ? c.s : -c.s
      const correct = leftSign > 0 ? 0 : 1
      return {
        prompt: `$f(x) = ${c.tex}$ has a critical point at $x = ${at}$. Is $f(${at})$ a local maximum, a local minimum, or neither?`,
        answer: { kind: 'choice', options, correct },
        hints: [
          "Use the first derivative test: the sign of $f'$ just left and just right of the point.",
          `$f'(x) = ${c.dtex}$.`,
        ],
        solution: [
          `$f'(x) = ${c.dtex}$, zero at $${c.p}$ and $${c.q}$.`,
          `$f'$ is ${leftSign > 0 ? 'positive' : 'negative'} just left of $${at}$ and ${leftSign > 0 ? 'negative' : 'positive'} just right of it, so $f(${at})$ is a local ${correct === 0 ? 'maximum' : 'minimum'}.`,
        ],
        data: { c3: c.c3, c2: c.c2, c1: c.c1, d: c.d, at },
      }
    },
  },
  {
    id: 'decreasing-interval',
    title: 'Where it decreases',
    skills: ['extrema'],
    difficulty: 2,
    generate: (rng) => {
      const c = cubicWithCritical(rng)
      const between = `$(${c.p}, ${c.q})$`
      const outside = `$(-\\infty, ${c.p})$ and $(${c.q}, \\infty)$`
      const options = [between, outside, `$(-\\infty, ${c.q})$`, `$(${c.p}, \\infty)$`]
      // f' = 3s(x - p)(x - q) is negative between the roots when s > 0.
      const correct = c.s > 0 ? 0 : 1
      return {
        prompt: `On which intervals is $f(x) = ${c.tex}$ decreasing?`,
        answer: { kind: 'choice', options, correct },
        hints: [
          "$f$ decreases where $f' < 0$. Find the zeros of $f'$ and test one point in each interval.",
          `$f'(x) = ${c.dtex}$.`,
        ],
        solution: [
          `$f'(x) = ${c.dtex}$, zero at $${c.p}$ and $${c.q}$.`,
          `The leading coefficient of $f'$ is ${c.s > 0 ? 'positive, so it is negative between its zeros' : 'negative, so it is negative outside its zeros'}: $f$ decreases on ${options[correct]}.`,
        ],
        data: { c3: c.c3, c2: c.c2, c1: c.c1, d: c.d, correct },
      }
    },
  },
  {
    id: 'absolute-extrema',
    title: 'Absolute extrema on a closed interval',
    skills: ['extrema'],
    difficulty: 2,
    generate: (rng) => {
      const c = cubicWithCritical(rng)
      const lo = rng.int(c.p - 2, c.p)
      const hi = rng.int(Math.max(c.q, lo + 1), c.q + 2)
      const wantMax = rng.bool()
      const candidates = [lo, ...[c.p, c.q].filter((x) => x > lo && x < hi), hi]
      const values = candidates.map((x) => c.f(x))
      const value = wantMax ? Math.max(...values) : Math.min(...values)
      return {
        prompt: `Find the absolute ${wantMax ? 'maximum' : 'minimum'} value of $f(x) = ${c.tex}$ on $[${lo}, ${hi}]$.`,
        answer: { kind: 'number', value },
        hints: [
          'The closed interval method: compare $f$ at the critical points inside the interval and at both ends.',
          `$f'(x) = ${c.dtex}$.`,
        ],
        solution: [
          `Critical points: $${c.p}$ and $${c.q}$. Candidates in $[${lo}, ${hi}]$: $${candidates.join(', ')}$.`,
          `${candidates.map((x, i) => `$f(${x}) = ${values[i]}$`).join(', ')}.`,
          `The ${wantMax ? 'largest' : 'smallest'} is $${value}$.`,
        ],
        data: { c3: c.c3, c2: c.c2, c1: c.c1, d: c.d, lo, hi, max: wantMax ? 1 : 0 },
      }
    },
  },
  {
    id: 'mvt-c',
    title: 'The point the mean value theorem promises',
    skills: ['mean-value-theorem'],
    difficulty: 2,
    generate: (rng): Problem => {
      if (rng.bool()) {
        const k = rng.int(-4, 4)
        const b = rng.int(1, 4)
        const ft = poly([1, 0, k, 0])
        const slope = b * b + k
        return {
          prompt: `Find the $c$ in $(0, ${b})$ that the mean value theorem gives for $f(x) = ${ft}$ on $[0, ${b}]$. Give it exactly or to three decimal places.`,
          answer: { kind: 'number', value: b / Math.sqrt(3), tolerance: 0.0006 },
          hints: [
            "Solve $f'(c) = \\frac{f(b) - f(a)}{b - a}$.",
            `The chord has slope $\\frac{f(${b}) - f(0)}{${b}} = ${slope}$.`,
          ],
          solution: [
            `$\\frac{f(${b}) - f(0)}{${b} - 0} = \\frac{${b ** 3 + k * b}}{${b}} = ${slope}$.`,
            `$f'(c) = ${sum([
              [3, 'c^2'],
              [k, ''],
            ])} = ${slope}$ gives $c^2 = ${frac(b * b, 3)}$, and $c = \\frac{${b}}{\\sqrt{3}} \\approx ${dec(b / Math.sqrt(3))}$ lies in $(0, ${b})$.`,
          ],
          data: { kind: 0, k, b },
        }
      }
      const m = rng.int(1, 3)
      const n = rng.int(m + 1, m + 3)
      const value = ((m + n) / 2) ** 2
      return {
        prompt: `Find the $c$ in $(${m * m}, ${n * n})$ that the mean value theorem gives for $f(x) = \\sqrt{x}$ on $[${m * m}, ${n * n}]$.`,
        answer: { kind: 'number', value },
        hints: [
          "Solve $f'(c) = \\frac{f(b) - f(a)}{b - a}$, with $f'(x) = \\frac{1}{2\\sqrt{x}}$.",
          `The chord has slope $\\frac{${n} - ${m}}{${n * n} - ${m * m}} = ${frac(1, m + n)}$.`,
        ],
        solution: [
          `The chord has slope $\\frac{${n} - ${m}}{${n * n - m * m}} = ${frac(1, m + n)}$.`,
          `$\\frac{1}{2\\sqrt{c}} = ${frac(1, m + n)}$ gives $\\sqrt{c} = ${frac(m + n, 2)}$, so $c = ${frac((m + n) ** 2, 4)}$.`,
        ],
        data: { kind: 1, m, n },
      }
    },
  },
  {
    id: 'inflection',
    title: 'Inflection point',
    skills: ['concavity'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.pick([1, -1, 2, -2])
      const x0 = rng.int(-3, 3)
      const b = -3 * a * x0
      const c = rng.int(-6, 6)
      const d = rng.int(-5, 5)
      return {
        prompt: `Find the $x$-coordinate of the inflection point of $f(x) = ${poly([a, b, c, d])}$.`,
        answer: { kind: 'number', value: x0 },
        hints: ["Find where $f''$ changes sign.", `$f''(x) = ${poly([6 * a, 2 * b])}$.`],
        solution: [
          `$f'(x) = ${poly([3 * a, 2 * b, c])}$ and $f''(x) = ${poly([6 * a, 2 * b])}$.`,
          `$f''(x) = 0$ at $x = ${x0}$, and a linear $f''$ changes sign there, so the concavity changes: an inflection point.`,
        ],
        data: { a, b, c, d },
      }
    },
  },
  {
    id: 'concavity-at',
    title: 'Concave up or down',
    skills: ['concavity'],
    difficulty: 2,
    generate: (rng) => {
      let a: number
      let b: number
      let c: number
      let t: number
      let f2: number
      do {
        a = rng.nonZeroInt(-2, 2)
        b = rng.int(-3, 3)
        c = rng.int(-6, 6)
        t = rng.int(-2, 2)
        f2 = 12 * a * t * t + 6 * b * t + 2 * c
      } while (Math.abs(f2) < 1)
      return {
        prompt: `Is $f(x) = ${poly([a, b, c, 0, 0])}$ concave up or concave down at $x = ${t}$?`,
        answer: {
          kind: 'choice',
          options: ['Concave up', 'Concave down'],
          correct: f2 > 0 ? 0 : 1,
        },
        hints: ["Compute $f''(x)$ and its sign at the point."],
        solution: [
          `$f''(x) = ${poly([12 * a, 6 * b, 2 * c])}$, so $f''(${t}) = ${f2}$.`,
          `${f2 > 0 ? 'Positive: concave up' : 'Negative: concave down'}.`,
        ],
        data: { a, b, c, t },
      }
    },
  },
  {
    id: 'second-test',
    title: 'The second derivative test',
    skills: ['concavity', 'extrema'],
    difficulty: 2,
    generate: (rng): Problem => {
      const options = ['A local minimum', 'A local maximum', 'The test gives no conclusion']
      if (rng.int(0, 3) === 0) {
        const p = rng.int(-3, 3)
        const s = rng.pick([1, -1])
        const d = rng.int(-4, 4)
        const ft = `${s < 0 ? '-' : ''}(${poly([1, -p])})^4 ${d < 0 ? '-' : '+'} ${Math.abs(d)}`
        return {
          prompt: `$f(x) = ${ft}$ has $f'(${p}) = 0$. What does the second derivative test say about $f(${p})$?`,
          answer: { kind: 'choice', options, correct: 2 },
          hints: ["Compute $f''(" + p + ')$. The test needs it to be nonzero.'],
          solution: [
            `$f''(x) = ${s < 0 ? '-' : ''}12(${poly([1, -p])})^2$, so $f''(${p}) = 0$.`,
            `The test says nothing. (The first derivative test shows a local ${s > 0 ? 'minimum' : 'maximum'}, but that is a different test.)`,
          ],
          data: { kind: 1, p, s, d },
        }
      }
      const c = cubicWithCritical(rng)
      const at = rng.pick([c.p, c.q])
      const f2 = 6 * c.c3 * at + 2 * c.c2
      return {
        prompt: `$f(x) = ${c.tex}$ has $f'(${at}) = 0$. What does the second derivative test say about $f(${at})$?`,
        answer: { kind: 'choice', options, correct: f2 > 0 ? 0 : 1 },
        hints: ["Compute $f''(x)$ and its sign at the critical point."],
        solution: [
          `$f''(x) = ${poly([6 * c.c3, 2 * c.c2])}$, so $f''(${at}) = ${f2}$.`,
          `${f2 > 0 ? 'Positive: the graph bends up through a flat tangent, a local minimum' : 'Negative: the graph bends down through a flat tangent, a local maximum'}.`,
        ],
        data: { kind: 0, c3: c.c3, c2: c.c2, c1: c.c1, d: c.d, at },
      }
    },
  },
  {
    id: 'drug-peak',
    title: "A drug's peak",
    skills: ['extrema'],
    difficulty: 2,
    generate: (rng) => {
      const A = rng.int(4, 20)
      const k = rng.pick([0.1, 0.2, 0.25, 0.4, 0.5])
      const askTime = rng.bool()
      const peak = 1 / k
      const value = askTime ? peak : A / (k * Math.E)
      return {
        prompt: `After a dose, the concentration of a drug in the blood is $C(t) = ${A}t\\,e^{-${k}t}$ mg/L, $t$ in hours. ${askTime ? 'After how many hours is the concentration highest?' : 'What is the highest concentration, in mg/L? Round to two decimal places.'}`,
        answer: askTime ? { kind: 'number', value } : { kind: 'number', value, tolerance: 0.006 },
        hints: [
          "Use the product rule for $C'(t)$, then set it to $0$.",
          `$C'(t) = ${A}e^{-${k}t}(1 - ${k}t)$.`,
        ],
        solution: [
          `$C'(t) = ${A}e^{-${k}t} - ${dec(A * k)}t\\,e^{-${k}t} = ${A}e^{-${k}t}(1 - ${k}t)$.`,
          `$C'(t) = 0$ at $t = \\frac{1}{${k}} = ${dec(peak)}$ h; $C'$ is positive before and negative after, so it is the peak.`,
          ...(askTime
            ? []
            : [
                `$C(${dec(peak)}) = ${A} \\cdot ${dec(peak)} \\cdot e^{-1} = \\frac{${dec(A * peak)}}{e} \\approx ${value.toFixed(2)}$ mg/L.`,
              ]),
        ],
        data: { A, k, askTime: askTime ? 1 : 0 },
      }
    },
  },
])
