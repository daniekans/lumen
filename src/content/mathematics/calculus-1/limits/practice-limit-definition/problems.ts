import { defineProblems, tex, type Rng } from '@/lib/practice'

const { num, poly } = tex

/** The limit as TeX: \lim_{x \to 2}. */
const lim = (a: string | number) => `\\lim_{x \\to ${a}}`

/** A decimal without float noise: 0.30000000000000004 prints as 0.3. */
const dec = (v: number) => +v.toFixed(6)

/** |x - a| as TeX, written |x + 2| for a = -2 and |x| for a = 0. */
const dist = (a: number) => `|${poly([1, -a])}|`

const nonzero = (rng: Rng, lo: number, hi: number) => {
  let v = 0
  while (v === 0) v = rng.int(lo, hi)
  return v
}

/** Classes of functions by growth at infinity, slowest first. */
export const GROWTH = ['log', 'power', 'exp'] as const
export type Growth = (typeof GROWTH)[number]

/** A member of a growth class: its TeX and its parameter. */
const growthTerm = (rng: Rng, cls: Growth): { tex: string; param: number } => {
  if (cls === 'log') {
    const k = rng.pick([1, 2, 3])
    return { tex: k === 1 ? '\\ln x' : `(\\ln x)^{${k}}`, param: k }
  }
  if (cls === 'power') {
    const p = rng.pick([0.5, 1, 2, 3, 10])
    return { tex: p === 0.5 ? '\\sqrt{x}' : p === 1 ? 'x' : `x^{${p}}`, param: p }
  }
  const b = rng.pick([1.1, 2, Math.E, 3])
  return { tex: b === Math.E ? 'e^{x}' : `${b}^{x}`, param: b }
}

export const GROWTH_OPTIONS = ['$0$', '$\\infty$', '$1$', 'It does not exist'] as const

export const problems = defineProblems([
  {
    id: 'delta-linear',
    title: 'Delta for a line',
    skills: ['limit-definition'],
    difficulty: 1,
    generate: (rng) => {
      const m = nonzero(rng, -5, 5)
      const b = rng.int(-6, 6)
      const a = rng.int(-3, 4)
      const L = m * a + b
      const delta = rng.pick([0.01, 0.02, 0.05, 0.1, 0.2])
      const eps = dec(Math.abs(m) * delta)
      return {
        prompt: `$${lim(a)} (${poly([m, b])}) = ${L}$. For $\\varepsilon = ${eps}$, what is the largest $\\delta$ such that $0 < ${dist(a)} < \\delta$ gives $\\lvert ${poly([m, b - L])} \\rvert < \\varepsilon$?`,
        answer: { kind: 'number', value: delta },
        hints: [`Factor $${Math.abs(m)}$ out of $\\lvert ${poly([m, b - L])} \\rvert$.`],
        solution: [
          `$\\lvert ${poly([m, b - L])} \\rvert = ${Math.abs(m)}\\,${dist(a)}$.`,
          `That is less than $${eps}$ exactly when $${dist(a)} < \\frac{${eps}}{${Math.abs(m)}} = ${delta}$, so $\\delta = ${delta}$.`,
        ],
        data: { m, b, a, eps },
      }
    },
  },
  {
    id: 'delta-quadratic',
    title: 'Delta for a parabola',
    skills: ['limit-definition'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4])
      const A = Math.abs(a)
      // Keeps a^2 - eps positive, so the far side has an edge too.
      const d = rng.pick(A === 1 ? [0.1, 0.2] : [0.1, 0.2, 0.5])
      const eps = dec((A + d) ** 2 - A * A)
      const side = a > 0 ? 'right' : 'left'
      const edge = a > 0 ? dec(a + d) : dec(a - d)
      return {
        prompt: `$${lim(a)} x^2 = ${a * a}$. For $\\varepsilon = ${eps}$, find the largest $\\delta$ such that every $x$ with $0 < ${dist(a)} < \\delta$ has $|x^2 - ${a * a}| < \\varepsilon$.`,
        answer: { kind: 'number', value: d },
        hints: [
          `Find where $x^2$ reaches $${a * a} + ${eps}$ and $${a * a} - ${eps}$ near $${a}$.`,
          'The parabola is steeper on the side away from $0$, so that side is nearer.',
        ],
        solution: [
          `$x^2 = ${dec(a * a + eps)}$ at $x = ${edge}$, a distance $${d}$ from $${a}$ on the ${side}.`,
          `$x^2 = ${dec(a * a - eps)}$ at $x = ${a > 0 ? '' : '-'}\\sqrt{${dec(a * a - eps)}} \\approx ${(Math.sign(a) * Math.sqrt(a * a - eps)).toFixed(3)}$, farther away on the other side.`,
          `The window must fit the nearer side: $\\delta = ${d}$.`,
        ],
        data: { a, eps },
      }
    },
  },
  {
    id: 'delta-min-rule',
    title: 'The minimum rule',
    skills: ['limit-definition'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5])
      const C = 2 * Math.abs(a) + 1
      const large = rng.int(0, 3) === 0
      const eps = large ? C * rng.pick([2, 3]) : dec(C * rng.pick([0.01, 0.02, 0.05, 0.1]))
      const delta = Math.min(1, dec(eps / C))
      return {
        prompt: `A proof that $${lim(a)} x^2 = ${a * a}$ restricts $\\delta \\le 1$, so that $|${poly([1, a])}| < 2|a| + 1 = C$ (here $a = ${a}$), and takes $\\delta = \\min\\left(1, \\frac{\\varepsilon}{C}\\right)$. What $\\delta$ does $\\varepsilon = ${eps}$ get?`,
        answer: { kind: 'number', value: delta },
        hints: [
          `$C = 2 \\cdot ${Math.abs(a)} + 1 = ${C}$.`,
          'Compare $\\frac{\\varepsilon}{C}$ with $1$.',
        ],
        solution: [
          `$|x^2 - ${a * a}| = ${dist(a)}\\,|${poly([1, a])}|$, and with $${dist(a)} < 1$, $|${poly([1, a])}| < ${C}$.`,
          `$\\frac{\\varepsilon}{C} = \\frac{${eps}}{${C}} = ${dec(eps / C)}$, so $\\delta = \\min(1, ${dec(eps / C)}) = ${delta}$.`,
        ],
        data: { a, eps },
      }
    },
  },
  {
    id: 'epsilon-n',
    title: 'N for a limit at infinity',
    skills: ['limit-definition', 'limits-at-infinity'],
    difficulty: 1,
    generate: (rng) => {
      const c = rng.int(-4, 4)
      const b = rng.int(1, 9)
      const eps = rng.pick([0.5, 0.2, 0.1, 0.05, 0.01])
      const N = dec(b / eps)
      const f = `\\frac{${poly([c, b])}}{x}`
      return {
        prompt: `$${lim('\\infty')} ${f} = ${c}$. For $\\varepsilon = ${eps}$, find the smallest $N$ such that every $x > N$ has $\\left|${f} - ${c < 0 ? `(${c})` : c}\\right| < \\varepsilon$.`,
        answer: { kind: 'number', value: N },
        hints: [`Split the fraction: $${f} = ${c} + \\frac{${b}}{x}$.`],
        solution: [
          `$\\left|${f} - ${c < 0 ? `(${c})` : c}\\right| = \\frac{${b}}{x}$ for $x > 0$.`,
          `$\\frac{${b}}{x} < ${eps}$ exactly when $x > \\frac{${b}}{${eps}} = ${N}$, so $N = ${N}$.`,
        ],
        data: { c, b, eps },
      }
    },
  },
  {
    id: 'growth-ratio',
    title: 'Compare growth rates',
    skills: ['growth-rates'],
    difficulty: 1,
    generate: (rng) => {
      const [i, j] = rng.pick([
        [0, 1],
        [0, 2],
        [1, 2],
      ] as const)
      const swap = rng.bool()
      const [top, bottom] = swap ? [GROWTH[j], GROWTH[i]] : [GROWTH[i], GROWTH[j]]
      const t = growthTerm(rng, top)
      const u = growthTerm(rng, bottom)
      const slower = !swap
      return {
        prompt: `Find $${lim('\\infty')} \\frac{${t.tex}}{${u.tex}}$.`,
        answer: { kind: 'choice', options: [...GROWTH_OPTIONS], correct: slower ? 0 : 1 },
        hints: ['At infinity, $\\ln x \\ll x^p \\ll b^x$ for any $p > 0$ and $b > 1$.'],
        solution: [
          `$${t.tex}$ is ${top === 'log' ? 'logarithmic' : top === 'power' ? 'a power' : 'exponential'} and $${u.tex}$ is ${bottom === 'log' ? 'logarithmic' : bottom === 'power' ? 'a power' : 'exponential'}.`,
          slower
            ? 'The bottom grows faster, so the ratio tends to $0$, however the constants compare for small $x$.'
            : 'The top grows faster, so the ratio grows without bound: the limit is $\\infty$.',
        ],
        data: { top: GROWTH.indexOf(top), bottom: GROWTH.indexOf(bottom), t: t.param, u: u.param },
      }
    },
  },
  {
    id: 'big-o-constant',
    title: 'A big-O constant',
    skills: ['growth-rates'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.int(1, 5)
      const q = rng.int(0, 9)
      const r = q === 0 ? rng.int(1, 9) : rng.int(0, 9)
      const x0 = rng.pick([1, 2, 4, 5, 10])
      const C = dec(p + q / x0 + r / (x0 * x0))
      const f = poly([p, q, r])
      const ratio = `${p}${q ? ` + \\frac{${q}}{x}` : ''}${r ? ` + \\frac{${r}}{x^2}` : ''}`
      return {
        prompt: `$${f} = O(x^2)$. Find the smallest $C$ such that $${f} \\le C x^2$ for every $x \\ge ${x0}$.`,
        answer: { kind: 'number', value: C },
        hints: [
          `Divide by $x^2$: $C$ must be at least $${ratio}$ for every $x \\ge ${x0}$.`,
          'That ratio decreases as $x$ grows, so its largest value is at the left end.',
        ],
        solution: [
          `$\\frac{${f}}{x^2} = ${ratio}$, which decreases for $x > 0$.`,
          `Its largest value on $x \\ge ${x0}$ is at $x = ${x0}$: $C = ${p}${q ? ` + \\frac{${q}}{${x0}}` : ''}${r ? ` + \\frac{${r}}{${x0 * x0}}` : ''} = ${C}$.`,
        ],
        data: { p, q, r, x0 },
      }
    },
  },
  {
    id: 'proof-linear',
    title: 'Prove a linear limit',
    skills: ['limit-definition'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5])
      const b = rng.int(-6, 6)
      const a = rng.int(-3, 4)
      const L = m * a + b
      const xa = poly([1, -a])
      const M = Math.abs(m)
      return {
        prompt: `Prove from the definition that $${lim(a)} (${poly([m, b])}) = ${L}$.`,
        answer: { kind: 'self' },
        hints: [
          `Scratch work: simplify $\\lvert ${poly([m, b])} - ${L < 0 ? `(${L})` : L} \\rvert$ to a multiple of $|${xa}|$.`,
        ],
        solution: [
          `Scratch work: $\\lvert ${poly([m, b])} - ${L < 0 ? `(${L})` : L} \\rvert = \\lvert ${poly([m, -m * a])} \\rvert = ${M}\\,|${xa}|$, which is less than $\\varepsilon$ when $|${xa}| < \\frac{\\varepsilon}{${M}}$.`,
          `Proof: let $\\varepsilon > 0$ and take $\\delta = \\frac{\\varepsilon}{${M}}$.`,
          `If $0 < |${xa}| < \\delta$, then $\\lvert ${poly([m, b])} - ${L < 0 ? `(${L})` : L} \\rvert = ${M}\\,|${xa}| < ${M}\\delta = \\varepsilon$.`,
          `So for every $\\varepsilon > 0$ there is a $\\delta > 0$ that works, and the limit is $${L}$.`,
        ],
        data: { m, b, a },
      }
    },
  },
  {
    id: 'proof-quadratic',
    title: 'Prove a quadratic limit',
    skills: ['limit-definition'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.pick([-3, -2, 2, 3])
      const C = 2 * Math.abs(a) + 1
      const xa = poly([1, -a])
      const xpa = poly([1, a])
      return {
        prompt: `Prove from the definition that $${lim(a)} x^2 = ${a * a}$.`,
        answer: { kind: 'self' },
        hints: [
          `Factor: $|x^2 - ${a * a}| = |${xa}|\\,|${xpa}|$.`,
          `Restrict $\\delta \\le 1$ and bound $|${xpa}|$ on $|${xa}| < 1$.`,
        ],
        solution: [
          `Scratch work: $|x^2 - ${a * a}| = |${xa}|\\,|${xpa}|$. If $|${xa}| < 1$, then $x$ is between $${a - 1}$ and $${a + 1}$, so $|${xpa}| < ${C}$.`,
          `Proof: let $\\varepsilon > 0$ and take $\\delta = \\min\\left(1, \\frac{\\varepsilon}{${C}}\\right)$.`,
          `If $0 < |${xa}| < \\delta$, then $|${xa}| < 1$, so $|${xpa}| < ${C}$, and $|x^2 - ${a * a}| = |${xa}|\\,|${xpa}| < \\frac{\\varepsilon}{${C}} \\cdot ${C} = \\varepsilon$.`,
          `So the limit is $${a * a}$.`,
        ],
        data: { a },
      }
    },
  },
  {
    id: 'delta-reciprocal-root',
    title: 'Delta for 1/x and the square root',
    skills: ['limit-definition'],
    difficulty: 3,
    generate: (rng) => {
      if (rng.bool()) {
        const a = rng.pick([1, 2, 4])
        const eps = rng.pick(a === 4 ? [0.05, 0.1, 0.2] : [0.1, 0.2, 0.25])
        const value = (a * a * eps) / (1 + a * eps)
        const near = a / (1 + a * eps)
        return {
          prompt: `$${lim(a)} \\frac{1}{x} = ${num(1 / a)}$. For $\\varepsilon = ${eps}$, find the largest $\\delta$ such that every $x$ with $0 < ${dist(a)} < \\delta$ has $\\left|\\frac{1}{x} - ${num(1 / a)}\\right| < \\varepsilon$. Exact forms such as $\\frac{1}{3}$ are accepted.`,
          answer: { kind: 'number', value },
          hints: [
            `Solve $\\frac{1}{x} = ${num(1 / a)} + ${eps}$ and $\\frac{1}{x} = ${num(1 / a)} - ${eps}$ for $x$.`,
            '$\\frac{1}{x}$ is steeper on the side nearer $0$, so that side is nearer.',
          ],
          solution: [
            `$\\frac{1}{x} = ${num(1 / a)} + ${eps}$ at $x = \\frac{${a}}{1 + ${a} \\cdot ${eps}} = ${num(near)}$, a distance $${a} - ${num(near)} = ${num(value)}$ to the left of $${a}$.`,
            `$\\frac{1}{x} = ${num(1 / a)} - ${eps}$ at $x = \\frac{${a}}{1 - ${a} \\cdot ${eps}}$, farther away on the right ($\\frac{${a * a} \\cdot ${eps}}{1 - ${dec(a * eps)}}$ instead of $\\frac{${a * a} \\cdot ${eps}}{1 + ${dec(a * eps)}}$).`,
            `The window must fit the nearer side: $\\delta = ${num(value)}$.`,
          ],
          data: { a, eps, variant: 0 },
        }
      }
      const r = rng.int(1, 4)
      const eps = rng.pick(r === 1 ? [0.1, 0.2, 0.5] : [0.1, 0.2, 0.5, 1])
      const value = dec(2 * r * eps - eps * eps)
      return {
        prompt: `$${lim(r * r)} \\sqrt{x} = ${r}$. For $\\varepsilon = ${eps}$, find the largest $\\delta$ such that every $x$ with $0 < ${dist(r * r)} < \\delta$ has $|\\sqrt{x} - ${r}| < \\varepsilon$.`,
        answer: { kind: 'number', value },
        hints: [
          `$\\sqrt{x}$ is between $${dec(r - eps)}$ and $${dec(r + eps)}$ when $x$ is between their squares.`,
          'The square root is steeper on the left, so that side is nearer.',
        ],
        solution: [
          `$\\sqrt{x} = ${dec(r - eps)}$ at $x = ${dec((r - eps) ** 2)}$, a distance $${value}$ to the left of $${r * r}$.`,
          `$\\sqrt{x} = ${dec(r + eps)}$ at $x = ${dec((r + eps) ** 2)}$, a distance $${dec(2 * r * eps + eps * eps)}$ to the right.`,
          `The window must fit the nearer side: $\\delta = ${value}$. In general $\\delta = 2\\sqrt{a}\\,\\varepsilon - \\varepsilon^2$.`,
        ],
        data: { a: r * r, eps, variant: 1 },
      }
    },
  },
  {
    id: 'machining-tolerance',
    title: 'Tolerance on a machined part',
    skills: ['limit-definition'],
    difficulty: 2,
    generate: (rng) => {
      const s = rng.int(2, 5)
      const d = rng.pick([0.01, 0.02, 0.05, 0.1])
      const cube = rng.bool()
      const n = cube ? 3 : 2
      const eps = dec((s + d) ** n - s ** n)
      const shape = cube ? 'cubes' : 'square plates'
      const measure = cube ? 'volume' : 'area'
      const unit = cube ? '\\text{cm}^3' : '\\text{cm}^2'
      return {
        prompt: `A machine cuts ${shape} with side $${s}$ cm, so the ${measure} should be $${s ** n}\\ ${unit}$. The customer accepts a ${measure} error below $${eps}\\ ${unit}$. What is the largest $\\delta$ (in cm) such that every side $x$ with $|x - ${s}| < \\delta$ keeps the ${measure} $x^${n}$ within $${eps}$ of $${s ** n}$?`,
        answer: { kind: 'number', value: d },
        hints: [
          `Find the sides where $x^${n}$ reaches $${s ** n} + ${eps}$ and $${s ** n} - ${eps}$.`,
          `$x^${n}$ grows faster above $${s}$ than below it, so the side above is nearer.`,
        ],
        solution: [
          `$x^${n} = ${dec(s ** n + eps)}$ at $x = ${dec(s + d)}$, since $${dec(s + d)}^${n} = ${dec((s + d) ** n)}$: a distance $${d}$ above $${s}$.`,
          `$x^${n} = ${dec(s ** n - eps)}$ at $x = \\sqrt[${n}]{${dec(s ** n - eps)}} \\approx ${((s ** n - eps) ** (1 / n)).toFixed(4)}$, farther below.`,
          `So the machinist must hold the side within $\\delta = ${d}$ cm. This is the $\\varepsilon$-$\\delta$ game: the customer names $\\varepsilon$, the machinist answers with $\\delta$.`,
        ],
        data: { s, n, eps },
      }
    },
  },
  {
    id: 'proof-no-limit',
    title: 'Prove there is no limit',
    skills: ['limit-definition'],
    difficulty: 3,
    generate: (rng) => {
      const a = rng.int(-3, 3)
      const p = rng.int(-4, 4)
      const q = p + rng.pick([-4, -3, -2, 2, 3, 4])
      const J = Math.abs(q - p)
      const def = `f(x) = \\begin{cases} ${p} & x < ${a} \\\\ ${q} & x \\geq ${a} \\end{cases}`
      return {
        prompt: `Prove from the definition that $${def}$ has no limit at $${a}$.`,
        answer: { kind: 'self' },
        hints: [
          'Negate the definition: one $\\varepsilon$ that no $\\delta$ wins against, for every $L$.',
          `Take $\\varepsilon = ${J / 2}$, half the jump, and use the triangle inequality.`,
        ],
        solution: [
          `Suppose the limit were some $L$. Take $\\varepsilon = ${J / 2}$ and any $\\delta > 0$.`,
          `The inputs $x_1 = ${a} - \\frac{\\delta}{2}$ and $x_2 = ${a} + \\frac{\\delta}{2}$ are in the window, with $f(x_1) = ${p}$ and $f(x_2) = ${q}$.`,
          `$${J} = |f(x_2) - f(x_1)| \\le |f(x_2) - L| + |L - f(x_1)|$, so one of the two distances is at least $${J / 2} = \\varepsilon$.`,
          `So no $\\delta$ works for this $\\varepsilon$, whatever $L$ is, and the limit does not exist.`,
        ],
        data: { a, p, q },
      }
    },
  },
])
