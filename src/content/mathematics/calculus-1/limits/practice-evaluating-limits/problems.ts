import { polyEval, polyFromRoots } from '@/lib/math'
import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { frac, num, poly, sum } = tex

/** x - r as TeX, in parentheses unless it is just x: (x - 3), (x + 2), x. */
const factor = (r: number) =>
  r === 0
    ? 'x'
    : `(${sum([
        [1, 'x'],
        [-r, ''],
      ])})`

/** x + c without parentheses: x + 4, x - 1, x. */
const plus = (c: number) =>
  sum([
    [1, 'x'],
    [c, ''],
  ])

/** The limit as TeX, with an optional side: \lim_{x \to 2^{-}}. */
const lim = (a: string, side: -1 | 0 | 1 = 0) =>
  `\\lim_{x \\to ${a}${side === 0 ? '' : side < 0 ? '^{-}' : '^{+}'}}`

/** Distinct whole numbers in [lo, hi], none of them in `avoid`. */
const distinct = (rng: Rng, n: number, lo: number, hi: number, avoid: number[] = []) => {
  const out: number[] = []
  while (out.length < n) {
    const v = rng.int(lo, hi)
    if (!out.includes(v) && !avoid.includes(v)) out.push(v)
  }
  return out
}

/** A coefficient that is never zero. */
const nonzero = (rng: Rng, lo: number, hi: number) => rng.pick(distinct(rng, 1, lo, hi, [0]))

const DNE = 'The limit does not exist'

export const problems = defineProblems([
  {
    id: 'substitution',
    title: 'Direct substitution',
    skills: ['evaluating-limits'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-3, 3)
      if (rng.bool()) {
        const coeffs = [nonzero(rng, -3, 3), rng.int(-4, 4), rng.int(-4, 4), rng.int(-6, 6)]
        const value = polyEval(coeffs, a)
        const substituted = sum(
          coeffs.map((c, i) => {
            const d = 3 - i
            return [c, d === 0 ? '' : d === 1 ? `(${a})` : `(${a})^{${d}}`] as const
          }),
        )
        return {
          prompt: `Find $${lim(String(a))} (${poly(coeffs)})$.`,
          answer: { kind: 'number', value },
          hints: ['A polynomial is defined everywhere. Substitute first.'],
          solution: [`Polynomials allow direct substitution: $${substituted} = ${value}$.`],
          data: { a },
        }
      }
      // A rational function whose denominator is not zero at a.
      const [b, c] = distinct(rng, 2, -5, 5, [-a])
      const k = nonzero(rng, -3, 3)
      const value = (k * (a + b!)) / (a + c!)
      const top = sum([
        [k, 'x'],
        [k * b!, ''],
      ])
      return {
        prompt: `Find $${lim(String(a))} \\frac{${top}}{${plus(c!)}}$.`,
        answer: { kind: 'number', value },
        hints: [`Check the denominator at $x = ${a}$ before doing any algebra.`],
        solution: [
          `The denominator is $${a + c!} \\neq 0$ at $x = ${a}$, so substitute.`,
          `$\\frac{${k * (a + b!)}}{${a + c!}} = ${frac(k * (a + b!), a + c!)}$.`,
        ],
        data: { a },
      }
    },
  },
  {
    id: 'factor-cancel',
    title: 'Factor and cancel',
    skills: ['evaluating-limits'],
    difficulty: 2,
    generate: (rng) => {
      const [r, s, t] = distinct(rng, 3, -5, 5) as [number, number, number]
      const linear = rng.bool()
      const top = poly(polyFromRoots([r, s]))
      const bottom = linear ? plus(-r) : poly(polyFromRoots([r, t]))
      const value = linear ? r - s : (r - s) / (r - t)
      const reduced = linear ? plus(-s) : `\\frac{${plus(-s)}}{${plus(-t)}}`
      return {
        prompt: `Find $${lim(String(r))} \\frac{${top}}{${bottom}}$.`,
        answer: { kind: 'number', value },
        hints: [
          `Substituting $x = ${r}$ gives $\\frac{0}{0}$, so $${factor(r)}$ is a factor of both.`,
          'Factor, cancel the common factor, then substitute.',
        ],
        solution: [
          `$\\frac{${top}}{${bottom}} = \\frac{${factor(r)}${factor(s)}}{${linear ? bottom : factor(r) + factor(t)}}$.`,
          `For $x \\neq ${r}$ this is $${reduced}$.`,
          `Substitute $x = ${r}$: $${frac(r - s, linear ? 1 : r - t)}$.`,
        ],
        data: { r, s, t, linear: linear ? 1 : 0 },
      }
    },
  },
  {
    id: 'rationalize',
    title: 'Rationalize',
    skills: ['evaluating-limits'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.int(1, 5)
      const a = rng.int(-3, 6)
      const c = k * k - a
      const root = `\\sqrt{${plus(c)}}`
      return {
        prompt: `Find $${lim(String(a))} \\frac{${root} - ${k}}{${plus(-a)}}$.`,
        answer: { kind: 'number', value: 1 / (2 * k) },
        hints: [
          'Substitution gives $\\frac{0}{0}$.',
          `Multiply the top and the bottom by the conjugate $${root} + ${k}$.`,
        ],
        solution: [
          `The top becomes $(${plus(c)}) - ${k * k} = ${plus(-a)}$, which cancels with the bottom.`,
          `What is left is $\\frac{1}{${root} + ${k}}$.`,
          `At $x = ${a}$: $\\frac{1}{${k} + ${k}} = ${frac(1, 2 * k)}$.`,
        ],
        data: { k, a },
      }
    },
  },
  {
    id: 'combine-fractions',
    title: 'Combine fractions',
    skills: ['evaluating-limits'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(2, 5)
      const a = rng.int(-3, 4)
      const c = m - a
      return {
        prompt: `Find $${lim(String(a))} \\frac{\\frac{1}{${plus(c)}} - \\frac{1}{${m}}}{${plus(-a)}}$.`,
        answer: { kind: 'number', value: -1 / (m * m) },
        hints: [
          `Write $\\frac{1}{${plus(c)}} - \\frac{1}{${m}}$ over the common denominator $${m}(${plus(c)})$.`,
        ],
        solution: [
          `$\\frac{1}{${plus(c)}} - \\frac{1}{${m}} = \\frac{${m} - (${plus(c)})}{${m}(${plus(c)})} = \\frac{-(${plus(-a)})}{${m}(${plus(c)})}$.`,
          `Dividing by $${plus(-a)}$ leaves $-\\frac{1}{${m}(${plus(c)})}$ for $x \\neq ${a}$.`,
          `At $x = ${a}$: $-\\frac{1}{${m} \\cdot ${m}} = ${frac(-1, m * m)}$.`,
        ],
        data: { m, a },
      }
    },
  },
  {
    id: 'one-sided-piecewise',
    title: 'One-sided limit of a piecewise function',
    skills: ['one-sided-limits'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-3, 3)
      const [m1, b1] = [nonzero(rng, -3, 3), rng.int(-5, 5)]
      const [c2, b2] = [rng.pick([-2, -1, 1, 2]), rng.int(-5, 5)]
      const side = rng.pick([-1, 1] as const)
      const left = m1 * a + b1
      const right = c2 * a * a + b2
      const value = side < 0 ? left : right
      const def = `f(x) = \\begin{cases} ${poly([m1, b1])} & x < ${a} \\\\ ${poly([c2, 0, b2])} & x \\geq ${a} \\end{cases}`
      const piece = side < 0 ? poly([m1, b1]) : poly([c2, 0, b2])
      return {
        prompt: `For $${def}$, find $${lim(String(a), side)} f(x)$.`,
        answer: { kind: 'number', value },
        hints: [
          `${side < 0 ? 'From the left' : 'From the right'}, $x ${side < 0 ? '<' : '>'} ${a}$, so only one piece matters.`,
        ],
        solution: [
          `For $x ${side < 0 ? '<' : '>'} ${a}$, $f(x) = ${piece}$.`,
          `That piece is a polynomial, so substitute $x = ${a}$: $${value}$.`,
        ],
        data: { a, m1, b1, c2, b2, side },
      }
    },
  },
  {
    id: 'two-sided-exists',
    title: 'Does the limit exist?',
    skills: ['one-sided-limits', 'reading-limits'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(-2, 3)
      const [m1, b1] = [nonzero(rng, -3, 3), rng.int(-4, 4)]
      const m2 = nonzero(rng, -3, 3)
      const left = m1 * a + b1
      const agree = rng.bool()
      const right = agree ? left : left + rng.pick([-3, -2, -1, 1, 2, 3])
      const b2 = right - m2 * a
      const v = rng.pick(distinct(rng, 1, -6, 6, [left, right]))
      const def = `f(x) = \\begin{cases} ${poly([m1, b1])} & x < ${a} \\\\ ${v} & x = ${a} \\\\ ${poly([m2, b2])} & x > ${a} \\end{cases}`
      const values = [left, right, v]
      const filler = distinct(rng, 1, -8, 8, values)[0]!
      const numbers = [...new Set(agree ? [left, v, filler] : values)]
      const options = rng.shuffle(numbers.map((n) => `$${n}$`)).concat(DNE)
      return {
        prompt: `For $${def}$, what is $${lim(String(a))} f(x)$?`,
        answer: {
          kind: 'choice',
          options,
          correct: agree ? options.indexOf(`$${left}$`) : options.indexOf(DNE),
        },
        hints: [
          'Find the limit from the left and from the right separately.',
          `The value $f(${a})$ plays no part in the limit.`,
        ],
        solution: [
          `From the left: $${poly([m1, b1])} \\to ${left}$. From the right: $${poly([m2, b2])} \\to ${right}$.`,
          agree
            ? `Both sides approach $${left}$, so the limit is $${left}$, whatever $f(${a}) = ${v}$ is.`
            : `The one-sided limits differ, so the two-sided limit does not exist.`,
        ],
        data: { a, m1, b1, m2, b2, v, agree: agree ? 1 : 0 },
      }
    },
  },
  {
    id: 'infinite-limit',
    title: 'Infinite limit',
    skills: ['one-sided-limits'],
    difficulty: 2,
    generate: (rng) => {
      const a = rng.int(-3, 4)
      const b = rng.pick(distinct(rng, 1, -5, 5, [-a]))
      const m = rng.pick([1, 2] as const)
      const side = rng.pick([-1, 0, 1] as const)
      const k = a + b
      const bottom = m === 1 ? plus(-a) : `${factor(a)}^{2}`
      const options = ['$\\infty$', '$-\\infty$', '$0$', `${DNE}, not even as $\\pm\\infty$`]
      // The sign of k / (x - a)^m near a on the given side; 0 means the sides disagree.
      const sign = m === 2 ? Math.sign(k) : side === 0 ? 0 : Math.sign(k) * side
      const correct = sign > 0 ? 0 : sign < 0 ? 1 : 3
      const sideWord = side < 0 ? 'left' : 'right'
      return {
        prompt: `Find $${lim(String(a), side)} \\frac{${plus(b)}}{${bottom}}$.`,
        answer: { kind: 'choice', options, correct },
        hints: [
          `Substituting gives $\\frac{${k}}{0}$: a nonzero number over something tending to $0$.`,
          'Find the sign of the bottom on each side of the point.',
        ],
        solution: [
          `The top tends to $${k}$ and the bottom to $0$, so the values grow without bound.`,
          m === 2
            ? `The bottom is a square, positive on both sides, so the limit is $${k > 0 ? '' : '-'}\\infty$.`
            : side === 0
              ? `The bottom is negative left of $${a}$ and positive right of it, so the sides go to opposite infinities: no limit.`
              : `On the ${sideWord}, the bottom is a small ${side < 0 ? 'negative' : 'positive'} number and the top is near $${k}$, so the quotient is a large ${sign > 0 ? 'positive' : 'negative'} number: $${sign > 0 ? '' : '-'}\\infty$.`,
        ],
        data: { a, b, m, side },
      }
    },
  },
  {
    id: 'limit-at-infinity',
    title: 'Limit at infinity',
    skills: ['limits-at-infinity'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(1, 3)
      const lower = rng.int(0, 2) === 0
      const p = nonzero(rng, -6, 6)
      const q = nonzero(rng, -4, 4)
      const topDegree = lower ? n - 1 : n
      const top = [p, ...Array.from({ length: topDegree }, () => rng.int(-5, 5))]
      const bottom = [q, ...Array.from({ length: n }, () => rng.int(-5, 5))]
      const dir = rng.pick(['\\infty', '-\\infty'])
      const value = lower ? 0 : p / q
      const power = n === 1 ? 'x' : `x^{${n}}`
      return {
        prompt: `Find $${lim(dir)} \\frac{${poly(top)}}{${poly(bottom)}}$.`,
        answer: { kind: 'number', value },
        hints: [
          `Divide the top and the bottom by $${power}$, the highest power in the denominator.`,
        ],
        solution: [
          `After dividing by $${power}$, every term with $x$ in a denominator tends to $0$.`,
          lower
            ? `The top has lower degree, so it tends to $0$ while the bottom tends to $${q}$: the limit is $0$.`
            : `What remains is the ratio of the leading coefficients, $${frac(p, q)}$.`,
        ],
        data: { p, q, lower: lower ? 1 : 0 },
      }
    },
  },
  {
    id: 'root-at-infinity',
    title: 'Root at infinity',
    skills: ['limits-at-infinity'],
    difficulty: 3,
    generate: (rng) => {
      const p = rng.int(1, 4)
      const c = rng.int(1, 9)
      const q = rng.int(1, 4)
      const r = nonzero(rng, -5, 5)
      const negative = rng.bool()
      const value = ((negative ? -1 : 1) * p) / q
      const root = `\\sqrt{${poly([p * p, 0, c])}}`
      const bottom = poly([q, r])
      return {
        prompt: `Find $${lim(negative ? '-\\infty' : '\\infty')} \\frac{${root}}{${bottom}}$.`,
        answer: { kind: 'number', value },
        hints: [
          `For large $|x|$, $${root}$ behaves like $\\sqrt{${p * p}x^2} = ${p === 1 ? '' : p}|x|$.`,
          negative ? 'For $x < 0$, $|x| = -x$.' : 'For $x > 0$, $|x| = x$.',
        ],
        solution: [
          `Divide the top and the bottom by $|x| = ${negative ? '-x' : 'x'}$. The top becomes $\\sqrt{${p * p} + \\frac{${c}}{x^2}} \\to ${p}$.`,
          `The bottom becomes $${negative ? '-' : ''}\\left(${q} ${r < 0 ? '-' : '+'} \\frac{${Math.abs(r)}}{x}\\right) \\to ${negative ? -q : q}$.`,
          `So the limit is $${num(value)}$.`,
        ],
        data: { p, q, negative: negative ? 1 : 0 },
      }
    },
  },
  {
    id: 'conjugate-at-infinity',
    title: 'Infinity minus infinity',
    skills: ['limits-at-infinity', 'evaluating-limits'],
    difficulty: 3,
    generate: (rng) => {
      const k = rng.int(1, 3)
      const b = nonzero(rng, -6, 6)
      const c = rng.int(1, 9)
      const root = `\\sqrt{${poly([k * k, b, c])}}`
      const kx = tex.term(k, 'x')
      return {
        prompt: `Find $${lim('\\infty')} \\left(${root} - ${kx}\\right)$.`,
        answer: { kind: 'number', value: b / (2 * k) },
        hints: [
          'Both terms grow without bound: $\\infty - \\infty$ decides nothing.',
          `Multiply and divide by the conjugate $${root} + ${kx}$.`,
        ],
        solution: [
          `The conjugate turns the difference into $\\frac{(${poly([k * k, b, c])}) - ${k * k === 1 ? '' : k * k}x^2}{${root} + ${kx}} = \\frac{${poly([b, c])}}{${root} + ${kx}}$.`,
          `Divide the top and the bottom by $x$ (positive here). The top becomes $${b} + \\frac{${c}}{x} \\to ${b}$, and the bottom $\\sqrt{${k * k} + \\frac{${poly([b, c])}}{x^2}} + ${k} \\to ${2 * k}$.`,
          `So the limit is $\\frac{${b}}{${2 * k}} = ${frac(b, 2 * k)}$.`,
        ],
        data: { k, b, c },
      }
    },
  },
  {
    id: 'top-higher-at-infinity',
    title: 'Top degree higher at infinity',
    skills: ['limits-at-infinity'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(1, 2)
      const extra = rng.int(1, 2)
      const p = nonzero(rng, -5, 5)
      const q = nonzero(rng, -4, 4)
      const top = [p, ...Array.from({ length: n + extra }, () => rng.int(-5, 5))]
      const bottom = [q, ...Array.from({ length: n }, () => rng.int(-5, 5))]
      const negative = rng.bool()
      // Leading terms: (p/q) x^extra, whose sign at -infinity flips for an odd extra.
      const sign = Math.sign(p / q) * (negative && extra % 2 === 1 ? -1 : 1)
      const options = ['$\\infty$', '$-\\infty$', `$${frac(p, q)}$`, '$0$']
      const power = extra === 1 ? 'x' : `x^{${extra}}`
      return {
        prompt: `Find $${lim(negative ? '-\\infty' : '\\infty')} \\frac{${poly(top)}}{${poly(bottom)}}$.`,
        answer: { kind: 'choice', options, correct: sign > 0 ? 0 : 1 },
        hints: [
          'Compare the degrees of the top and the bottom.',
          'The quotient behaves like the ratio of the leading terms.',
        ],
        solution: [
          `For large $|x|$ the quotient behaves like $\\frac{${tex.term(p, `x^{${n + extra}}`)}}{${tex.term(q, n === 1 ? 'x' : `x^{${n}}`)}} = ${frac(p, q)}\\,${power}$.`,
          `As $x \\to ${negative ? '-' : ''}\\infty$, $${power}$ tends to $${negative && extra % 2 === 1 ? '-' : ''}\\infty$, so the quotient tends to $${sign > 0 ? '' : '-'}\\infty$. The ratio $${frac(p, q)}$ would be the answer only for equal degrees.`,
        ],
        data: { p, q, n, extra, negative: negative ? 1 : 0 },
      }
    },
  },
  {
    id: 'zero-over-zero-exists',
    title: 'A 0/0 limit that may not exist',
    skills: ['one-sided-limits', 'evaluating-limits'],
    difficulty: 2,
    generate: (rng): Problem => {
      const a = rng.int(-3, 3)
      const side = rng.pick([-1, 0, 0, 1] as const)
      const sideWord = side < 0 ? 'left' : 'right'
      if (rng.bool()) {
        const k = rng.int(1, 4)
        const coef = k === 1 ? '' : String(k)
        const options = [`$${k}$`, `$${-k}$`, '$0$', DNE]
        const correct = side === 0 ? 3 : side > 0 ? 0 : 1
        return {
          prompt: `Find $${lim(String(a), side)} \\frac{${coef}|${plus(-a)}|}{${plus(-a)}}$.`,
          answer: { kind: 'choice', options, correct },
          hints: [
            `$|${plus(-a)}|$ is $${plus(-a)}$ when $x > ${a}$ and $-(${plus(-a)})$ when $x < ${a}$.`,
          ],
          solution: [
            `For $x > ${a}$ the quotient is $${k}$; for $x < ${a}$ it is $${-k}$. Substituting gives $\\frac{0}{0}$, but the quotient never comes near $0$.`,
            side === 0
              ? 'The one-sided limits differ, so the two-sided limit does not exist.'
              : `From the ${sideWord} the quotient is constant, so the limit is $${side > 0 ? k : -k}$.`,
          ],
          data: { a, side, k, variant: 0 },
        }
      }
      const b = rng.pick(distinct(rng, 1, -4, 4, [a]))
      // (x - a)(x - b) / (x - a)^2 = (x - b) / (x - a): a nonzero number over 0 after cancelling.
      const sign = side === 0 ? 0 : Math.sign(a - b) * side
      const decoy = rng.pick([0, 1, a - b])
      const options = ['$\\infty$', '$-\\infty$', `$${decoy}$`, DNE]
      return {
        prompt: `Find $${lim(String(a), side)} \\frac{${poly(polyFromRoots([a, b]))}}{${factor(a)}^{2}}$.`,
        answer: { kind: 'choice', options, correct: sign > 0 ? 0 : sign < 0 ? 1 : 3 },
        hints: [
          'Substitution gives $\\frac{0}{0}$. Factor and cancel first.',
          'After cancelling, substitute again and look at what is left.',
        ],
        solution: [
          `The top is $${factor(a)}${factor(b)}$, so for $x \\neq ${a}$ the quotient is $\\frac{${plus(-b)}}{${plus(-a)}}$.`,
          `Now substitution gives $\\frac{${a - b}}{0}$: a nonzero number over something tending to $0$. Cancelling did not remove the $\\frac{0}{0}$; it showed an infinite limit.`,
          side === 0
            ? `The bottom changes sign at $${a}$, so the sides go to opposite infinities and the limit does not exist.`
            : `From the ${sideWord} the bottom is ${side < 0 ? 'negative' : 'positive'} and the top is near $${a - b}$, so the limit is $${sign > 0 ? '' : '-'}\\infty$.`,
        ],
        data: { a, side, b, variant: 1 },
      }
    },
  },
  {
    id: 'difference-of-cubes',
    title: 'Difference of cubes',
    skills: ['evaluating-limits'],
    difficulty: 2,
    generate: (rng) => {
      const a = nonzero(rng, -3, 3)
      const squares = rng.bool()
      const top = poly([1, 0, 0, -(a ** 3)])
      const bottom = squares ? poly([1, 0, -a * a]) : plus(-a)
      const quad = poly([1, a, a * a])
      const value = squares ? (3 * a) / 2 : 3 * a * a
      return {
        prompt: `Find $${lim(String(a))} \\frac{${top}}{${bottom}}$.`,
        answer: { kind: 'number', value },
        hints: [
          'Substitution gives $\\frac{0}{0}$.',
          `Use $x^3 - b^3 = (x - b)(x^2 + bx + b^2)$ with $b = ${a}$${squares ? ', and a difference of squares below' : ''}.`,
        ],
        solution: [
          `$${top} = ${factor(a)}(${quad})$${squares ? ` and $${bottom} = ${factor(a)}${factor(-a)}$` : ''}.`,
          squares
            ? `For $x \\neq ${a}$ the quotient is $\\frac{${quad}}{${plus(a)}}$, which at $x = ${a}$ is $\\frac{${3 * a * a}}{${2 * a}} = ${frac(3 * a, 2)}$.`
            : `For $x \\neq ${a}$ the quotient is $${quad}$, which at $x = ${a}$ is $${3 * a * a}$.`,
        ],
        data: { a, squares: squares ? 1 : 0 },
      }
    },
  },
  {
    id: 'two-techniques',
    title: 'Two techniques at once',
    skills: ['evaluating-limits'],
    difficulty: 3,
    generate: (rng) => {
      const k = rng.int(1, 4)
      const a = nonzero(rng, -3, 4)
      const c = k * k - a
      const root = `\\sqrt{${plus(c)}}`
      return {
        prompt: `Find $${lim(String(a))} \\frac{${root} - ${k}}{${poly([1, 0, -a * a])}}$.`,
        answer: { kind: 'number', value: 1 / (4 * k * a) },
        hints: [
          `Multiply the top and the bottom by the conjugate $${root} + ${k}$.`,
          `Then factor the difference of squares $${poly([1, 0, -a * a])}$.`,
        ],
        solution: [
          `The top becomes $(${plus(c)}) - ${k * k} = ${plus(-a)}$, so the quotient is $\\frac{${plus(-a)}}{(${poly([1, 0, -a * a])})(${root} + ${k})}$.`,
          `$${poly([1, 0, -a * a])} = ${factor(a)}${factor(-a)}$, and cancelling $${factor(a)}$ leaves $\\frac{1}{(${plus(a)})(${root} + ${k})}$.`,
          `At $x = ${a}$: $\\frac{1}{${2 * a} \\cdot ${2 * k}} = ${frac(1, 4 * k * a)}$.`,
        ],
        data: { k, a },
      }
    },
  },
  {
    id: 'table-limit',
    title: 'Read a limit from a table',
    skills: ['reading-limits'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-2, 4)
      const L = rng.int(-5, 6)
      const jump = rng.int(0, 2) === 0
      const R = jump ? L + rng.pick([-2, -1, 1, 2]) : L
      const [m, q] = [nonzero(rng, -3, 3), rng.int(-2, 2)]
      const v = rng.pick(distinct(rng, 1, -6, 8, [L, R]))
      const steps = [-0.1, -0.01, -0.001, 0.001, 0.01, 0.1]
      const f = (h: number) => (h < 0 ? L : R) + m * h + q * h * h
      const cells = steps.map((h) => +f(h).toFixed(6))
      const xs = steps.map((h) => +(a + h).toFixed(3))
      const table = `\\begin{array}{c|cccccc} x & ${xs.join(' & ')} \\\\ \\hline f(x) & ${cells.join(' & ')} \\end{array}`
      const numbers = [...new Set([L, v, R, jump ? L + R : L + m])]
      const options = rng.shuffle(numbers.slice(0, 3).map((n) => `$${n}$`)).concat(DNE)
      return {
        prompt: `A function has $f(${a}) = ${v}$ and these values near $x = ${a}$: $${table}$ What does the table suggest for $${lim(String(a))} f(x)$?`,
        answer: {
          kind: 'choice',
          options,
          correct: jump ? options.indexOf(DNE) : options.indexOf(`$${L}$`),
        },
        hints: [
          `Read the left half (inputs below $${a}$) and the right half separately.`,
          `The value $f(${a}) = ${v}$ plays no part.`,
        ],
        solution: [
          `From the left the values close in on $${L}$; from the right on $${R}$.`,
          jump
            ? 'The two sides approach different numbers, so the two-sided limit does not exist.'
            : `Both sides approach $${L}$, so the table suggests a limit of $${L}$, whatever $f(${a})$ is. A table only suggests a limit; algebra or a proof settles it.`,
        ],
        data: { a, L, R, m, q, v },
      }
    },
  },
])
