import type { VecN } from './vector'

/**
 * Matrices of any shape as rows of numbers: `[[1, 2, 3], [4, 5, 6]]` is 2 x 3. `mat2.ts` keeps the
 * 2x2 column form that drawing code uses.
 */
export type MatN = readonly (readonly number[])[]

export const rowsOf = (a: MatN) => a.length
export const colsOf = (a: MatN) => a[0]?.length ?? 0

/** The n x n identity matrix. */
export const identityN = (n: number): number[][] =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))

/** Column j as a vector. */
export const column = (a: MatN, j: number): number[] => a.map((row) => row[j]!)

/** A matrix from its columns: `fromColumns([1, 3], [2, 4])` is [[1, 2], [3, 4]]. */
export const fromColumns = (...cols: readonly VecN[]): number[][] =>
  Array.from({ length: cols[0]?.length ?? 0 }, (_, i) => cols.map((c) => c[i]!))

export const transpose = (a: MatN): number[][] =>
  Array.from({ length: colsOf(a) }, (_, j) => column(a, j))

/** A x, the combination of the columns of A with the components of x as weights. */
export const matVec = (a: MatN, x: VecN): number[] => {
  if (colsOf(a) !== x.length)
    throw new Error(`Shapes do not match: ${rowsOf(a)}x${colsOf(a)} times ${x.length}`)
  return a.map((row) => row.reduce((s, v, j) => s + v * x[j]!, 0))
}

/** A B: column j of the product is A times column j of B. */
export const matMul = (a: MatN, b: MatN): number[][] => {
  if (colsOf(a) !== rowsOf(b))
    throw new Error(
      `Shapes do not match: ${rowsOf(a)}x${colsOf(a)} times ${rowsOf(b)}x${colsOf(b)}`,
    )
  return transpose(Array.from({ length: colsOf(b) }, (_, j) => matVec(a, column(b, j))))
}

/** A^k for a square A and a whole k >= 0. */
export const matPow = (a: MatN, k: number): number[][] => {
  if (!Number.isInteger(k) || k < 0) throw new Error(`Not a whole power: ${k}`)
  let out = identityN(rowsOf(a))
  for (let i = 0; i < k; i++) out = matMul(out, a)
  return out
}

/** A rational number p / q with q > 0, in lowest terms, on safe integers. */
type Frac = readonly [number, number]

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

const reduce = (p: number, q: number): Frac => {
  if (p === 0) return [0, 1]
  const g = gcd(p, q) * Math.sign(q)
  return [p / g, q / g]
}

/** An entry as an exact fraction: integers and decimals with up to six places, or p/q with q <= 1000. */
const toFrac = (v: number): Frac => {
  for (let q = 1; q <= 1000; q++) {
    const p = Math.round(v * q)
    if (Math.abs(p / q - v) < 1e-12 * Math.max(1, Math.abs(v))) return reduce(p, q)
  }
  const q = 1e6
  return reduce(Math.round(v * q), q)
}

const sub = (a: Frac, b: Frac): Frac => reduce(a[0] * b[1] - b[0] * a[1], a[1] * b[1])
const mul = (a: Frac, b: Frac): Frac => reduce(a[0] * b[0], a[1] * b[1])
const div = (a: Frac, b: Frac): Frac => reduce(a[0] * b[1], a[1] * b[0])

/**
 * The rank: the number of independent columns, which is the dimension of the image. Computed by
 * elimination on exact fractions, so a dependence such as a column equal to the sum of two others
 * is found exactly, never lost to rounding.
 */
export const rank = (a: MatN): number => {
  const m = a.map((row) => row.map(toFrac))
  let r = 0
  for (let c = 0; c < colsOf(a) && r < m.length; c++) {
    const pivot = m.findIndex((row, i) => i >= r && row[c]![0] !== 0)
    if (pivot < 0) continue
    ;[m[r], m[pivot]] = [m[pivot]!, m[r]!]
    for (let i = r + 1; i < m.length; i++) {
      const f = div(m[i]![c]!, m[r]![c]!)
      m[i] = m[i]!.map((x, j) => sub(x, mul(f, m[r]![j]!)))
    }
    r++
  }
  return r
}

/** Whether two matrices have the same shape and entries, up to a small tolerance. */
export const sameMatN = (a: MatN, b: MatN, eps = 1e-9) =>
  rowsOf(a) === rowsOf(b) &&
  colsOf(a) === colsOf(b) &&
  a.every((row, i) => row.every((v, j) => Math.abs(v - b[i]![j]!) < eps))
