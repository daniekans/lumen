import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, poly, sum } = tex

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** ax + b as TeX: x + 3, 2x - 1. */
const linear = (a: number, b: number) =>
  sum([
    [a, 'x'],
    [b, ''],
  ])

/** A factored quadratic (a1 x + b1)(a2 x + b2), as a tuple. */
type Factored = readonly [number, number, number, number]

/** Coefficients of the expanded product, highest degree first. */
export const expand = ([a1, b1, a2, b2]: Factored) => [a1 * a2, a1 * b2 + b1 * a2, b1 * b2] as const

/** A repeated factor is written as a square. */
const factoredTex = ([a1, b1, a2, b2]: Factored) =>
  a1 === a2 && b1 === b2 ? `(${linear(a1, b1)})^2` : `(${linear(a1, b1)})(${linear(a2, b2)})`

const same = (u: readonly number[], v: readonly number[]) => u.every((c, i) => c === v[i])

/**
 * Choice options for a factorization: the answer plus up to three distractors whose products differ
 * from it, so exactly one option is equal to the polynomial.
 */
const factorOptions = (rng: Rng, correct: Factored, distractors: readonly Factored[]) => {
  const target = expand(correct)
  const texts = distractors.filter((d) => !same(expand(d), target)).map(factoredTex)
  const unique = [...new Set(texts)].slice(0, 3)
  const right = `$${factoredTex(correct)}$`
  const options = rng.shuffle([right, ...unique.map((d) => `$${d}$`)])
  return { kind: 'choice' as const, options, correct: options.indexOf(right) }
}

/** Distinct nonzero integers in [lo, hi]. */
const distinct = (rng: Rng, n: number, lo: number, hi: number) => {
  const out: number[] = []
  while (out.length < n) {
    const v = rng.nonZeroInt(lo, hi)
    if (!out.includes(v)) out.push(v)
  }
  return out
}

export const problems = defineProblems([
  {
    id: 'common-factor',
    title: 'Take out a common factor',
    skills: ['factor'],
    difficulty: 1,
    generate: (rng) => {
      const g = rng.int(2, 6)
      let a = 1
      let b = 1
      while (gcd(a, b) !== 1 || a === b) {
        a = rng.int(1, 4)
        b = rng.nonZeroInt(-7, 7)
      }
      const inner = linear(a, b)
      const correct = `${g}x(${inner})`
      const options = rng.shuffle([
        `$${correct}$`,
        `$${g}(${poly([a, b, 0])})$`,
        `$x(${linear(g * a, g * b)})$`,
        `$${g}x(${linear(a, -b)})$`,
      ])
      return {
        prompt: `Factor $${poly([g * a, g * b, 0])}$ completely.`,
        answer: { kind: 'choice', options, correct: options.indexOf(`$${correct}$`) },
        hints: [
          `Both terms share a number and a power of $x$.`,
          `The greatest common factor of $${g * a}$ and $${Math.abs(g * b)}$ is $${g}$.`,
        ],
        solution: [
          `The greatest common factor of the terms is $${g}x$.`,
          `$${poly([g * a, g * b, 0])} = ${g}x \\cdot ${a === 1 ? '' : a}x ${g * b < 0 ? '-' : '+'} ${g}x \\cdot ${Math.abs(b)} = ${correct}$.`,
          'The other choices that are equal still leave a common factor inside the parentheses.',
        ],
        data: { g, a, b },
      }
    },
  },
  {
    id: 'trinomial',
    title: 'Factor a trinomial',
    skills: ['factor'],
    difficulty: 1,
    generate: (rng) => {
      let [p, q] = [0, 0]
      while (p + q === 0) [p, q] = [rng.nonZeroInt(-7, 7), rng.nonZeroInt(-7, 7)]
      ;[p, q] = [Math.min(p, q), Math.max(p, q)]
      const c = p * q
      const b = p + q
      // Another factor pair of c, which has the right product but the wrong sum.
      const other = [1, 2, 3, 4, 6]
        .filter((d) => c % d === 0)
        .map((d) => [Math.sign(c) * d, c / (Math.sign(c) * d)] as const)
        .find(([u, v]) => u + v !== b && !(u === p && v === q))
      return {
        prompt: `Factor $${poly([1, b, c])}$.`,
        answer: factorOptions(
          rng,
          [1, p, 1, q],
          [
            [1, -p, 1, -q],
            [1, p, 1, -q],
            ...(other ? [[1, other[0], 1, other[1]] as const] : []),
            [1, -p, 1, q],
          ],
        ),
        hints: [
          `Find two numbers whose product is $${c}$ and whose sum is $${b}$.`,
          c > 0
            ? 'A positive product means both numbers have the same sign as their sum.'
            : 'A negative product means the numbers have opposite signs.',
        ],
        solution: [
          `$${p} \\cdot ${q < 0 ? `(${q})` : q} = ${c}$ and $${p} + ${q < 0 ? `(${q})` : q} = ${b}$.`,
          `So $${poly([1, b, c])} = ${factoredTex([1, p, 1, q])}$.`,
        ],
        data: { p, q },
      }
    },
  },
  {
    id: 'leading-coefficient',
    title: 'Leading coefficient other than 1',
    skills: ['factor'],
    difficulty: 3,
    generate: (rng) => {
      let a: number, p: number, q: number
      do {
        a = rng.pick([2, 3])
        p = rng.nonZeroInt(-5, 5)
        q = rng.nonZeroInt(-5, 5)
      } while (gcd(a, p) !== 1 || a * q + p === 0)
      const coeffs = expand([a, p, 1, q])
      return {
        prompt: `Factor $${poly(coeffs)}$.`,
        answer: factorOptions(
          rng,
          [a, p, 1, q],
          [
            [a, q, 1, p],
            [a, -p, 1, -q],
            [a, -q, 1, -p],
            [a, p, 1, -q],
          ],
        ),
        hints: [
          `The factors look like $(${a}x + m)(x + n)$ with $mn = ${coeffs[2]}$.`,
          `Multiply each candidate back: the middle coefficient must be $${a}n + m = ${coeffs[1]}$.`,
        ],
        solution: [
          `Try $m = ${p}$ and $n = ${q}$: $mn = ${coeffs[2]}$ and $${a} \\cdot ${q < 0 ? `(${q})` : q} + ${p < 0 ? `(${p})` : p} = ${coeffs[1]}$.`,
          `So $${poly(coeffs)} = ${factoredTex([a, p, 1, q])}$.`,
        ],
        data: { a, p, q },
      }
    },
  },
  {
    id: 'difference-of-squares',
    title: 'Difference of squares',
    skills: ['factor'],
    difficulty: 1,
    generate: (rng) => {
      let a: number, b: number
      do {
        a = rng.int(1, 3)
        b = rng.int(1, 9)
      } while (gcd(a, b) !== 1)
      return {
        prompt: `Factor $${poly([a * a, 0, -b * b])}$.`,
        answer: factorOptions(
          rng,
          [a, b, a, -b],
          [
            [a, -b, a, -b],
            [a, b, a, b],
            [a, -b, 1, b * a],
            [a * a, -b, 1, b],
          ],
        ),
        hints: [
          'Both terms are perfect squares, and they are subtracted.',
          '$u^2 - v^2 = (u + v)(u - v)$.',
        ],
        solution: [
          `$${poly([a * a, 0, -b * b])} = (${a === 1 ? '' : a}x)^2 - ${b}^2$.`,
          `So it equals $${factoredTex([a, b, a, -b])}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'simplify-rational',
    title: 'Simplify a rational expression',
    skills: ['rational-expressions', 'factor'],
    difficulty: 2,
    generate: (rng) => {
      const [a, b, c] = distinct(rng, 3, -6, 6) as [number, number, number]
      const num = expand([1, a, 1, b])
      const den = expand([1, a, 1, c])
      const right = `$\\frac{${linear(1, b)}}{${linear(1, c)}}$`
      const options = rng.shuffle([
        right,
        `$\\frac{${linear(1, c)}}{${linear(1, b)}}$`,
        `$\\frac{${linear(1, a)}}{${linear(1, c)}}$`,
        `$${frac(num[2], den[2])}$`,
      ])
      return {
        prompt: `Simplify $\\dfrac{${poly(num)}}{${poly(den)}}$.`,
        answer: { kind: 'choice', options, correct: options.indexOf(right) },
        hints: [
          'Factor the numerator and the denominator.',
          'Cancel the factor they share. Terms of a sum never cancel.',
        ],
        solution: [
          `$\\dfrac{${poly(num)}}{${poly(den)}} = \\dfrac{(${linear(1, a)})(${linear(1, b)})}{(${linear(1, a)})(${linear(1, c)})}$.`,
          `Cancel $${linear(1, a)}$: ${right}, for $x \\neq ${-a}$ and $x \\neq ${-c}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'hole',
    title: 'Find the hole',
    skills: ['rational-expressions', 'factor'],
    difficulty: 2,
    generate: (rng) => {
      const [a, b, c] = distinct(rng, 3, -6, 6) as [number, number, number]
      const num = expand([1, a, 1, b])
      const den = expand([1, a, 1, c])
      const value = (b - a) / (c - a)
      return {
        prompt: `The graph of $f(x) = \\dfrac{${poly(num)}}{${poly(den)}}$ has a hole. What is the $y$-coordinate of the hole?`,
        answer: { kind: 'number', value },
        hints: [
          'Factor both parts. The hole is at the zero of the factor that cancels.',
          'Its $y$-coordinate is the value of the simplified expression there.',
        ],
        solution: [
          `$f(x) = \\dfrac{(${linear(1, a)})(${linear(1, b)})}{(${linear(1, a)})(${linear(1, c)})} = \\dfrac{${linear(1, b)}}{${linear(1, c)}}$ for $x \\neq ${-a}$.`,
          `The hole is at $x = ${-a}$, where the simplified form gives $\\dfrac{${-a} + ${b < 0 ? `(${b})` : b}}{${-a} + ${c < 0 ? `(${c})` : c}} = ${frac(b - a, c - a)}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'excluded-values',
    title: 'Excluded values',
    skills: ['rational-expressions'],
    difficulty: 2,
    generate: (rng) => {
      const [a, c] = distinct(rng, 2, -6, 6) as [number, number]
      const b = rng.pick([a, rng.nonZeroInt(-6, 6)])
      const den = expand([1, a, 1, c])
      return {
        prompt: `List every value of $x$ excluded from the domain of $\\dfrac{${linear(1, b)}}{${poly(den)}}$, separated by commas.`,
        answer: { kind: 'list', values: [-a, -c] },
        hints: [
          'Excluded values make the original denominator zero.',
          'A factor that cancels with the numerator is still excluded.',
        ],
        solution: [
          `$${poly(den)} = (${linear(1, a)})(${linear(1, c)})$.`,
          `It is zero at $x = ${-a}$ and $x = ${-c}$${b === a ? ', including the value whose factor cancels' : ''}.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'multiply-rational',
    title: 'Multiply rational expressions',
    skills: ['rational-expressions', 'factor'],
    difficulty: 2,
    generate: (rng) => {
      const [a, b, c] = distinct(rng, 3, -5, 5) as [number, number, number]
      const num = expand([1, b, 1, c])
      return {
        prompt: `Multiply and simplify: $\\dfrac{${poly(num)}}{${linear(1, a)}} \\cdot \\dfrac{${linear(1, a)}}{${linear(1, c)}}$. The result is a polynomial.`,
        answer: { kind: 'expression', tex: linear(1, b) },
        hints: [
          `Factor $${poly(num)}$.`,
          'Then cancel the factors that appear in a numerator and a denominator.',
        ],
        solution: [
          `$${poly(num)} = (${linear(1, b)})(${linear(1, c)})$.`,
          `The product is $\\dfrac{(${linear(1, b)})(${linear(1, c)})(${linear(1, a)})}{(${linear(1, a)})(${linear(1, c)})} = ${linear(1, b)}$, for $x \\neq ${-a}$ and $x \\neq ${-c}$.`,
        ],
        data: { a, b, c },
      }
    },
  },
  {
    id: 'add-rational',
    title: 'Add rational expressions',
    skills: ['rational-expressions'],
    difficulty: 3,
    generate: (rng) => {
      const [p, q] = distinct(rng, 2, -5, 5) as [number, number]
      const m = rng.nonZeroInt(-4, 5)
      const n = rng.nonZeroInt(-4, 5)
      const numerator = sum([
        [m + n, 'x'],
        [-(m * q + n * p), ''],
      ])
      const dp = linear(1, -p)
      const dq = linear(1, -q)
      const second = n < 0 ? `- \\dfrac{${-n}}{${dq}}` : `+ \\dfrac{${n}}{${dq}}`
      return {
        prompt: `Write $\\dfrac{${m}}{${dp}} ${second}$ as $\\dfrac{N(x)}{(${dp})(${dq})}$. What is $N(x)$?`,
        answer: { kind: 'expression', tex: numerator, ranges: { x: [-3, 3] } },
        hints: [
          `Multiply the first fraction by $\\frac{${dq}}{${dq}}$ and the second by $\\frac{${dp}}{${dp}}$.`,
          'Then add the numerators and collect like terms.',
        ],
        solution: [
          `$N(x) = ${m}(${dq}) ${n < 0 ? '-' : '+'} ${Math.abs(n)}(${dp})$.`,
          `$N(x) = ${numerator}$.`,
        ],
        data: { p, q, m, n },
      }
    },
  },
])
