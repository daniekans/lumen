import {
  exactTex,
  piTex,
  reduceAngle,
  sinusoidFeatures,
  solveInTurn,
  tanUndefined,
} from '@/lib/math'
import { defineProblems, tex, type Problem, type Rng } from '@/lib/practice'

const { frac } = tex

/** Pythagorean triples: legs a, b and hypotenuse h. */
const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
] as const

const QUADRANT_TEX = [
  '0 < \\theta < \\frac{\\pi}{2}',
  '\\frac{\\pi}{2} < \\theta < \\pi',
  '\\pi < \\theta < \\frac{3\\pi}{2}',
  '\\frac{3\\pi}{2} < \\theta < 2\\pi',
]

/** Signs of (cos, sin) in quadrants 1 to 4. */
const SIGNS = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
] as const

const FN_TEX = { sin: '\\sin', cos: '\\cos', tan: '\\tan' } as const

/** The reference angle of nπ/d in one turn, as [n', d] with 0 ≤ n'π/d ≤ π/2. */
const reference = (n: number, d: number) => {
  const m = ((n % (2 * d)) + 2 * d) % (2 * d)
  if (m <= d / 2) return m
  if (m <= d) return d - m
  if (m <= (3 * d) / 2) return m - d
  return 2 * d - m
}

const quadrantOf = (t: number) => Math.floor(reduceAngle(t) / (Math.PI / 2)) + 1

/** A point (x, y) on a circle of radius h in a quadrant, from a triple, with sin and cos as fractions. */
const angleFromTriple = (rng: Rng) => {
  const [a, b, h] = rng.pick(TRIPLES)
  const [x0, y0] = rng.bool() ? [a, b] : [b, a]
  const q = rng.int(1, 4)
  const [sx, sy] = SIGNS[q - 1]!
  return { x: sx * x0, y: sy * y0, h, q }
}

const sinusoidTex = (A: number, B: number, C: number, D: number) => {
  const amp = A === 1 ? '' : A === -1 ? '-' : String(A)
  const inner = C === 0 ? 'x' : `x ${C > 0 ? '-' : '+'} ${Math.abs(C)}`
  const arg = B === 1 ? inner : C === 0 ? `${B}x` : `${B}(${inner})`
  const shift = D === 0 ? '' : ` ${D > 0 ? '+' : '-'} ${Math.abs(D)}`
  return `y = ${amp}\\sin(${arg})${shift}`
}

const SPECIAL_C = [
  [0, '0'],
  [0.5, '\\frac{1}{2}'],
  [-0.5, '-\\frac{1}{2}'],
  [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'],
  [-Math.SQRT2 / 2, '-\\frac{\\sqrt{2}}{2}'],
  [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'],
  [-Math.sqrt(3) / 2, '-\\frac{\\sqrt{3}}{2}'],
  [1, '1'],
  [-1, '-1'],
] as const

export const problems = defineProblems([
  {
    id: 'degrees-radians',
    title: 'Degrees and radians',
    skills: ['radians'],
    difficulty: 1,
    generate: (rng): Problem => {
      const d = rng.pick([4, 6, 3, 2])
      const n = rng.int(1, 2 * d)
      const deg = (n * 180) / d
      if (rng.bool()) {
        return {
          prompt: `Convert $${deg}^\\circ$ to radians.`,
          answer: { kind: 'expression', tex: piTex(n, d) },
          hints: ['$180^\\circ = \\pi$, so multiply by $\\frac{\\pi}{180}$.'],
          solution: [`$${deg} \\cdot \\frac{\\pi}{180} = ${piTex(n, d)}$.`],
          data: { deg },
        }
      }
      return {
        prompt: `Convert $${piTex(n, d)}$ radians to degrees.`,
        answer: { kind: 'number', value: deg },
        hints: ['$\\pi = 180^\\circ$, so multiply by $\\frac{180}{\\pi}$.'],
        solution: [`$${piTex(n, d)} \\cdot \\frac{180}{\\pi} = ${deg}^\\circ$.`],
        data: { rad: (n * Math.PI) / d },
      }
    },
  },
  {
    id: 'arc-length',
    title: 'Arc length',
    skills: ['radians'],
    difficulty: 1,
    generate: (rng): Problem => {
      const r = rng.int(2, 12)
      if (rng.bool()) {
        const d = rng.pick([2, 3, 4, 6])
        const n = rng.int(1, 2 * d - 1)
        const theta = (n * Math.PI) / d
        return {
          prompt: `A circle has radius $${r}$. How long is the arc cut by an angle of $${piTex(n, d)}$? Give the exact value.`,
          answer: { kind: 'expression', tex: piTex(r * n, d) },
          hints: ['With the angle in radians, the arc is $s = r\\theta$.'],
          solution: [`$s = ${r} \\cdot ${piTex(n, d)} = ${piTex(r * n, d)}$.`],
          data: { r, theta },
        }
      }
      const s = r * rng.int(1, 5)
      return {
        prompt: `An arc of length $${s}$ lies on a circle of radius $${r}$. What angle does it cut, in radians?`,
        answer: { kind: 'number', value: s / r },
        hints: ['Solve $s = r\\theta$ for $\\theta$.'],
        solution: [`$\\theta = \\frac{s}{r} = ${frac(s, r)}$ radians.`],
        data: { r, s },
      }
    },
  },
  {
    id: 'exact-value',
    title: 'Exact values on the unit circle',
    skills: ['unit-circle'],
    difficulty: 2,
    generate: (rng) => {
      const fn = rng.pick(['sin', 'cos', 'tan'] as const)
      const d = rng.pick([6, 4, 3])
      const options = Array.from({ length: 2 * d - 1 }, (_, i) => i + 1).filter(
        (n) => (2 * n) % d !== 0 && !(fn === 'tan' && tanUndefined((n * Math.PI) / d)),
      )
      const n = rng.pick(options)
      const theta = (n * Math.PI) / d
      const value = (fn === 'sin' ? Math.sin : fn === 'cos' ? Math.cos : Math.tan)(theta)
      const ref = reference(n, d)
      const q = quadrantOf(theta)
      const refValue = Math.abs(value)
      return {
        prompt: `Find the exact value of $${FN_TEX[fn]} ${piTex(n, d)}$.`,
        answer: { kind: 'expression', tex: exactTex(value)! },
        hints: [
          'Find the reference angle: the angle to the $x$-axis, between $0$ and $\\frac{\\pi}{2}$.',
          'The quadrant decides the sign: cosine is negative on the left, sine below the axis.',
        ],
        solution: [
          `$${piTex(n, d)}$ is in quadrant ${q}, with reference angle $${piTex(ref, d)}$, where $${FN_TEX[fn]}$ is $${exactTex(refValue)}$.`,
          `In quadrant ${q} it is ${value < 0 ? 'negative' : 'positive'}, so $${FN_TEX[fn]} ${piTex(n, d)} = ${exactTex(value)}$.`,
        ],
        data: { fn: ['sin', 'cos', 'tan'].indexOf(fn), theta },
      }
    },
  },
  {
    id: 'from-one-ratio',
    title: 'One ratio from another',
    skills: ['trig-identities', 'unit-circle'],
    difficulty: 2,
    generate: (rng) => {
      const { x, y, h, q } = angleFromTriple(rng)
      const givenSin = rng.bool()
      const ask = rng.pick(givenSin ? (['cos', 'tan'] as const) : (['sin', 'tan'] as const))
      const value = ask === 'cos' ? x / h : ask === 'sin' ? y / h : y / x
      const given = givenSin ? `\\sin\\theta = ${frac(y, h)}` : `\\cos\\theta = ${frac(x, h)}`
      const other = givenSin ? Math.abs(x) : Math.abs(y)
      return {
        prompt: `Given $${given}$ and $${QUADRANT_TEX[q - 1]}$, find $${FN_TEX[ask]}\\theta$.`,
        answer: { kind: 'number', value },
        hints: [
          'Use $\\sin^2\\theta + \\cos^2\\theta = 1$ for the missing value, then the quadrant for its sign.',
        ],
        solution: [
          `$${givenSin ? '\\cos' : '\\sin'}^2\\theta = 1 - ${frac((givenSin ? y : x) ** 2, h * h)} = ${frac(other ** 2, h * h)}$, so $${givenSin ? '\\cos' : '\\sin'}\\theta = \\pm ${frac(other, h)}$.`,
          `In quadrant ${q}, $\\cos\\theta = ${frac(x, h)}$ and $\\sin\\theta = ${frac(y, h)}$.`,
          ask === 'tan'
            ? `$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = ${frac(y, x)}$.`
            : `So $${FN_TEX[ask]}\\theta = ${frac(ask === 'cos' ? x : y, h)}$.`,
        ],
        data: { x, y, h, givenSin: givenSin ? 1 : 0, ask: ['sin', 'cos', 'tan'].indexOf(ask) },
      }
    },
  },
  {
    id: 'sinusoid-features',
    title: 'Reading a sinusoid',
    skills: ['trig-graphs'],
    difficulty: 1,
    generate: (rng) => {
      const A = rng.pick([-4, -3, -2, -1, 2, 3, 4, 5])
      const B = rng.pick([1, 2, 3, 4])
      const C = rng.int(-3, 3)
      const D = rng.int(-4, 4)
      const f = sinusoidFeatures({ A, B, C, D })
      const ask = rng.pick(['amplitude', 'period', 'max', 'min'] as const)
      const words = {
        amplitude: 'the amplitude',
        period: 'the period',
        max: 'the maximum value',
        min: 'the minimum value',
      }
      return {
        prompt: `For $${sinusoidTex(A, B, C, D)}$, what is ${words[ask]}?`,
        answer:
          ask === 'period'
            ? { kind: 'expression', tex: piTex(2, B) }
            : { kind: 'number', value: f[ask] },
        hints: [
          'In $y = A\\sin(B(x - C)) + D$, the amplitude is $\\lvert A \\rvert$, the period $\\frac{2\\pi}{\\lvert B \\rvert}$, and the midline $y = D$.',
        ],
        solution: [
          ask === 'period'
            ? `$\\frac{2\\pi}{${B}} = ${piTex(2, B)}$.`
            : ask === 'amplitude'
              ? `$\\lvert ${A} \\rvert = ${f.amplitude}$.`
              : `The wave runs between $D - \\lvert A \\rvert = ${f.min}$ and $D + \\lvert A \\rvert = ${f.max}$, so the ${ask === 'max' ? 'maximum' : 'minimum'} is $${f[ask]}$.`,
        ],
        data: { A, B, C, D, ask: ['amplitude', 'period', 'max', 'min'].indexOf(ask) },
      }
    },
  },
  {
    id: 'addition-formula',
    title: 'Sine or cosine of a sum',
    skills: ['trig-identities'],
    difficulty: 2,
    generate: (rng) => {
      // Two first-quadrant angles from different triples.
      const [t1, t2] = rng.shuffle(TRIPLES).slice(0, 2) as [
        (typeof TRIPLES)[number],
        (typeof TRIPLES)[number],
      ]
      const [ca, sa, ha] = [t1[1], t1[0], t1[2]]
      const [cb, sb, hb] = [t2[0], t2[1], t2[2]]
      const fn = rng.pick(['sin', 'cos'] as const)
      const op = rng.pick(['+', '-'] as const)
      const sign = op === '+' ? 1 : -1
      const num = fn === 'sin' ? sa * cb + sign * ca * sb : ca * cb - sign * sa * sb
      const formula =
        fn === 'sin'
          ? `\\sin\\alpha\\cos\\beta ${op} \\cos\\alpha\\sin\\beta`
          : `\\cos\\alpha\\cos\\beta ${op === '+' ? '-' : '+'} \\sin\\alpha\\sin\\beta`
      const products =
        fn === 'sin'
          ? `${frac(sa, ha)} \\cdot ${frac(cb, hb)} ${op} ${frac(ca, ha)} \\cdot ${frac(sb, hb)}`
          : `${frac(ca, ha)} \\cdot ${frac(cb, hb)} ${op === '+' ? '-' : '+'} ${frac(sa, ha)} \\cdot ${frac(sb, hb)}`
      return {
        prompt: `Angles $\\alpha$ and $\\beta$ are between $0$ and $\\frac{\\pi}{2}$, with $\\sin\\alpha = ${frac(sa, ha)}$ and $\\cos\\beta = ${frac(cb, hb)}$. Find $\\${fn}(\\alpha ${op} \\beta)$.`,
        answer: { kind: 'number', value: num / (ha * hb) },
        hints: [
          'Find $\\cos\\alpha$ and $\\sin\\beta$ first; both are positive in the first quadrant.',
          `$\\${fn}(\\alpha ${op} \\beta) = ${formula}$.`,
        ],
        solution: [
          `$\\cos\\alpha = ${frac(ca, ha)}$ and $\\sin\\beta = ${frac(sb, hb)}$.`,
          `$\\${fn}(\\alpha ${op} \\beta) = ${products} = ${frac(num, ha * hb)}$.`,
        ],
        data: { sa, ha, cb, hb, fn: fn === 'sin' ? 0 : 1, sign },
      }
    },
  },
  {
    id: 'double-angle',
    title: 'Double angles',
    skills: ['trig-identities'],
    difficulty: 2,
    generate: (rng) => {
      const { x, y, h, q } = angleFromTriple(rng)
      const ask = rng.pick(['sin', 'cos'] as const)
      const value = ask === 'sin' ? (2 * x * y) / (h * h) : (x * x - y * y) / (h * h)
      return {
        prompt: `Given $\\sin\\theta = ${frac(y, h)}$ and $${QUADRANT_TEX[q - 1]}$, find $\\${ask} 2\\theta$.`,
        answer: { kind: 'number', value },
        hints: [
          'Find $\\cos\\theta$ from $\\sin^2\\theta + \\cos^2\\theta = 1$ and the quadrant.',
          ask === 'sin'
            ? '$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.'
            : '$\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$, or $1 - 2\\sin^2\\theta$, which needs no cosine.',
        ],
        solution: [
          `In quadrant ${q}, $\\cos\\theta = ${frac(x, h)}$.`,
          ask === 'sin'
            ? `$\\sin 2\\theta = 2 \\cdot ${frac(y, h)} \\cdot ${frac(x, h)} = ${frac(2 * x * y, h * h)}$.`
            : `$\\cos 2\\theta = 1 - 2 \\cdot ${frac(y * y, h * h)} = ${frac(x * x - y * y, h * h)}$.`,
        ],
        data: { x, y, h, ask: ask === 'sin' ? 0 : 1 },
      }
    },
  },
  {
    id: 'inverse-value',
    title: 'Inverse trigonometric values',
    skills: ['inverse-trig'],
    difficulty: 2,
    generate: (rng) => {
      if (rng.int(0, 3) === 0) {
        // arcsin(sin θ) or arccos(cos θ) with θ outside the principal range.
        const fn = rng.pick(['sin', 'cos'] as const)
        const n = fn === 'sin' ? rng.pick([4, 5, 7, 8, 10, 11]) : rng.pick([7, 8, 9, 10, 11])
        const theta = (n * Math.PI) / 6
        const value = fn === 'sin' ? Math.asin(Math.sin(theta)) : Math.acos(Math.cos(theta))
        const inner = exactTex(fn === 'sin' ? Math.sin(theta) : Math.cos(theta))!
        const out = Math.round((value * 6) / Math.PI)
        return {
          prompt: `Find $\\arc${fn}\\left(\\${fn} ${piTex(n, 6)}\\right)$.`,
          answer: { kind: 'expression', tex: piTex(out, 6) },
          hints: [
            fn === 'sin'
              ? '$\\arcsin$ returns an angle in $\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$.'
              : '$\\arccos$ returns an angle in $[0, \\pi]$.',
            'Evaluate the inside first.',
          ],
          solution: [
            `$\\${fn} ${piTex(n, 6)} = ${inner}$, and the angle in the range of $\\arc${fn}$ with that value is $${piTex(out, 6)}$.`,
            `So the result is $${piTex(out, 6)}$, not $${piTex(n, 6)}$.`,
          ],
          data: { fn: fn === 'sin' ? 0 : 1, theta, c: 0, nested: 1 },
        }
      }
      const fn = rng.pick(['sin', 'cos', 'tan'] as const)
      const pool: readonly (readonly [number, string])[] =
        fn === 'tan'
          ? [
              [0, '0'],
              [1, '1'],
              [-1, '-1'],
              [Math.sqrt(3), '\\sqrt{3}'],
              [-Math.sqrt(3), '-\\sqrt{3}'],
              [Math.sqrt(3) / 3, '\\frac{\\sqrt{3}}{3}'],
              [-Math.sqrt(3) / 3, '-\\frac{\\sqrt{3}}{3}'],
            ]
          : SPECIAL_C
      const [c, cTex] = rng.pick(pool)
      const value = fn === 'sin' ? Math.asin(c) : fn === 'cos' ? Math.acos(c) : Math.atan(c)
      const k = Math.round((value * 12) / Math.PI)
      return {
        prompt: `Find $\\arc${fn} ${cTex.startsWith('-') ? `\\left(${cTex}\\right)` : cTex}$.`,
        answer: { kind: 'expression', tex: piTex(k, 12) },
        hints: [
          fn === 'cos'
            ? '$\\arccos$ returns the angle in $[0, \\pi]$ with that cosine.'
            : `$\\arc${fn}$ returns the angle between $-\\frac{\\pi}{2}$ and $\\frac{\\pi}{2}$ with that ${fn === 'sin' ? 'sine' : 'tangent'}.`,
        ],
        solution: [
          `$\\${fn} ${piTex(k, 12)} = ${cTex}$, and $${piTex(k, 12)}$ is in the range, so the answer is $${piTex(k, 12)}$.`,
        ],
        data: { fn: ['sin', 'cos', 'tan'].indexOf(fn), theta: 0, c, nested: 0 },
      }
    },
  },
  {
    id: 'solve-equation',
    title: 'Solving in one turn',
    skills: ['inverse-trig', 'unit-circle'],
    difficulty: 2,
    generate: (rng) => {
      const fn = rng.pick(['sin', 'cos'] as const)
      const [c, cTex] = rng.pick(SPECIAL_C)
      const values = solveInTurn(fn, c)
      const ks = values.map((v) => Math.round((v * 12) / Math.PI))
      const first = fn === 'sin' ? Math.asin(c) : Math.acos(c)
      return {
        prompt: `Find every $x$ with $0 \\leq x < 2\\pi$ and $\\${fn} x = ${cTex}$.`,
        answer: { kind: 'list', values, tolerance: 1e-5 },
        hints: [
          `One solution is $\\arc${fn} ${cTex.startsWith('-') ? `\\left(${cTex}\\right)` : cTex}$.`,
          fn === 'sin'
            ? 'The point with the same height is reflected across the $y$-axis: $\\pi - x$.'
            : 'The point with the same horizontal coordinate is reflected across the $x$-axis: $-x$, or $2\\pi - x$.',
        ],
        solution: [
          `$\\arc${fn} ${cTex.startsWith('-') ? `\\left(${cTex}\\right)` : cTex} = ${piTex(Math.round((first * 12) / Math.PI), 12)}$.`,
          values.length === 1
            ? `The two reflections meet in one point, so the only solution in one turn is $${piTex(ks[0]!, 12)}$.`
            : `Moving both solutions into $[0, 2\\pi)$: $x = ${ks.map((k) => piTex(k, 12)).join('$ and $x = ')}$.`,
        ],
        data: { fn: fn === 'sin' ? 0 : 1, c },
      }
    },
  },
])
