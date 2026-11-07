import { simplifySqrt } from '../math/vector'

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

/**
 * A number as TeX: a reduced fraction when it is close to one with a denominator up to `maxDen`
 * (0.75 -> '\\frac{3}{4}'), otherwise a decimal with at most two places.
 */
export const num = (v: number, maxDen = 16) => {
  for (let q = 1; q <= maxDen; q++) {
    const p = Math.round(v * q)
    if (Math.abs(p / q - v) < 1e-9) return frac(p, q)
  }
  return String(+v.toFixed(2))
}

/** A vector as TeX in parentheses, each component through `num`: '(1, -\\frac{1}{2}, 3)'. */
export const vector = (values: readonly number[], maxDen = 16) =>
  `(${values.map((v) => num(v, maxDen)).join(', ')})`

/** A matrix as TeX, row by row, each entry through `num`. */
export const bmatrix = (rows: readonly (readonly number[])[], maxDen = 16) =>
  `\\begin{bmatrix} ${rows.map((r) => r.map((v) => num(v, maxDen)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`

/** The square root of a whole number in simplest form: 12 -> '2\\sqrt{3}', 9 -> '3'. */
export const root = (n: number) => {
  const [outside, inside] = simplifySqrt(n)
  if (inside === 0) return '0'
  if (inside === 1) return String(outside)
  return `${outside === 1 ? '' : outside}\\sqrt{${inside}}`
}

/** A number after a term: ' + 3', ' - \\frac{1}{2}', or '' for zero. */
export const signed = (v: number, maxDen = 16) => {
  const t = num(Math.abs(v), maxDen)
  if (t === '0') return ''
  return v < 0 ? ` - ${t}` : ` + ${t}`
}

/** Identifiers and SQL in a monospace font, with the characters TeX reserves escaped. */
export const code = (s: string) => `\\texttt{${s.replace(/[_{}%&#]/g, (c) => `\\${c}`)}}`

type Cell = string | number | null

const cell = (v: Cell) =>
  v === null ? '\\textit{NULL}' : typeof v === 'number' ? String(v) : `\\text{${v}}`

/** A small database table as a TeX array: column names in code font, NULL in italics. */
export const table = (
  columns: readonly string[],
  rows: readonly (readonly Cell[])[],
  title?: string,
) => {
  const head = columns.map(code).join(' & ')
  const body = rows.map((r) => `${r.map(cell).join(' & ')} \\\\`).join(' ')
  const grid = `\\begin{array}{${'c'.repeat(columns.length)}} ${head} \\\\ \\hline ${body} \\end{array}`
  return title ? `\\begin{array}{c} ${code(title)} \\\\ ${grid} \\end{array}` : grid
}

interface TableSpec {
  columns: readonly string[]
  rows: readonly (readonly Cell[])[]
  title?: string
}

/** Tables side by side, padded with empty rows to the same height so their headers line up. */
export const tables = (...specs: readonly TableSpec[]) => {
  const height = Math.max(...specs.map((s) => s.rows.length))
  return specs
    .map((s) =>
      table(
        s.columns,
        [
          ...s.rows,
          ...Array.from({ length: height - s.rows.length }, () => s.columns.map(() => '')),
        ],
        s.title,
      ),
    )
    .join(' \\qquad ')
}

const SQRT3_2 = Math.sqrt(3) / 2

/**
 * A number as TeX that also knows the cosines and sines of the special angles:
 * 0.866... -> '\\frac{\\sqrt{3}}{2}', 0.707... -> '\\frac{\\sqrt{2}}{2}', else as `num`.
 */
export const trig = (v: number) => {
  if (Math.abs(v - SQRT3_2) < 1e-9) return '\\frac{\\sqrt{3}}{2}'
  if (Math.abs(v + SQRT3_2) < 1e-9) return '-\\frac{\\sqrt{3}}{2}'
  if (Math.abs(v - Math.SQRT1_2) < 1e-9) return '\\frac{\\sqrt{2}}{2}'
  if (Math.abs(v + Math.SQRT1_2) < 1e-9) return '-\\frac{\\sqrt{2}}{2}'
  return num(v)
}

/** A matrix as TeX with `trig` entries, for rotations by special angles. */
export const trigMatrix = (rows: readonly (readonly number[])[]) =>
  `\\begin{bmatrix} ${rows.map((r) => r.map(trig).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`

/** Entries within 1e-12 of a whole number rounded there (cos 90° is 6e-17), and -0 made 0. */
export const cleanMatrix = (a: readonly (readonly number[])[]) =>
  a.map((r) => r.map((v) => (Math.abs(v - Math.round(v)) < 1e-12 ? Math.round(v) + 0 : v)))
