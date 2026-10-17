import { polyDivide, polyFromRoots } from '@/lib/math'
import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, paren, poly, signed, sum } = tex

/** An integer in [lo, hi] other than the values in `not`. */
const intExcept = (rng: Rng, lo: number, hi: number, not: readonly number[]) => {
  let v = not[0] ?? lo
  while (not.includes(v)) v = rng.int(lo, hi)
  return v
}

/** (x - r) as TeX, or x for r = 0, with an optional power. */
const factor = (r: number, m = 1) => {
  const base = r === 0 ? 'x' : `(x${signed(-r)})`
  return m === 1 ? base : `${base}^{${m}}`
}

/** A coefficient in front of a factored product: '', '-', '3'. */
const lead = (a: number) => (a === 1 ? '' : a === -1 ? '-' : String(a))

/** a(x - h)^2 + k as TeX. */
export const vertexTex = (a: number, h: number, k: number) =>
  `${lead(a)}${h === 0 ? 'x^2' : `(x${signed(-h)})^2`}${signed(k)}`

export type Ends = 'up-up' | 'down-down' | 'down-up' | 'up-down'
export const ENDS: Record<Ends, string> = {
  'up-up': 'Up on the left and up on the right',
  'down-down': 'Down on the left and down on the right',
  'down-up': 'Down on the left and up on the right',
  'up-down': 'Up on the left and down on the right',
}

/** The ends of a polynomial from its degree and leading coefficient. */
const endsOf = (n: number, a: number): Ends => {
  const right = a > 0 ? 'up' : 'down'
  const left = n % 2 === 0 ? right : right === 'up' ? 'down' : 'up'
  return `${left}-${right}` as Ends
}

const rational = (num: readonly number[], den: readonly number[]) =>
  `\\dfrac{${poly(num)}}{${poly(den)}}`

export const problems = defineProblems([
  {
    id: 'slope',
    title: 'Slope through two points',
    skills: ['lines'],
    difficulty: 1,
    generate: (rng) => {
      const x1 = rng.int(-6, 6)
      const x2 = intExcept(rng, -6, 6, [x1])
      const y1 = rng.int(-6, 6)
      const y2 = rng.int(-6, 6)
      const m = frac(y2 - y1, x2 - x1)
      return {
        prompt: `Find the slope of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
        answer: { kind: 'number', value: (y2 - y1) / (x2 - x1) },
        hints: ['The slope is $\\frac{y_2 - y_1}{x_2 - x_1}$: the rise over the run.'],
        solution: [
          `$\\Delta y = ${y2} - ${paren(y1)} = ${y2 - y1}$ and $\\Delta x = ${x2} - ${paren(x1)} = ${x2 - x1}$.`,
          `$m = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$.`,
        ],
        data: { x1, y1, x2, y2 },
      }
    },
  },
  {
    id: 'line-through-points',
    title: 'Equation of a line',
    skills: ['lines'],
    difficulty: 2,
    generate: (rng) => {
      // Integer slope and intercept, so the equation reads cleanly.
      const m = rng.nonZeroInt(-4, 4)
      const b = rng.int(-6, 6)
      const x1 = rng.int(-4, 4)
      const x2 = intExcept(rng, -4, 4, [x1])
      const [y1, y2] = [m * x1 + b, m * x2 + b]
      const line = sum([
        [m, 'x'],
        [b, ''],
      ])
      return {
        prompt: `Find the equation of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$. Enter it as $y = mx + b$ or just the right side.`,
        answer: { kind: 'expression', tex: line },
        hints: [
          'Find the slope first.',
          'Then use one point: $y - y_1 = m(x - x_1)$, and solve for $y$.',
        ],
        solution: [
          `$m = \\frac{${y2} - ${paren(y1)}}{${x2} - ${paren(x1)}} = ${m}$.`,
          `$b = y_1 - m x_1 = ${y1} - ${paren(m)} \\cdot ${paren(x1)} = ${b}$.`,
          `$y = ${line}$.`,
        ],
        data: { m, b, x1, y1, x2, y2 },
      }
    },
  },
  {
    id: 'vertex-form',
    title: 'Complete the square',
    skills: ['quadratics'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([1, 1, -1, 2, -2, 3])
      const h = rng.nonZeroInt(-5, 5)
      const k = rng.nonZeroInt(-8, 8)
      const [b, c] = [-2 * a * h, a * h * h + k]
      const answer = `$${vertexTex(a, h, k)}$`
      const candidates = [
        vertexTex(a, -h, k),
        vertexTex(a, h, c),
        vertexTex(a, h, -k),
        vertexTex(a, -h, -k),
        vertexTex(a, h, c - h * h),
        vertexTex(a, -h, c),
      ].map((t) => `$${t}$`)
      const rest = [...new Set(candidates)].filter((o) => o !== answer)
      const options = rng.shuffle([answer, ...rng.shuffle(rest).slice(0, 3)])
      const steps =
        a === 1
          ? [
              `Half of $${b}$ is $${-h}$, and $(x${signed(-h)})^2 = x^2${signed(b)}x + ${h * h}$.`,
              `So $x^2${signed(b)}x${signed(c)} = (x${signed(-h)})^2 - ${h * h}${signed(c)} = ${vertexTex(1, h, k)}$.`,
            ]
          : [
              `Factor $${a}$ out of the first two terms: $${lead(a)}(x^2${signed(-2 * h)}x)${signed(c)}$.`,
              `Complete the square inside: $x^2${signed(-2 * h)}x = (x${signed(-h)})^2 - ${h * h}$.`,
              `So the expression is $${lead(a)}(x${signed(-h)})^2 - ${paren(a)} \\cdot ${h * h}${signed(c)} = ${vertexTex(a, h, k)}$.`,
            ]
      return {
        prompt: `Which is $${poly([a, b, c])}$ in vertex form?`,
        answer: { kind: 'choice', options, correct: options.indexOf(answer) },
        hints: [
          a === 1
            ? 'Take half of the coefficient of $x$; its square completes the square.'
            : 'Factor the leading coefficient out of the $x^2$ and $x$ terms first.',
          `The vertex is at $x = -\\frac{b}{2a} = ${h}$.`,
        ],
        solution: [...steps, `The vertex is $(${h}, ${k})$.`],
        data: { a, b, c, h, k },
      }
    },
  },
  {
    id: 'quadratic-extreme',
    title: 'Maximum or minimum value',
    skills: ['quadratics'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.pick([1, -1, 2, -2, 3, -3])
      const h = rng.int(-5, 5)
      const k = rng.int(-9, 9)
      const [b, c] = [-2 * a * h, a * h * h + k]
      const which = a > 0 ? 'minimum' : 'maximum'
      return {
        prompt: `What is the ${which} value of $f(x) = ${poly([a, b, c])}$?`,
        answer: { kind: 'number', value: k },
        hints: [
          'The extreme value is at the vertex, $x = -\\frac{b}{2a}$.',
          `Evaluate $f$ at $x = ${h}$.`,
        ],
        solution: [
          `The vertex is at $x = -\\frac{${b}}{2 \\cdot ${paren(a)}} = ${h}$.`,
          `$f(${h}) = ${k}$. Since $a ${a > 0 ? '>' : '<'} 0$, the parabola opens ${a > 0 ? 'up' : 'down'}, so $${k}$ is the ${which}.`,
        ],
        data: { a, b, c, h, k },
      }
    },
  },
  {
    id: 'end-behavior',
    title: 'End behavior',
    skills: ['end-behavior'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(2, 7)
      const a = rng.nonZeroInt(-5, 5)
      // Lower terms with random coefficients, listed in a shuffled order so the leading term is
      // not always first.
      const lower = Array.from({ length: 2 }, () => rng.int(0, n - 1))
      const terms = rng.shuffle([
        [a, `x^{${n}}`] as const,
        ...[...new Set(lower)].map((d) => {
          const c = rng.nonZeroInt(-9, 9)
          return [c, d === 0 ? '' : d === 1 ? 'x' : `x^{${d}}`] as const
        }),
      ])
      const correct = endsOf(n, a)
      const options = (Object.keys(ENDS) as Ends[]).map((e) => ENDS[e])
      return {
        prompt: `Which describes the end behavior of the graph of $p(x) = ${sum(terms)}$?`,
        answer: { kind: 'choice', options, correct: options.indexOf(ENDS[correct]) },
        hints: [
          'Only the leading term matters far from the origin.',
          `The leading term is $${lead(a)}x^{${n}}$. Is the degree even or odd?`,
        ],
        solution: [
          `The leading term is $${lead(a)}x^{${n}}$: degree $${n}$ (${n % 2 === 0 ? 'even' : 'odd'}) and leading coefficient $${a}$.`,
          n % 2 === 0
            ? `Even degree: both ends go the same way, ${a > 0 ? 'up' : 'down'} since $a ${a > 0 ? '>' : '<'} 0$.`
            : `Odd degree: the ends go opposite ways, and with $a ${a > 0 ? '>' : '<'} 0$ the right end goes ${a > 0 ? 'up' : 'down'}.`,
          `${ENDS[correct]}.`,
        ],
        data: { n, a },
      }
    },
  },
  {
    id: 'touching-zero',
    title: 'Crossing or touching',
    skills: ['zeros'],
    difficulty: 1,
    generate: (rng) => {
      const roots = rng.shuffle([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 3)
      const even = rng.int(0, 2)
      const mults = roots.map((_, i) => (i === even ? rng.pick([2, 4]) : rng.pick([1, 1, 3])))
      const a = rng.pick([1, -1, 2, -3])
      const order = rng.shuffle([0, 1, 2])
      const p = `${lead(a)}${order.map((i) => factor(roots[i]!, mults[i])).join('')}`
      const r = roots[even]!
      return {
        prompt: `At which zero does the graph of $p(x) = ${p}$ touch the $x$-axis without crossing it?`,
        answer: { kind: 'number', value: r },
        hints: ['Look at the exponent of each factor: the multiplicity of that zero.'],
        solution: [
          `The zeros are ${order.map((i) => `$${roots[i]}$ (multiplicity $${mults[i]}$)`).join(', ')}.`,
          `Only $x = ${r}$ has even multiplicity, so the sign does not change there: the graph touches at $${r}$.`,
        ],
        data: {
          r1: roots[0]!,
          r2: roots[1]!,
          r3: roots[2]!,
          m1: mults[0]!,
          m2: mults[1]!,
          m3: mults[2]!,
          a,
        },
      }
    },
  },
  {
    id: 'least-degree',
    title: 'Smallest degree from a graph',
    skills: ['zeros'],
    difficulty: 2,
    generate: (rng) => {
      const crosses = rng.int(1, 3)
      const touches = rng.int(1, 2)
      const xs = rng.shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4]).slice(0, crosses + touches)
      const crossAt = xs.slice(0, crosses).sort((u, v) => u - v)
      const touchAt = xs.slice(crosses).sort((u, v) => u - v)
      const list = (v: number[]) => {
        const items = v.map((x) => `$${x}$`)
        return items.length === 1
          ? items[0]!
          : `${items.slice(0, -1).join(', ')} and ${items.at(-1)!}`
      }
      const n = crosses + 2 * touches
      return {
        prompt: `The graph of a polynomial crosses the $x$-axis at ${list(crossAt)}, touches it at ${list(touchAt)}, and meets it nowhere else. What is the smallest possible degree?`,
        answer: { kind: 'number', value: n },
        hints: [
          'A crossing needs an odd multiplicity, a touch an even one. Use the smallest of each.',
        ],
        solution: [
          `Each crossing zero has multiplicity at least $1$, each touching zero at least $2$.`,
          `The smallest degree is $${crosses} \\cdot 1 + ${touches} \\cdot 2 = ${n}$, for example $${[
            ...crossAt.map((x) => factor(x)),
            ...touchAt.map((x) => factor(x, 2)),
          ].join('')}$.`,
        ],
        data: { crosses, touches },
      }
    },
  },
  {
    id: 'vertical-asymptotes',
    title: 'Vertical asymptotes',
    skills: ['asymptotes'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.int(-6, 6)
      const q = intExcept(rng, -6, 6, [p])
      // Half the time the numerator shares a factor with the denominator, leaving a hole.
      const shared = rng.bool()
      const s = shared ? p : intExcept(rng, -6, 6, [p, q])
      const top = [1, -s]
      const bottom = polyFromRoots([p, q])
      const asymptotes = shared ? [q] : [p, q].sort((u, v) => u - v)
      return {
        prompt: `List the vertical asymptotes of $f(x) = ${rational(top, bottom)}$ as values of $x$, separated by commas.`,
        answer: { kind: 'list', values: asymptotes },
        hints: [
          'Factor the denominator.',
          'A factor that cancels with the numerator leaves a hole, not an asymptote.',
        ],
        solution: [
          `$f(x) = \\frac{${factor(s)}}{${factor(Math.min(p, q))}${factor(Math.max(p, q))}}$.`,
          shared
            ? `The factor $${factor(p)}$ cancels, leaving a hole at $x = ${p}$. The asymptote is $x = ${q}$.`
            : `Nothing cancels, so both zeros of the denominator give asymptotes: $x = ${asymptotes[0]}$ and $x = ${asymptotes[1]}$.`,
        ],
        data: { p, q, s },
      }
    },
  },
  {
    id: 'hole',
    title: 'Height of a hole',
    skills: ['asymptotes'],
    difficulty: 2,
    generate: (rng) => {
      const s = rng.int(-5, 5)
      const t = intExcept(rng, -5, 5, [s])
      const q = intExcept(rng, -5, 5, [s, t])
      const top = polyFromRoots([s, t])
      const bottom = polyFromRoots([s, q])
      const y = (s - t) / (s - q)
      return {
        prompt: `The graph of $f(x) = ${rational(top, bottom)}$ has a hole. What is its $y$-coordinate?`,
        answer: { kind: 'number', value: y },
        hints: [
          'Factor the numerator and the denominator and cancel the common factor.',
          'The hole is at the zero of the cancelled factor; evaluate what is left there.',
        ],
        solution: [
          `$f(x) = \\frac{${factor(s)}${factor(t)}}{${factor(s)}${factor(q)}} = \\frac{${factor(t)}}{${factor(q)}}$ for $x \\neq ${s}$.`,
          `At $x = ${s}$ the simplified form is $\\frac{${s} - ${paren(t)}}{${s} - ${paren(q)}} = ${frac(s - t, s - q)}$, so the hole is $\\left(${s}, ${frac(s - t, s - q)}\\right)$.`,
        ],
        data: { s, t, q },
      }
    },
  },
  {
    id: 'horizontal-asymptote',
    title: 'Horizontal asymptote',
    skills: ['asymptotes'],
    difficulty: 1,
    generate: (rng) => {
      const equal = rng.bool()
      const a = rng.nonZeroInt(-6, 6)
      const b = rng.nonZeroInt(-4, 4)
      const top = equal ? [a, rng.int(-5, 5), rng.int(-9, 9)] : [a, rng.int(-9, 9)]
      const bottom = [b, rng.int(-5, 5), rng.nonZeroInt(-9, 9)]
      const L = equal ? a / b : 0
      return {
        prompt: `What is the horizontal asymptote of $f(x) = ${rational(top, bottom)}$? Enter the value $L$ in $y = L$.`,
        answer: { kind: 'number', value: L },
        hints: ['Compare the degrees of the numerator and the denominator.'],
        solution: equal
          ? [
              'The degrees are equal, so the asymptote is the ratio of the leading coefficients.',
              `$L = \\frac{${a}}{${b}} = ${frac(a, b)}$.`,
            ]
          : [
              'The numerator has the lower degree, so the denominator outgrows it.',
              'The values approach $0$: the asymptote is $y = 0$.',
            ],
        data: {
          equal: equal ? 1 : 0,
          a,
          b,
          top1: top[1]!,
          top2: top[2] ?? 0,
          b1: bottom[1]!,
          b2: bottom[2]!,
        },
      }
    },
  },
  {
    id: 'slant-asymptote',
    title: 'Slant asymptote',
    skills: ['asymptotes'],
    difficulty: 3,
    generate: (rng) => {
      const r = rng.nonZeroInt(-4, 4)
      const a = rng.pick([1, 1, 2, -1])
      const top = [a, rng.int(-6, 6), rng.int(-9, 9)]
      // A zero remainder would cancel the denominator: nudge the constant term.
      if (polyDivide(top, [1, -r]).remainder[0] === 0) top[2] = top[2]! + 1
      const div = polyDivide(top, [1, -r])
      const [m, b] = div.quotient as [number, number]
      const rem = div.remainder[0]!
      const line = sum([
        [m, 'x'],
        [b, ''],
      ])
      return {
        prompt: `Find the slant asymptote of $f(x) = ${rational(top, [1, -r])}$. Enter it as $y = mx + b$ or just the right side.`,
        answer: { kind: 'expression', tex: line },
        hints: [
          'Divide the numerator by the denominator with long division.',
          'The quotient is the line; the remainder over the denominator goes to $0$.',
        ],
        solution: [
          `Long division: $${poly(top)} = (${poly([1, -r])})(${line})${signed(rem)}$.`,
          `So $f(x) = ${line} + \\frac{${rem}}{${poly([1, -r])}}$, and the fraction goes to $0$ as $x \\to \\pm\\infty$.`,
          `The slant asymptote is $y = ${line}$.`,
        ],
        data: { r, a, t1: top[1]!, t2: top[2]! },
      }
    },
  },
])
