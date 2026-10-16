/*
 * Helpers for writing TeX in problem generators, so prompts and solutions read naturally for any
 * generated coefficients (no "+ -3x", no "1x", no "0x^2").
 */

/** A coefficient times a term: (1, 'x') -> 'x', (-1, 'x') -> '-x', (3, 'x^2') -> '3x^2'. */
export const term = (c: number, t = '') => {
  if (t === '') return String(c)
  if (c === 1) return t
  if (c === -1) return `-${t}`
  return `${c}${t}`
}

/**
 * Joins signed terms into one expression: [[2, 'x^2'], [-3, 'x'], [1, '']] -> '2x^2 - 3x + 1'.
 * Zero terms are dropped; an empty result is '0'.
 */
export const sum = (terms: readonly (readonly [number, string])[]) => {
  const parts = terms.filter(([c]) => c !== 0)
  if (parts.length === 0) return '0'
  return parts
    .map(([c, t], i) => {
      const body = term(Math.abs(c), t)
      if (i === 0) return c < 0 ? `-${body}` : body
      return c < 0 ? ` - ${body}` : ` + ${body}`
    })
    .join('')
}

/** Polynomial from coefficients, highest degree first: [2, -3, 1] -> '2x^2 - 3x + 1'. */
export const poly = (coeffs: readonly number[], v = 'x') =>
  sum(
    coeffs.map((c, i) => {
      const d = coeffs.length - 1 - i
      return [c, d === 0 ? '' : d === 1 ? v : `${v}^{${d}}`] as const
    }),
  )

/** A number in parentheses when negative, for substitution: (-2) but 3. */
export const paren = (n: number) => (n < 0 ? `(${n})` : String(n))

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** Reduced fraction as TeX: (6, 4) -> '\\frac{3}{2}', (4, 2) -> '2', (-1, 3) -> '-\\frac{1}{3}'. */
export const frac = (p: number, q: number) => {
  if (q === 0) throw new Error('Zero denominator')
  const g = gcd(p, q) * Math.sign(q)
  const [n, d] = [p / g, q / g]
  if (d === 1) return String(n)
  return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
}
