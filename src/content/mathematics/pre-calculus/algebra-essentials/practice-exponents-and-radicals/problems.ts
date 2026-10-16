import { defineProblems, tex, type Rng } from '@/lib/practice'

const { frac, paren } = tex

/** Square-free radicands, so k√r is in simplest form. */
const SQUARE_FREE = [2, 3, 5, 6, 7, 10] as const

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** k√r as TeX: 3\sqrt{2}, \sqrt{2}, 4. */
export const radical = (k: number, r: number) =>
  r === 1 ? String(k) : k === 1 ? `\\sqrt{${r}}` : `${k}\\sqrt{${r}}`

/** A power of x as TeX, with negative exponents braced: x^{-3}, x. */
const xp = (e: number, v = 'x') => (e === 1 ? v : `${v}^{${e}}`)

/** Choice options for a simplest radical form: the answer plus distinct distractors. */
const radicalOptions = (rng: Rng, correct: string, distractors: readonly string[]) => {
  const unique = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3)
  const options = rng.shuffle([`$${correct}$`, ...unique.map((d) => `$${d}$`)])
  return { kind: 'choice' as const, options, correct: options.indexOf(`$${correct}$`) }
}

export const problems = defineProblems([
  {
    id: 'exponent-laws',
    title: 'Combine powers',
    skills: ['exponents'],
    difficulty: 1,
    generate: (rng) => {
      const p = rng.nonZeroInt(-3, 6)
      const q = rng.nonZeroInt(-3, 6)
      const r = rng.nonZeroInt(-4, 6)
      const n = p + q - r
      return {
        prompt: `Write $\\dfrac{${xp(p)} \\cdot ${xp(q)}}{${xp(r)}}$ as a single power $x^n$. What is $n$?`,
        answer: { kind: 'number', value: n },
        hints: [
          'Multiplying powers of the same base adds the exponents.',
          'Dividing subtracts the exponent of the denominator. Watch the signs of negative exponents.',
        ],
        solution: [
          `Numerator: $${xp(p)} \\cdot ${xp(q)} = x^{${p} + ${paren(q)}} = ${xp(p + q)}$.`,
          `Quotient: $\\dfrac{${xp(p + q)}}{${xp(r)}} = x^{${p + q} - ${paren(r)}} = ${xp(n)}$.`,
          `So $n = ${n}$.`,
        ],
        data: { p, q, r },
      }
    },
  },
  {
    id: 'power-rules',
    title: 'Powers of products',
    skills: ['exponents'],
    difficulty: 2,
    generate: (rng) => {
      const p = rng.nonZeroInt(-3, 4)
      const k = rng.pick([-2, 2, 3])
      const r = rng.nonZeroInt(-3, 5)
      const s = rng.int(1, 4)
      const m = p * k - r
      const n = k - s
      return {
        prompt: `Simplify $\\dfrac{(${xp(p)}\\, y)^{${k}}}{${xp(r)}\\, ${xp(s, 'y')}}$ to the form $x^m y^n$. What is $m$?`,
        answer: { kind: 'number', value: m },
        hints: [
          'A power of a product is the product of the powers: $(ab)^k = a^k b^k$.',
          'A power of a power multiplies the exponents: $(x^p)^k = x^{pk}$.',
        ],
        solution: [
          `$(${xp(p)}\\, y)^{${k}} = ${xp(p * k)}\\, ${xp(k, 'y')}$.`,
          `Divide: $x^{${p * k} - ${paren(r)}}\\, y^{${k} - ${s}} = ${xp(m)}\\, ${xp(n, 'y')}$.`,
          `So $m = ${m}$ (and $n = ${n}$).`,
        ],
        data: { p, k, r, s },
      }
    },
  },
  {
    id: 'negative-zero',
    title: 'Zero and negative exponents',
    skills: ['exponents'],
    difficulty: 1,
    generate: (rng) => {
      let p = 1
      let q = 1
      while (p === q || gcd(p, q) !== 1) {
        p = rng.int(1, 4)
        q = rng.int(2, 5)
      }
      const n = rng.int(1, p === 1 || q === 5 ? 2 : 3)
      const c = rng.nonZeroInt(-9, 9)
      const flipped = `\\left(${frac(q, p)}\\right)^{${n}}`
      return {
        prompt: `Evaluate $\\left(${frac(p, q)}\\right)^{-${n}} - ${paren(c)}^{0}$.`,
        answer: { kind: 'number', value: (q / p) ** n - 1 },
        hints: [
          'A negative exponent takes the reciprocal: $\\left(\\frac{p}{q}\\right)^{-n} = \\left(\\frac{q}{p}\\right)^n$.',
          'Any nonzero number to the power $0$ is $1$.',
        ],
        solution: [
          `$\\left(${frac(p, q)}\\right)^{-${n}} = ${flipped} = ${frac(q ** n, p ** n)}$.`,
          `$${paren(c)}^{0} = 1$.`,
          `$${frac(q ** n, p ** n)} - 1 = ${frac(q ** n - p ** n, p ** n)}$.`,
        ],
        data: { p, q, n, c },
      }
    },
  },
  {
    id: 'rational-exponent',
    title: 'Rational exponents',
    skills: ['radicals', 'exponents'],
    difficulty: 2,
    generate: (rng) => {
      const q = rng.pick([2, 3, 4])
      const r = q === 2 ? rng.int(2, 9) : q === 3 ? rng.int(2, 5) : rng.int(2, 3)
      const p = rng.pick([1, 2, 3].filter((v) => gcd(v, q) === 1 && r ** v <= 125))
      const negative = rng.int(1, 3) === 1
      const b = r ** q
      const e = negative ? `-${p}/${q}` : `${p}/${q}`
      const value = negative ? 1 / r ** p : r ** p
      const root = q === 2 ? `\\sqrt{${b}}` : `\\sqrt[${q}]{${b}}`
      return {
        prompt: `Evaluate $${b}^{${e}}$.`,
        answer: { kind: 'number', value },
        hints: [
          `$a^{p/q} = \\left(\\sqrt[q]{a}\\right)^p$: take the root first, then the power.`,
          ...(negative ? ['The minus sign in the exponent means a reciprocal.'] : []),
        ],
        solution: [
          `$${root} = ${r}$, because $${r}^{${q}} = ${b}$.`,
          `$${b}^{${p}/${q}} = ${r}^{${p}} = ${r ** p}$.`,
          ...(negative ? [`$${b}^{${e}} = \\dfrac{1}{${r ** p}}$.`] : []),
        ],
        data: { b, p, q, sign: negative ? -1 : 1 },
      }
    },
  },
  {
    id: 'simplify-radical',
    title: 'Simplest radical form',
    skills: ['radicals'],
    difficulty: 1,
    generate: (rng) => {
      const k = rng.int(2, 6)
      const r = rng.pick(SQUARE_FREE.filter((v) => v !== k))
      const n = k * k * r
      const correct = radical(k, r)
      // A composite k leaves an unfinished but equal form, such as 3√8 for √72.
      const unfinished = k === 4 ? radical(2, 4 * r) : k === 6 ? radical(3, 4 * r) : null
      return {
        prompt: `Which is the simplest radical form of $\\sqrt{${n}}$?`,
        answer: radicalOptions(rng, correct, [
          unfinished ?? radical(k + 1, r),
          radical(r, k),
          radical(k * k, r),
        ]),
        hints: [
          `Find the largest perfect square that divides $${n}$.`,
          'Simplest form has no square factor left under the root.',
        ],
        solution: [
          `$${n} = ${k * k} \\cdot ${r}$, and $${k * k}$ is the largest square factor.`,
          `$\\sqrt{${n}} = \\sqrt{${k * k}}\\,\\sqrt{${r}} = ${correct}$.`,
        ],
        data: { n },
      }
    },
  },
  {
    id: 'multiply-radicals',
    title: 'Multiply radicals',
    skills: ['radicals'],
    difficulty: 2,
    generate: (rng) => {
      const s = rng.pick([2, 3, 5, 6])
      const [u, v] = rng.shuffle([1, 2, 3, 5, 7]).slice(0, 2) as [number, number]
      const a = s * u
      const b = s * v
      const correct = radical(s, u * v)
      return {
        prompt: `Simplify $\\sqrt{${a}} \\cdot \\sqrt{${b}}$.`,
        answer: radicalOptions(rng, correct, [
          radical(1, a * b),
          radical(s * s, u * v),
          radical(s, u + v),
          radical(s + 1, u * v),
        ]),
        hints: [
          'Multiply under one root: $\\sqrt{a}\\,\\sqrt{b} = \\sqrt{ab}$.',
          `Then take out the largest square factor of $${a * b}$.`,
        ],
        solution: [
          `$\\sqrt{${a}} \\cdot \\sqrt{${b}} = \\sqrt{${a * b}}$.`,
          `$${a * b} = ${s * s} \\cdot ${u * v}$, so $\\sqrt{${a * b}} = ${correct}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'rationalize',
    title: 'Rationalize a denominator',
    skills: ['radicals'],
    difficulty: 2,
    generate: (rng) => {
      const b = rng.pick([2, 3, 5, 6, 7])
      const a = rng.int(2, 12)
      const g = gcd(a, b)
      const correct = g === b ? radical(a / b, b) : `\\frac{${radical(a / g, b)}}{${b / g}}`
      return {
        prompt: `Rationalize the denominator of $\\dfrac{${a}}{\\sqrt{${b}}}$ and simplify.`,
        answer: radicalOptions(rng, correct, [
          radical(a, b),
          frac(a, b),
          `\\frac{\\sqrt{${b}}}{${a}}`,
        ]),
        hints: [
          `Multiply the numerator and the denominator by $\\sqrt{${b}}$.`,
          `$\\sqrt{${b}} \\cdot \\sqrt{${b}} = ${b}$. Then reduce the fraction.`,
        ],
        solution: [
          `$\\dfrac{${a}}{\\sqrt{${b}}} \\cdot \\dfrac{\\sqrt{${b}}}{\\sqrt{${b}}} = \\dfrac{${radical(a, b)}}{${b}}$.`,
          g === 1
            ? `The fraction does not reduce: $${correct}$.`
            : `Divide the numerator and the denominator by $${g}$: $${correct}$.`,
        ],
        data: { a, b },
      }
    },
  },
  {
    id: 'add-radicals',
    title: 'Add radicals',
    skills: ['radicals'],
    difficulty: 3,
    generate: (rng) => {
      const r = rng.pick([2, 3, 5, 6, 7])
      const m1 = rng.int(1, 5)
      const m2 = rng.int(2, 5)
      const c1 = rng.int(1, 3)
      const c2 = rng.int(1, 3)
      const sign = rng.pick([1, -1])
      const k = c1 * m1 + sign * c2 * m2
      const t1 = `${c1 === 1 ? '' : c1}\\sqrt{${m1 * m1 * r}}`
      const t2 = `${c2 === 1 ? '' : c2}\\sqrt{${m2 * m2 * r}}`
      const op = sign > 0 ? '+' : '-'
      return {
        prompt: `Write $${t1} ${op} ${t2}$ in the form $k\\sqrt{${r}}$. What is $k$?`,
        answer: { kind: 'number', value: k },
        hints: [
          `Simplify each root by taking out a square factor, so both become multiples of $\\sqrt{${r}}$.`,
          'Then combine like terms, as with $2x + 3x = 5x$.',
        ],
        solution: [
          `$\\sqrt{${m1 * m1 * r}} = ${radical(m1, r)}$ and $\\sqrt{${m2 * m2 * r}} = ${radical(m2, r)}$.`,
          `$${c1 * m1}\\sqrt{${r}} ${op} ${c2 * m2}\\sqrt{${r}} = ${k}\\sqrt{${r}}$.`,
          `So $k = ${k}$.`,
        ],
        data: { r, m1, m2, c1, c2, sign },
      }
    },
  },
])
