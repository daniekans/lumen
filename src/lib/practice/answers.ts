/** What a correct answer looks like. Pure data, so problems can be generated and checked anywhere. */
export type Answer =
  | {
      kind: 'number'
      value: number
      /** Absolute tolerance. Defaults to a tiny relative tolerance (exact for practical purposes). */
      tolerance?: number
    }
  | {
      kind: 'expression'
      /** A correct answer in TeX. Any equivalent expression is accepted. */
      tex: string
      /** Sampling range for each variable. Defaults to [-3, 3]. */
      ranges?: Readonly<Record<string, readonly [number, number]>>
    }
  | {
      kind: 'list'
      /** Numbers in any order, e.g. the zeros of a polynomial. */
      values: readonly number[]
      tolerance?: number
    }
  | {
      kind: 'vector'
      /** Components in order, e.g. a vector written (3, -1) or as a column. */
      values: readonly number[]
      tolerance?: number
    }
  | { kind: 'choice'; options: readonly string[]; correct: number }
  /** For proofs and long work: the learner compares with the solution and grades themselves. */
  | { kind: 'self' }

export type Verdict = 'correct' | 'incorrect' | 'invalid'

/**
 * Why an answer could not be read (`invalid`), or a hint about the mistake. The UI turns it into
 * words, so this module stays free of copy.
 */
export type CheckIssue =
  | { kind: 'unreadable' }
  | { kind: 'not-a-number' }
  | { kind: 'undefined-value' }
  | { kind: 'list-format' }
  | { kind: 'more-to-find'; remaining: number }
  | { kind: 'vector-length'; expected: number }
  | { kind: 'unknown-variable'; allowed: readonly string[] }
  | { kind: 'no-answer' }

export interface CheckResult {
  verdict: Verdict
  issue?: CheckIssue
}

/** Answers from the input field are TeX (from the math field) or an option index for choices. */
export type Response = { tex: string } | { choice: number } | { self: boolean }

/** The answer written in TeX, for showing after a problem is solved or given up. */
export const answerTex = (a: Answer): string | undefined => {
  switch (a.kind) {
    case 'number':
      return formatNumber(a.value)
    case 'expression':
      return a.tex
    case 'list':
      return a.values.map(formatNumber).join(',\\ ')
    case 'vector':
      return `(${a.values.map(formatNumber).join(',\\ ')})`
    default:
      return undefined
  }
}

/** A non-integer close to p/q with a small q, as [p, q]; otherwise null. */
const asFraction = (v: number): [number, number] | null => {
  for (let q = 2; q <= 1000; q++) {
    const p = Math.round(v * q)
    if (Math.abs(p / q - v) < 1e-12 * Math.max(1, Math.abs(v))) return [p, q]
  }
  return null
}

/**
 * Integers and short decimals as they are; repeating decimals with a small denominator as fractions
 * (-\frac{5}{9}), so the shown answer is exact; anything else rounded to six places.
 */
const formatNumber = (v: number) => {
  if (Number.isInteger(v) || v === +v.toFixed(6)) return String(v)
  const f = asFraction(v)
  if (f) return `${f[0] < 0 ? '-' : ''}\\frac{${Math.abs(f[0])}}{${f[1]}}`
  return String(+v.toFixed(6))
}
